'use strict';

var Test = require('tape');
var Enjoi = require('../lib/enjoi');
var Joi = require('joi');

Test('enjoi', function (t) {

    t.test('valid', function (t) {
        t.plan(9);

        var schema = Enjoi({
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

        Joi.validate({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({firstName: '', lastName: 'Doe', age: 45, tags: ['man', 'human']}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({firstName: 'John', age: 45, tags: ['man', 'human']}, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({firstName: 'John', lastName: 'Doe', age: 45, tags: [1, 'human']}, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({firstName: 'John', lastName: 'Doe', age: 45, tags: ['', 'human']}, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('with ref', function (t) {
        t.plan(1);

        var schema = Enjoi({
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

        Joi.validate({name: 'Joe'}, schema,  function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('with external ref', function (t) {
        t.plan(1);

        var schema = Enjoi({
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

        Joi.validate({name: 'Joe'}, schema,  function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('with both inline and external refs', function (t) {
        t.plan(1);

        var schema = Enjoi({
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

        Joi.validate({firstname: 'Joe', surname: 'Doe'}, schema,  function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

});

Test('types', function (t) {

    t.test('object min/max length', function (t) {
        t.plan(3);

        var schema = Enjoi({
            'type': 'object',
            'maxProperties': 2,
            'minProperties': 1
        });

        Joi.validate({a: 'a', b: 'b'}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({a: 'a', b: 'b', c: 'c'}, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({}, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays and numbers', function (t) {
        t.plan(2);

        var schema = Enjoi({
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

    t.test('arrays and refs', function (t) {
        t.plan(2);

        var schema = Enjoi({
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

    t.test('arrays and unique', function (t) {
        t.plan(2);

        var schema = Enjoi({
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
        t.plan(2);

        var schema = Enjoi({
            'type': 'boolean'
        });

        Joi.validate('hello', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate(true, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string regex', function (t) {
        t.plan(2);

        var schema = Enjoi({
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

        var schema = Enjoi({
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

        var schema = Enjoi({
            'type': 'string',
            'format': 'email',
            'maxLength': '20'
        });

        Joi.validate('wrongemail', schema, function (error, value) {
            t.ok(error, "wrong email error.");
        });

        Joi.validate('right@email.com', schema, function (error, value) {
            t.ok(!error,  "good email.");
        });


    });

     t.test('string date ISO 8601', function (t) {
        t.plan(5);

        var schema = Enjoi({
            'type': 'string',
            'format': 'date',
            'min': '1-1-2000 UTC',
            'max': Date.now()
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
            t.ok(!error,  "good date.");
        });

         Joi.validate('2005-01-01', schema, function (error, value) {
            t.ok(!error, "good date 2");
        });

    });

    t.test('no type, ref, or enum validates anything.', function (t) {
        t.plan(3);

        var schema = Enjoi({
            'description': 'something'
        });

        Joi.validate('A', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({'A': 'a'}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1, 2, 3], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('shorthand type', function (t) {
        t.plan(1);

        var schema = Enjoi('string');
        Joi.validate('A', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });


    t.test('shorthand property type', function (t) {
        t.plan(1);

        var schema = Enjoi({
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

        var schema = Enjoi({
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

        schema = Enjoi({
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
            Enjoi({
                'type': 'something'
            });
        });
    });

    t.test('anyOf', function (t) {
        t.plan(3);

        var schema = Enjoi({
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

    t.test('allOf', function (t) {
        t.plan(2);

        var schema = Enjoi({
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

        Joi.validate({a: 'string', b: 10}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({a: 'string', b: 'string'}, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('oneOf', function(t) {
      t.plan(8);

        var schema = Enjoi({
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

        Joi.validate({a: 'string'}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({b: 10}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({a: 'string', b: 10}, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({a: 'string', b: null}, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({a: null, b: 10}, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({a: null, b: null}, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({a: 'string', b: 'string'}, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('custom type', function (t) {
        t.plan(2);

        var schema = Enjoi({
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

        var schema = Enjoi({
            type: 'file'
        }, {
            types: {
                file: Enjoi({
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

        schema.validate({file: 'data', consumes: 'multipart/form-data'}, function (error, value) {
            t.ok(!error, 'no error.');
        });

        schema.validate({file: 'data', consumes: 'application/json'}, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('additionalProperties boolean', function (t) {
        t.plan(4);

        var schema = {
            type: 'object',
            properties: {
                file: {
                    type: 'string'
                }
            }
        };

        Enjoi(schema).validate({ file: 'data', consumes: 'application/json' }, function (error, value) {
            t.ok(error, 'error.');
        });

        schema.additionalProperties = false;
        Enjoi(schema).validate({ file: 'data', consumes: 'application/json' }, function (error, value) {
            t.ok(error, 'error.');
        });

        schema.additionalProperties = true;
        Enjoi(schema).validate({ file: 'data', consumes: 'application/json' }, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Enjoi(schema).validate({ file: 5, consumes: 'application/json' }, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('default values', function (t) {
        t.plan(2);

        var schema = {
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

        Enjoi(schema).validate({user: 'test@domain.tld'}, function (error, value) {
            t.ok(!error, 'error');
            t.equal(value.locale, 'en-US');
        });
    });
});
