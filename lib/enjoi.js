'use strict';

var assert = require('assert'),
    joi = require('joi'),
    thing = require('core-util-is'),
    refpath = require('./refpath'),
    utils = require('./utils');

module.exports = enjoi;

function enjoi(schema) {
    var types;

    assert.ok(schema.type === 'object', 'Expected type to be \'object\'.');

    if (schema.properties) {
        types = {};

        Object.keys(schema.properties).forEach(function (key) {
            var type, property;

            property = schema.properties[key];

            type = property.type ? joitype(property) : property.$ref && (type = joitype(refpath(schema, property.$ref)));

            assert.ok(type, 'Unknown type.');

            utils.contains(schema.required || [], key) && (type = type.required());

            types[key] = type;
        });
    }

    return joi.object(types);
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
            type = enjoi(property);
            break;
        case 'string':
            type = joi.string();
            property.pattern && (type = type.regex(property.pattern));
            break;
    }
    return type;
}
