
const Test = require('tape');
const Enjoi = require('../index');
const Joi = require('@hapi/joi');

Test('enjoi', function (t) {

    t.test('valid', function (t) {
        t.plan(9);

        const schema = Enjoi.schema({
            'title': 'Example Schema',
            'description': 'An example to test against.',
            'type': 'object',
            'properties': {
                'firstName': {
                    'type': 'string',
                    'minLength': 0
                },
                'lastName': {
                    'type': 'string',
                    'minLength': 1
                },
                'tags': {
                    'type': 'array',
                    'items': {
                        'type': 'string',
                        'minLength': 1
                    }
                },
                'age': {
                    'type': 'integer',
                    'minimum': 0
                }
            },
            'required': ['firstName', 'lastName']
        });

        t.equal(schema._type, 'object', 'defined object.');
        t.equal(schema._flags.label, 'Example Schema');
        t.equal(schema._description, 'An example to test against.', 'description set.');
        t.equal(schema._inner.children.length, 4, '4 properties defined.');

        t.ok(!schema.validate({ firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human'] }).error, 'no error.');

        t.ok(!schema.validate({ firstName: '', lastName: 'Doe', age: 45, tags: ['man', 'human'] }).error, 'no error.');

        t.ok(schema.validate({ firstName: 'John', age: 45, tags: ['man', 'human'] }).error, 'error.');

        t.ok(schema.validate({ firstName: 'John', lastName: 'Doe', age: 45, tags: [1, 'human'] }).error, 'error.');

        t.ok(schema.validate({ firstName: 'John', lastName: 'Doe', age: 45, tags: ['', 'human'] }).error, 'error.');
    });

    t.test('with ref', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            'title': 'Example Schema',
            'type': 'object',
            'properties': {
                'name': {
                    '$ref': '#/definitions/name'
                }
            },
            'definitions': {
                'name': {
                    'type': 'string'
                }
            }
        });

        t.ok(!schema.validate({ name: 'Joe' }).error, 'no error.');
    });

});

Test('enjoi defaults', function (t) {

    t.test('defaults', function (t) {
        t.plan(1);

        const enjoi = Enjoi.defaults({
            types: {
                test: Joi.string()
            }
        });

        const schema = enjoi.schema({
            type: 'test'
        });

        t.ok(!schema.validate('string').error, 'no error.');
    });

    t.test('overrides', function (t) {
        t.plan(1);

        const enjoi = Enjoi.defaults({
            types: {
                test: Joi.string()
            }
        });

        const schema = enjoi.schema({
            type: 'test'
        }, {
            types: {
                test: Joi.number()
            }
        });

        t.ok(schema.validate('string').error, 'error.');
    });

    t.test('overrides extensions', function (t) {
        t.plan(2);

        const enjoi = Enjoi.defaults({
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

        const schema = enjoi.schema({
            type: 'baz'
        }, {
            extensions: [
                {
                    name: 'string',
                    language: {
                        baz: 'needs to be \'foobaz\''
                    },
                    rules: [{
                        name: 'baz',
                        validate(params, value, state, options) {
                            return value === 'foobaz' || this.createError('string.baz', null, state, options);
                        }
                    }]
                }
            ],
            types: {
                baz() {
                    return this.string().baz();
                }
            }
        });

        t.ok(!enjoi.schema({ type: 'foo' }).validate('foobar').error, 'no error.');

        t.ok(!schema.validate('foobaz').error, 'no error.');
    });
});
