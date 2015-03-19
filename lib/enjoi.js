'use strict';

var Assert = require('assert');
var Joi = require('joi');
var Thing = require('core-util-is');

module.exports = function enjoi(schema, subSchemas) {

    Assert.ok(Thing.isObject(schema), 'Expected schema to be an object.');
    Assert.ok(!subSchemas || Thing.isObject(subSchemas), 'Expected subSchemas to be an object.');

    function resolve(current) {
        if (current.type) {
            return resolvetype(current);
        }

        if (current.$ref) {
            return resolve(refresolver(current.$ref));
        }

        if (current.enum) {
            return Joi.any().valid(current.enum);
        }

        //Fall through to whatever.
        console.warn('WARNING: schema missing a \'type\' or \'$ref\' or \'enum\': %s', JSON.stringify(current));
        return Joi.any();
    }

    function refresolver(value) {
        var id, refschema, path, fragment, paths;

        id = value.substr(0, value.indexOf('#') + 1);
        path = value.substr(value.indexOf('#') + 1);

        if (id && subSchemas) {
            refschema = subSchemas[id] || subSchemas[id.substr(0, id.length - 1)];
        }
        if (!refschema) {
            refschema = schema;
        }

        Assert.ok(refschema, 'Can not find schema reference: ' + value + '.');

        fragment = refschema;
        paths = path.split('/');

        for (var i = 1; i < paths.length && fragment; i++) {
            fragment = typeof fragment === 'object' && fragment[paths[i]];
        }

        return fragment;
    }

    function resolvetype(current) {
        var joischema;

        switch (current.type) {
            case 'array':
                joischema = array(current);
                break;
            case 'boolean':
                joischema = Joi.boolean();
                break;
            case 'integer':
            case 'number':
                joischema = number(current);
                break;
            case 'object':
                joischema = object(current);
                break;
            case 'string':
                joischema = string(current);
                break;
        }

        Assert.ok(joischema, 'Could not resolve type: ' + current.type + '.');

        return joischema;
    }

    function resolveproperties(current) {
        var schemas = {};

        if (!Thing.isObject(current.properties)) {
            return;
        }

        Object.keys(current.properties).forEach(function (key) {
            var joischema, property;

            property = current.properties[key];

            joischema = resolve(property);

            if (current.required && !!~current.required.indexOf(key)) {
                joischema = joischema.required();
            }

            schemas[key] = joischema;
        });

        return schemas;
    }

    function object(current) {
        var joischema = Joi.object(resolveproperties(current));

        Thing.isNumber(current.minProperties) && (joischema = joischema.min(current.minProperties));
        Thing.isNumber(current.maxProperties) && (joischema = joischema.max(current.maxProperties));

        return joischema;
    }

    function array(current) {
        var joischema = Joi.array();

        joischema = joischema.includes(resolve(current.items));

        Thing.isNumber(current.minItems) && (joischema = joischema.min(current.minItems));
        Thing.isNumber(current.maxItems) && (joischema = joischema.max(current.maxItems));

        if (current.uniqueItems) {
            joischema = joischema.unique();
        }

        return joischema;
    }

    function number(current) {
        var joischema = Joi.number();

        if (current.type === 'integer') {
            joischema = joischema.integer();
        }

        Thing.isNumber(current.minimum) && (joischema = joischema.min(current.minimum));
        Thing.isNumber(current.maximum) && (joischema = joischema.max(current.maximum));

        return joischema;
    }

    function string(current) {
        var joischema = Joi.string();
        current.pattern && (joischema = joischema.regex(new RegExp(current.pattern)));

        if (Thing.isNumber(current.minLength)) {
            if (current.minLength === 0) {
                joischema = joischema.allow('');
            }
            joischema = joischema.min(current.minLength);
        }

        Thing.isNumber(current.maxLength) && (joischema = joischema.max(current.maxLength));

        return joischema;
    }

    return resolve(schema);
};
