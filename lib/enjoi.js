'use strict';

var assert = require('assert'),
    joi = require('joi'),
    thing = require('core-util-is'),
    refpath = require('./refpath');

module.exports = function enjoi(schema, subSchemas) {
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
                    thing.isNumber(current.maxItems) && (joischema = joischema.max(current.maxItems));
                    break;
                case 'boolean':
                    joischema = joi.boolean();
                    break;
                case 'integer':
                case 'number':
                    joischema = number(current);
                    break;
                case 'object':
                    joischema = joi.object(resolveproperties(current));
                    break;
                case 'string':
                    joischema = joi.string();
                    current.pattern && (joischema = joischema.regex(new RegExp(current.pattern)));
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

            schema.required && !!~schema.required.indexOf(key) && (joischema = joischema.required());

            schemas[key] = joischema;
        });

        return schemas;
    }

    function ref(value) {
        var id, refschema, path;

        id = value.substr(0, value.indexOf('#'));
        path = value.substr(value.indexOf('#') + 1);

        refschema = !id ? schema : subSchemas[id] || subSchemas[id + '#'];

        assert.ok(refschema, 'Can not find schema reference for $ref.');

        return refpath(refschema, path);
    }

    function number(current) {
        var joischema = joi.number();

        if (current.type === 'integer') {
            joischema = joischema.integer();
        }

        thing.isNumber(current.minimum) && (joischema = joischema.min(current.minimum));
        thing.isNumber(current.maximum) && (joischema = joischema.max(current.maximum));

        return joischema;
    }

    return resolve(schema);
};
