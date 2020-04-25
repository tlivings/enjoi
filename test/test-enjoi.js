
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

        t.equal(schema.type, 'object', 'defined object.');
        t.equal(schema._flags.label, 'Example Schema');
        t.equal(schema._flags.description, 'An example to test against.', 'description set.');
        t.equal(schema._ids._byKey.size, 4, '4 properties defined.');

        t.ok(!schema.validate({ firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human'] }).error, 'no error');
        t.ok(!schema.validate({ firstName: '', lastName: 'Doe', age: 45, tags: ['man', 'human'] }).error, 'no error');
        t.ok(schema.validate({ firstName: 'John', age: 45, tags: ['man', 'human'] }).error, 'error');
        t.ok(schema.validate({ firstName: 'John', lastName: 'Doe', age: 45, tags: [1, 'human'] }).error, 'error');
        t.ok(schema.validate({ firstName: 'John', lastName: 'Doe', age: 45, tags: ['', 'human'] }).error, 'error');
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

        t.ok(!schema.validate({ name: 'Joe' }).error, 'no error');
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

        t.ok(!schema.validate('string').error, 'no error');
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

        t.ok(schema.validate('string').error, 'error');
    });
});

Test.only('enjoi extensions', function (t) {
    t.test('overrides extensions', function (t) {
        t.plan(5);

        const enjoi = Enjoi.defaults({
            extensions: [
                {
                    type: 'special',
                    base: Joi.string(),
                    rules: {
                        hello: {
                            validate(value, helpers, args, options) {

                                if (value === 'hello') {
                                    return value;
                                }

                                return helpers.error('special.hello');
                            }
                        }
                    },
                    messages: {
                        'special.hello': '{{#label}} must say hello'
                    }
                }
            ]
        });

        const options = {
            extensions: [{
                type: 'foobar',
                rules: {
                    foo: {
                        validate(value, helpers, args, options) {
                            return null;
                        }
                    },
                    bar: {
                        validate(value, helpers, args, options) {
                            return helpers.error('special.bar');
                        }
                    }
                },
                messages: {
                    'special.bar': '{#label} oh no bar !'
                }
            }]
        };

        t.ok(!enjoi.schema({ type: 'special' }, options).hello().validate('hello').error, 'no error');
        t.ok(enjoi.schema({ type: 'special' }, options).hello().validate('greetings').error, 'error');
        t.throws(() => enjoi.schema({ type: 'foo' }, options), 'exception');

        t.ok(!enjoi.schema({ type: 'foobar' }, options).foo().validate('hello').error, 'no error');
        t.ok(enjoi.schema({ type: 'foobar' }, options).bar().validate('greetings').error, 'error');
    });

});
