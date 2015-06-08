'use strict';

var Test = require('tape');
var Enjoi = require('../lib/enjoi');
var Joi = require('joi');

Test('enjoi', function (t) {

    t.test('valid', function (t) {
        t.plan(5);

        var schema = Enjoi({
        	'title': 'Example Schema',
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
        			'description': 'Age in years',
        			'type': 'integer',
        			'minimum': 0
        		}
        	},
        	'required': ['firstName', 'lastName']
        });

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
            'definitions': {
                'surname': {
                    'type': 'string'
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
            'definitions': {
                'number': {
                    'type': 'number',
                    'minimum': 0,
                    'maximum': 2
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

    t.test('enum', function (t) {
        t.plan(3);

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


});
