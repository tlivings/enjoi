'use strict';

var assert = require('assert'),
    joi = require('joi'),
    thing = require('core-util-is'),
    refpath = require('./refpath'),
    utils = require('./utils');

module.exports = enjoi;

function enjoi(schema) {
    var joischema, schemaproperties;

    schemaproperties = {};

    Object.keys(schema.properties).forEach(function (key) {
        var type, property;

        property = schema.properties[key];

        if (property.type) {
            type = thing.isObject(property.type) ? enjoi(property.type) : joitype(property);
        }
        else if (property.$ref) {
            type = joitype(refpath(schema, property.$ref));
        }

        assert.ok(type, 'Unknown type.');

        utils.contains(schema.required || [], key) && (type = type.required());

        schemaproperties[key] = type;
    });

    joischema = joi.object(schemaproperties);

    return joischema;
}

function joitype(property) {
    var type;

    switch (property.type) {
        case 'array':
            type = joi.array().includes(property.items.type);
            thing.isNumber(property.minItems) && (type = type.min(property.minItems));
            thing.isNumber(property.maxItems) && (type = type.min(property.maxItems));
            break;
        case 'boolean':
            type = joi.boolean();
            break;
        case 'integer':
            type = joi.number().integer();
            thing.isNumber(property.minimum) && (type = type.min(property.minimum));
            thing.isNumber(property.maximum) && (type = type.min(property.maximum));
            break;
        case 'number':
            type = joi.number();
            thing.isNumber(property.minimum) && (type = type.min(property.minimum));
            thing.isNumber(property.maximum) && (type = type.min(property.maximum));
            break;
        case 'object':
            type = joi.object();
            break;
        case 'string':
            type = joi.string();
            property.pattern && (type = type.regex(property.pattern));
            break;
    }
    return type;
}
