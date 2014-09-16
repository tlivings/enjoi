'use strict';

var assert = require('assert'),
    joi = require('joi'),
    thing = require('core-util-is'),
    refpath = require('./refpath'),
    utils = require('./utils');

module.exports = enjoi;

function enjoi(schema, subSchemas) {
    assert.ok(thing.isObject(schema), 'Expected schema to be an object.');
    assert.ok(!subSchemas || thing.isObject(subSchemas));

    function resolve(current) {
        var joischema;

        if (current.type) {
            switch (current.type) {
                case 'array':
                    joischema = joi.array();

                    if (current.items.type) {
                        joischema = joischema.includes(resolve(current.items));
                    }
                    else if (current.items.$ref) {
                        joischema = joischema.includes(resolve(ref(current.items.$ref)));
                    }

                    thing.isNumber(current.minItems) && (joischema = joischema.min(current.minItems));
                    thing.isNumber(current.maxItems) && (joischema = joischema.min(current.maxItems));
                    break;
                case 'boolean':
                    joischema = joi.boolean();
                    break;
                case 'integer':
                    joischema = joi.number().integer();
                    thing.isNumber(current.minimum) && (joischema = joischema.min(current.minimum));
                    thing.isNumber(current.maximum) && (joischema = joischema.min(current.maximum));
                    break;
                case 'number':
                    joischema = joi.number();
                    thing.isNumber(current.minimum) && (joischema = joischema.min(current.minimum));
                    thing.isNumber(current.maximum) && (joischema = joischema.min(current.maximum));
                    break;
                case 'object':
                    joischema = joi.object(resolveproperties(current));
                    break;
                case 'string':
                    joischema = joi.string();
                    current.pattern && (joischema = joischema.regex(current.pattern));
                    break;
            }

            return joischema;
        }

        if (current.$ref) {
            return resolve(ref(current.$ref));
        }
    }

    function resolveproperties(current) {
        var schemas = {};

        if (!thing.isObject(current.properties)) {
            return;
        }

        Object.keys(current.properties).forEach(function (key) {
            var joischema, property;

            property = current.properties[key];

            joischema = resolve(property);

            assert.ok(joischema, 'Unknown type.');

            utils.contains(schema.required || [], key) && (joischema = joischema.required());

            schemas[key] = joischema;
        });

        return schemas;
    }

    function ref(value) {
        var id, refschema;

        id = value.substr(0, value.indexOf('#'));

        refschema = !id ? schema : subSchemas[id] || subSchemas[id + '#'];

        assert.ok(refschema, 'Can not find schema reference for $ref.');

        return refpath(refschema, value.substr(value.indexOf('#') + 1));
    }

    return resolve(schema);
}
