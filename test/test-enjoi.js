'use strict';

var test = require('tape'),
    enjoi = require('../lib/enjoi'),
    joi = require('joi');

test('enjoi', function (t) {

    t.test('valid schema', function (t) {
        t.plan(1);

        var schema = enjoi({
        	"title": "Example Schema",
        	"type": "object",
        	"properties": {
        		"firstName": {
        			"type": "string"
        		},
        		"lastName": {
        			"type": "string"
        		},
        		"age": {
        			"description": "Age in years",
        			"type": "integer",
        			"minimum": 0
        		}
        	},
        	"required": ["firstName", "lastName"]
        });

        joi.validate({firstName: "John", lastName: "Doe", age: 45}, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('valid with ref', function (t) {
        t.plan(1);

        var schema = enjoi({
            "title": "Example Schema",
            "type": "object",
            "properties": {
                "name": {
                    "$ref": "#/definitions/name"
                }
            },
            "definitions": {
                "name": {
                    "type": "string"
                }
            }
        });

        joi.validate({name: 'Joe'}, schema,  function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

});
