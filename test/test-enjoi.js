'use strict';

const Test = require('tape');
const Enjoi = require('../index');
const Joi = require('joi');

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

Test('types', function (t) {

    t.test('object min/max length', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'object',
            'maxProperties': 2,
            'minProperties': 1
        });

        Joi.validate({ a: 'a', b: 'b' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ a: 'a', b: 'b', c: 'c' }, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({}, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays and numbers', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'array',
            'items': {
                'type': 'number'
            },
            'maxItems': 10,
            'minItems': 0
        });

        Joi.validate([1, 2], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays with specific item type assignment', function (t) {
        t.plan(7);

        const schema = Enjoi.schema({
            'type': 'array',
            'items': [
                {
                    'type': 'number'
                }, {
                    'type': 'string'
                }
            ],
        });

        Joi.validate([1, 'abc'], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([0, 1], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(['abc', 'def'], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(['abc'], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([{ foo: 'bar' }], schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays with ordered item assignment', function (t) {
        t.plan(8);

        const schema = Enjoi.schema({
            'type': 'array',
            'ordered': [
                {
                    'type': 'number'
                }, {
                    'type': 'string'
                }
            ],
        });

        Joi.validate([1, 'abc'], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([0, 1], schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate(['abc', 'def'], schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate([1], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(['abc'], schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate([{ foo: 'bar' }], schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate([1, 'abc', 'def'], schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays and refs', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'array',
            'items': {
                '$ref': 'definitions#/number'
            }
        }, {
            subSchemas: {
                'definitions': {
                    'number': {
                        'type': 'number',
                        'minimum': 0,
                        'maximum': 2
                    }
                }
            }
        });

        Joi.validate([1, 2], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1, 3], schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('number exclusiveMinimum exclusiveMaximum', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'number',
            'exclusiveMinimum': 0,
            'exclusiveMaximum': 2,
        });

        Joi.validate(0, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate(1, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(2, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('number multipleOf', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'number',
            'multipleOf': 1.5,
        });

        Joi.validate(4, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate(4.5, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(0, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('arrays and unique', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'array',
            'items': {
                'type': 'integer'
            },
            'uniqueItems': true
        });

        Joi.validate([1, 2], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1, 1], schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('boolean', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'boolean'
        });

        Joi.validate('1', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate('true', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(true, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('boolean strictMode', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'boolean'
        }, {
            strictMode: true
        });

        Joi.validate('1', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate('true', schema, function (error, value) {
            t.ok(error, 'error in strictMode.');
        });

        Joi.validate(true, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string regex', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'pattern': /foobar/
        });

        Joi.validate('foo', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate('foobar', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string length', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'string',
            'minLength': 2,
            'maxLength': 4
        });

        Joi.validate('f', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate('foobar', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate('foo', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string email', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'email',
            'maxLength': 20
        });

        Joi.validate('wrongemail', schema, function (error, value) {
            t.ok(error, "wrong email error.");
        });

        Joi.validate('right@email.com', schema, function (error, value) {
            t.ok(!error, "good email.");
        });

    });

    t.test('string date ISO 8601', function (t) {
        t.plan(5);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'date',
            'minimum': '1-1-2000 UTC',
            'maximum': Date.now()
        });

        Joi.validate('1akd2536', schema, function (error, value) {
            t.ok(error, "wrong date format.");
        });

        Joi.validate('12-10-1900 UTC', schema, function (error, value) {
            t.ok(error, "minimum date.");
        });

        Joi.validate(Date.now() + 1000000, schema, function (error, value) {
            t.ok(error, "maximum date.");
        });

        Joi.validate('1-2-2015 UTC', schema, function (error, value) {
            t.ok(!error, "good date.");
        });

        Joi.validate('2005-01-01', schema, function (error, value) {
            t.ok(!error, "good date 2");
        });

    });

    t.test('string hostname', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'hostname'
        });

        Joi.validate('not@host', schema, function (error, value) {
            t.ok(error, "bad host error.");
        });

        Joi.validate('isahost.com', schema, function (error, value) {
            t.ok(!error, "good host.");
        });

    });

    t.test('string ipv4', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'ipv4'
        });

        Joi.validate('asdf', schema, function (error, value) {
            t.ok(error, "bad ipv4 error.");
        });

        Joi.validate('127.0.0.1', schema, function (error, value) {
            t.ok(!error, "good ipv4.");
        });

    });

    t.test('string ipv6', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'ipv6'
        });

        Joi.validate('asdf', schema, function (error, value) {
            t.ok(error, "bad ipv6 error.");
        });

        Joi.validate('::1', schema, function (error, value) {
            t.ok(!error, "good ipv6.");
        });

    });

    t.test('string uri', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'uri'
        });

        Joi.validate('asdf', schema, function (error, value) {
            t.ok(error, "bad uri error.");
        });

        Joi.validate('http://example.com', schema, function (error, value) {
            t.ok(!error, "good uri.");
        });

    });

    t.test('string binary', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'binary'
        });

        Joi.validate(new Buffer('hello'), schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1, 2, 3, 4], schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('string binary min/max', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'binary',
            minLength: 2,
            maxLength: 4
        });

        Joi.validate(new Buffer('hello'), schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate(new Buffer('h'), schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate(new Buffer('hell'), schema, function (error) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string byte', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'byte'
        });

        Joi.validate('U3dhZ2dlciByb2Nrcw==', schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('hello', schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('no type, ref, or enum validates anything.', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'description': 'something'
        });

        Joi.validate('A', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ 'A': 'a' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1, 2, 3], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('shorthand type', function (t) {
        t.plan(1);

        const schema = Enjoi.schema('string');
        Joi.validate('A', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });


    t.test('shorthand property type', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            'type': 'object',
            'properties': {
                'name': 'string'
            }
        });

        Joi.validate({ name: 'test' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('enum', function (t) {
        t.plan(5);

        let schema = Enjoi.schema({
            'enum': ['A', 'B']
        });

        Joi.validate('A', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('B', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('C', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        schema = Enjoi.schema({
            type: 'string',
            'enum': ['A', 'B']
        });

        Joi.validate('B', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('C', schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('unknown type fails', function (t) {
        t.plan(1);

        t.throws(function () {
            Enjoi.schema({
                'type': 'something'
            });
        });
    });

    t.test('array for type', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': ['boolean', 'string']
        });

        Joi.validate(10, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate(true, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('true', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('array for type with null support', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': ['string', 'null']
        });

        Joi.validate('test', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(null, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(false, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

});

Test('directives', function (t) {
    t.test('anyOf', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'anyOf': [
                {
                    type: 'string'
                },
                {
                    type: 'number'
                }
            ]
        });

        Joi.validate('string', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(10, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({}, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('oneOf', function (t) {
        t.plan(8);

        const schema = Enjoi.schema({
            'oneOf': [
                {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string'
                        }
                    }
                },
                {
                    type: 'object',
                    properties: {
                        b: {
                            type: 'number'
                        }
                    }
                }
            ]
        });

        Joi.validate({ a: 'string' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ b: 10 }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ a: 'string', b: 10 }, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({ a: 'string', b: null }, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({ a: null, b: 10 }, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({ a: null, b: null }, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({ a: 'string', b: 'string' }, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('not', function (t) {
        t.plan(8);

        const schema = Enjoi.schema({
            'not': [
                {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string'
                        }
                    }
                },
                {
                    type: 'object',
                    properties: {
                        b: {
                            type: 'number'
                        }
                    }
                }
            ]
        });

        Joi.validate({ a: 'string' }, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({}, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({ b: 10 }, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({ a: 'string', b: 10 }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ a: 'string', b: null }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ a: null, b: 10 }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ a: null, b: null }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ a: 'string', b: 'string' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('additionalProperties boolean', function (t) {
        t.plan(4);

        const schema = {
            type: 'object',
            properties: {
                file: {
                    type: 'string'
                }
            }
        };

        Enjoi.schema(schema).validate({ file: 'data', consumes: 'application/json' }, function (error, value) {
            t.ok(error, 'error.');
        });

        schema.additionalProperties = false;
        Enjoi.schema(schema).validate({ file: 'data', consumes: 'application/json' }, function (error, value) {
            t.ok(error, 'error.');
        });

        schema.additionalProperties = true;
        Enjoi.schema(schema).validate({ file: 'data', consumes: 'application/json' }, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Enjoi.schema(schema).validate({ file: 5, consumes: 'application/json' }, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('default values', function (t) {
        t.plan(2);

        const schema = {
            type: 'object',
            properties: {
                user: {
                    type: 'string',
                    format: 'email'
                },
                locale: {
                    type: 'string',
                    default: 'en-US'
                }
            },
            required: ['user']
        };

        Enjoi.schema(schema).validate({ user: 'test@domain.tld' }, function (error, value) {
            t.ok(!error, 'error');
            t.equal(value.locale, 'en-US');
        });
    });

    t.test('additionalProperties false should not allow additional properties', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'file'
        },
        {
            types: {
                file: Enjoi.schema({
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        file: {
                            type: 'string'
                        }
                    }
                })
            }
        });

        schema.validate({ file: 'data', consumes: 'application/json' }, function (error, value) {
            t.ok(error);
        });
    });

    t.test('additionalProperties true should allow additional properties', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'file'
        },
        {
            types: {
                file: Enjoi.schema({
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                        file: {
                            type: 'string'
                        }
                    }
                })
            }
        });

        schema.validate({ file: 'data', consumes: 'application/json' }, function (error, value) {
            t.ok(!error);
        });
    });

    t.test('additionalProperties true should not affect validation of properties', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'file'
        },
        {
            types: {
                file: Enjoi.schema({
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                        file: {
                            type: 'string'
                        }
                    }
                })
            }
        });

        schema.validate({ file: 5, consumes: 'application/json' }, function (error, value) {
            t.ok(error);
        });
    });

    t.test('additionalProperties object should not affect validation of properties', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'file'
        },
        {
            types: {
                file: Enjoi.schema({
                    type: 'object',
                    additionalProperties: {
                        type: 'string'
                    },
                    properties: {
                        file: {
                            type: 'string'
                        }
                    }
                })
            }
        });

        schema.validate({ file: 'asdf', consumes: 'application/json' }, function (error, value) {
            t.ok(!error);
        });
    });

    t.test('additionalProperties object should add to validated properties', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'file'
        },
        {
            types: {
                file: Enjoi.schema({
                    type: 'object',
                    additionalProperties: {
                        type: 'string'
                    },
                    properties: {
                        file: {
                            type: 'string'
                        }
                    }
                })
            }
        });

        schema.validate({ file: 'asdf', consumes: 5 }, function (error, value) {
            t.ok(error);
        });
    });
});

Test('allOf', function (t) {

    t.test('allOf simple types', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            allOf: [
                {
                    type: 'string'
                },
                {
                    type: 'string',
                    maxLength: 3
                }
            ]
        });

        Joi.validate('abc', schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('abcd', schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('allOf object', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'allOf': [
                {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string'
                        }
                    }
                },
                {
                    type: 'object',
                    properties: {
                        b: {
                            type: 'number'
                        }
                    }
                }
            ]
        });

        Joi.validate({ a: 'string', b: 10 }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ a: 'string', b: 'string' }, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('allOf array with conflicting needs', function (t) {
        t.plan(1);

        //This should never validate due to all criteria being required to pass
        const schema = Enjoi.schema({
            'allOf': [
                {
                    type: 'array',
                    items: [
                        {
                            type: 'string'
                        }
                    ]
                },
                {
                    type: 'array',
                    items: [
                        {
                            type: 'number'
                        }
                    ]
                }
            ]
        });

        Joi.validate([ 'string', 10 ], schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('allOf nested', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            title: "Organization Input",
            allOf: [
                {
                    title: "Organization Common",
                    allOf: [
                        {
                            type: "object",
                            properties: {
                                name: { type: "string", maxLength: 40 },
                                billingAddress: { type: "string", maxLength: 100 }
                            },
                            required: ["name"]
                        },
                        {
                            type: "object",
                            title: "Phone Number",
                            properties: { phoneCountryCode: { type: "string", minLength: 1 } },
                            required: ["phoneCountryCode"]
                        }
                    ]
                }
            ]
        });

        Joi.validate({ name: 'test', phoneCountryCode: 'US' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ name: 'test' }, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('array additionalItems', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            type: 'array',
            items: [
                {
                    type: 'string'
                },
                {
                    type: 'number'
                }
            ],
            additionalItems: false
        });

        Joi.validate(['test'], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(['test', 123], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(['test', 123, 'foo'], schema, function (error, value) {
            t.ok(error, 'error.');
        });

    });
})

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