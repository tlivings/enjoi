
const Test = require('tape');
const Enjoi = require('../index');
const Joi = require('joi');

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
                    }
                    default:
                        return type;
                }
            },
            types: {
                binary: Joi.binary().encoding('base64')
            }
        });

        Joi.validate('aGVsbG8=', schema, function (error, value) {
            t.ok(!error, 'no error.');
            t.equal(value.toString(), 'hello');
        });
    });

    t.test('custom type', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'custom'
        }, {
                types: {
                    custom: Joi.string()
                }
            });

        Joi.validate('string', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(10, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('type function', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'test',
            'x-value': 'example'
        }, {
            types: {
                test(schema) {
                    return this.string().allow(schema['x-value']);
                }
            }
        });

        Joi.validate('example', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('custom complex type', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'file'
        }, {
            types: {
                file: Enjoi.schema({
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
            }
        });

        schema.validate({ file: 'data', consumes: 'multipart/form-data' }, function (error, value) {
            t.ok(!error, 'no error.');
        });

        schema.validate({ file: 'data', consumes: 'application/json' }, function (error, value) {
            t.ok(error, 'error.');
        });
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

        Joi.validate({ name: 'Joe' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
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

        Joi.validate({ firstname: 'Joe', surname: 'Doe' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

});

Test('extensions', function (t) {
    t.plan(2);

    const schema = Enjoi.schema({
        'type': 'foo'
    }, {
        extensions: [
            {
                name: 'string',
                language: {
                    foo: 'needs to be \'foobar\''
                },
                rules: [{
                    name: 'foo',
                    validate(params, value, state, options) {
                        return value === 'foobar' || this.createError('string.foo', null, state, options);
                    }
                }]
            }
        ],
        types: {
            foo() {
                return this.string().foo();
            }
        }
    });

    Joi.validate('foobar', schema, function (error, value) {
        t.ok(!error, 'no error.');
    });

    Joi.validate('foo', schema, function (error, value) {
        t.ok(error, 'error.');
    });
});