
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

        Joi.validate({ firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human'] }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ firstName: '', lastName: 'Doe', age: 45, tags: ['man', 'human'] }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ firstName: 'John', age: 45, tags: ['man', 'human'] }, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({ firstName: 'John', lastName: 'Doe', age: 45, tags: [1, 'human'] }, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({ firstName: 'John', lastName: 'Doe', age: 45, tags: ['', 'human'] }, schema, function (error, value) {
            t.ok(error, 'error.');
        });
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

        Joi.validate({ name: 'Joe' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
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

        Joi.validate('string', schema, function (error) {
            t.ok(!error, 'no error.');
        });
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

        Joi.validate('string', schema, function (error) {
            t.ok(error, 'error.');
        });
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

        Joi.validate('foobar', enjoi.schema({ type: 'foo' }), function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('foobaz', schema, function (error) {
            t.ok(!error, 'no error.');
        });
    });

});
