
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
            types: {
                binary: Joi.binary().encoding('base64')
            }
        });
        let result = schema.validate('aGVsbG8=');
        t.ok(!result.error, 'no error');
        t.equal(result.value.toString(), 'hello', 'no error');
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

        t.ok(!schema.validate('string').error);
        t.ok(schema.validate(10).error);
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

        t.ok(!schema.validate('example').error);
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

    t.ok(!schema.validate('foobar').error);
    t.ok(schema.validate('foo').error);
});
