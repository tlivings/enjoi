'use strict';

var test = require('tape'),
    enjoi = require('../lib/enjoi'),
    joi = require('joi');

test('enjoi', function (t) {

    t.test('valid', function (t) {
        t.plan(3);

        var schema = enjoi({
        	'title': 'Example Schema',
        	'type': 'object',
        	'properties': {
        		'firstName': {
        			'type': 'string'
        		},
        		'lastName': {
        			'type': 'string'
        		},
                'tags': {
                    'type': 'array',
                    'items': {
                        'type': 'string'
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

        joi.validate({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        joi.validate({firstName: 'John', age: 45, tags: ['man', 'human']}, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        joi.validate({firstName: 'John', lastName: 'Doe', age: 45, tags: [1, 'human']}, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('with ref', function (t) {
        t.plan(1);

        var schema = enjoi({
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

        joi.validate({name: 'Joe'}, schema,  function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('with external ref', function (t) {
        t.plan(1);

        var schema = enjoi({
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

        joi.validate({name: 'Joe'}, schema,  function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

});

test('types', function (t) {

    t.test('object min/max length', function (t) {
        t.plan(3);

        var schema = enjoi({
            'type': 'object',
            'maxProperties': 2,
            'minProperties': 1
        });

        joi.validate({a: 'a', b: 'b'}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        joi.validate({a: 'a', b: 'b', c: 'c'}, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        joi.validate({}, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays and numbers', function (t) {
        t.plan(2);

        var schema = enjoi({
            'type': 'array',
            'items': {
                'type': 'number'
            },
            'maxItems': 10,
            'minItems': 0
        });

        joi.validate([1, 2], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        joi.validate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays and refs', function (t) {
        t.plan(2);

        var schema = enjoi({
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

        joi.validate([1, 2], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        joi.validate([1, 3], schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays and unique', function (t) {
        t.plan(2);

        var schema = enjoi({
            'type': 'array',
            'items': {
                'type': 'integer'
            },
            'uniqueItems': true
        });

        joi.validate([1, 2], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        joi.validate([1, 1], schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('boolean', function (t) {
        t.plan(2);

        var schema = enjoi({
            'type': 'boolean'
        });

        joi.validate('hello', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        joi.validate(true, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string regex', function (t) {
        t.plan(2);

        var schema = enjoi({
            'type': 'string',
            'pattern': /foobar/
        });

        joi.validate('foo', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        joi.validate('foobar', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string length', function (t) {
        t.plan(3);

        var schema = enjoi({
            'type': 'string',
            'minLength': 2,
            'maxLength': 4
        });

        joi.validate('f', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        joi.validate('foobar', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        joi.validate('foo', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('needs type or ref', function (t) {
        t.plan(2);

        t.throws(function () {
            enjoi({
                'description': 'something'
            });
        });

        t.throws(function () {
            enjoi({
                '$ref': '#/definitions/nothing',
                'definitions': {
                    'nothing': {
                        'description': 'something'
                    }
                }
            });
        });
    });

    t.test('enum', function (t) {
        t.plan(3);

        var schema = enjoi({
            'enum': ['A', 'B']
        });

        joi.validate('A', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        joi.validate('B', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        joi.validate('C', schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('unknown type fails', function (t) {
        t.plan(1);

        t.throws(function () {
            enjoi({
                'type': 'something'
            });
        });
    });

});
