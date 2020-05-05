
const Test = require('tape');
const Enjoi = require('../index');
const Joi = require('@hapi/joi');

Test('options features', function (t) {

    t.test('refineType', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'binary'
        }, {
            refineType(type, format) {
                switch (type) {
                    case 'string': {
                        if (format === 'binary') {
                            return 'binary'
                        }
                        break;
                    }
                    default:
                        return type;
                }
            },
            extensions: [{
                type: 'binary',
                base: Joi.binary().encoding('base64')
            }]
        });
        let result = schema.validate('aGVsbG8=');
        t.ok(!result.error, 'no error');
        t.equal(result.value.toString(), 'hello', 'no error');
    });

    t.test('custom type', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'test'
        }, {
            extensions: [{
                type: 'test',
                base: Joi.string()
            }]
        });

        t.ok(!schema.validate('string').error);
        t.ok(schema.validate(10).error);
    });

    t.test('type function', function (t) {
        t.plan(3);

        const schemaDesc = {
            type: 'test',
            'x-value': 'example'
        };
        const schema = Enjoi.schema(schemaDesc, {
            extensions: [{
                type: 'test',
                validate(value, helpers) {
                    const validation = Joi.string().max(3).allow(schemaDesc['x-value']).validate(value);
                    if (validation.error) {
                        return { value, errors: validation.error };
                    }
                }
            }]
        });

        t.ok(schema.validate('test').error);
        t.ok(!schema.validate('abc').error);
        t.ok(!schema.validate('example').error);
    });

    t.test('custom complex type', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'file'
        },
            {
                extensions: [{
                    type: 'file',
                    base: Enjoi.schema({
                        type: 'object',
                        properties: {
                            file: {
                                type: 'string'
                            },
                            consumes: {
                                type: 'string',
                                pattern: /multipart\/form-data/
                            }
                        }
                    })
                }]
            });

        t.ok(!schema.validate({ file: 'data', consumes: 'multipart/form-data' }).error);
        t.ok(schema.validate({ file: 'data', consumes: 'application/json' }).error);
    });

    t.test('with external ref', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            'title': 'Example Schema',
            'type': 'object',
            'properties': {
                'name': {
                    '$ref': 'definitions#/name'
                }
            }
        }, {
            subSchemas: {
                'definitions': {
                    'name': {
                        'type': 'string'
                    }
                }
            }
        });

        t.ok(!schema.validate({ name: 'Joe' }).error);
    });

    t.test('with both inline and external refs', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            'title': 'Example Schema',
            'type': 'object',
            'properties': {
                'firstname': {
                    '$ref': '#/definitions/firstname'
                },
                'surname': {
                    '$ref': 'definitions#/surname'
                }
            },
            'definitions': {
                'firstname': {
                    'type': 'string'
                }
            }
        }, {
            subSchemas: {
                'definitions': {
                    'surname': {
                        'type': 'string'
                    }
                }
            }
        });

        t.ok(!schema.validate({ firstname: 'Joe', surname: 'Doe' }).error);
    });

});

Test('extensions', function (t) {
    t.test('base', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'thing'
        }, {
            extensions: [{
                type: 'thing',
                base: Joi.any()
            }]
        });

        t.ok(!schema.validate('foo').error);
        t.ok(!schema.validate('foobar').error);
    });

    t.test('function', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'thing'
        }, {
            extensions: [{
                type: 'thing',
                validate(value, helpers) {
                    if (value !== 'foobar') {
                        return { value, errors: helpers.error('thing.foobar') };
                    }
                },
                messages: {
                    'thing.foobar': '{#label} must be \'foobar\''
                }
            }]
        });

        t.ok(schema.validate('foo').error);
        t.ok(!schema.validate('foobar').error);
    });

    t.test('refineType', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'email'
        }, {
            extensions: [{
                type: 'email',
                base: Joi.string().email()
            }],
            refineType(type, format) {
                if (type === 'string' && format === 'email') {
                    return 'email';
                }
            }
        });

        t.ok(!schema.validate('root@example.org').error);
        t.ok(schema.validate('foobar').error);
    })  
    
    t.test('function and refineType', function (t) {
        t.plan(3);

        const schemaDesc = {
            type: 'string',
            format: 'email',
            'x-test': true
        }
        const schema = Enjoi.schema(schemaDesc, {
            extensions: [{
                type: 'email',
                validate(value, helpers) {
                    const validator = schemaDesc['x-test'] ? Joi.string().email().equal('test@example.com') : Joi.string().email();
                    const validation = validator.validate(value);
                    if (validation.error) {
                        return { value, errors: validation.error };
                    }
                }
            }],
            refineType(type, format) {
                if (type === 'string' && format === 'email') {
                    return 'email';
                }
            }
        });

        t.ok(schema.validate('root@example.org').error);
        t.ok(!schema.validate('test@example.com').error);
        t.ok(schema.validate('foobar').error);
    })   
});
