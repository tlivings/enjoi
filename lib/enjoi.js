'use strict';

var assert = require('assert'),
    joi = require('joi'),
    thing = require('core-util-is');

module.exports = function enjoi(schema, subSchemas) {
    assert.ok(thing.isObject(schema), 'Expected schema to be an object.');
    assert.ok(!subSchemas || thing.isObject(subSchemas), 'Expected subSchemas to be an object.');

    function resolve(current) {
        assert.ok(current.type || current.$ref || thing.isArray(current.enum), 'Schema must contain either a \'type\' or \'$ref\' or \'enum\'.');

        if (current.type) {
            return resolvetype(current);
        }

        if (current.$ref) {
            return resolve(ref(current.$ref));
        }

        if (current.enum) {
            return joi.any().valid(current.enum);
        }
    }

    function resolvetype(current) {
        var joischema;

        switch (current.type) {
            case 'array':
                joischema = joiarray(current);
                break;
            case 'boolean':
                joischema = joi.boolean();
                break;
            case 'integer':
            case 'number':
                joischema = joinumber(current);
                break;
            case 'object':
                joischema = joiobject(current);
                break;
            case 'string':
                joischema = joistring(current);
                break;
        }

        assert.ok(joischema, 'Could not resolve type: ' + current.type + '.');

        return joischema;
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

        assert.ok(refschema, 'Can not find schema reference: ' + value + '.');

        return refpath(refschema, path);
    }

    function joiobject(current) {
        var joischema = joi.object(resolveproperties(current));

        thing.isNumber(current.minProperties) && (joischema = joischema.min(current.minProperties));
        thing.isNumber(current.maxProperties) && (joischema = joischema.max(current.maxProperties));

        return joischema;
    }

    function joiarray(current) {
        var joischema = joi.array();

        if (current.items.type) {
            joischema = joischema.includes(resolve(current.items));
        }
        else if (current.items.$ref) {
            joischema = joischema.includes(resolve(ref(current.items.$ref)));
        }

        thing.isNumber(current.minItems) && (joischema = joischema.min(current.minItems));
        thing.isNumber(current.maxItems) && (joischema = joischema.max(current.maxItems));

        if (current.uniqueItems) {
            joischema = joischema.unique();
        }

        return joischema;
    }

    function joinumber(current) {
        var joischema = joi.number();

        if (current.type === 'integer') {
            joischema = joischema.integer();
        }

        thing.isNumber(current.minimum) && (joischema = joischema.min(current.minimum));
        thing.isNumber(current.maximum) && (joischema = joischema.max(current.maximum));

        return joischema;
    }

    function joistring(current) {
        var joischema = joi.string();
        current.pattern && (joischema = joischema.regex(new RegExp(current.pattern)));

        thing.isNumber(current.minLength) && (joischema = joischema.min(current.minLength));
        thing.isNumber(current.maxLength) && (joischema = joischema.max(current.maxLength));

        return joischema;
    }

    return resolve(schema);
};

function refpath(obj, path) {
    var fragment, paths;

    paths = Array.isArray(path) ? path : path.split('/');
    fragment = obj;

    for (var i = 1; i < paths.length && fragment; i++) {
        fragment = typeof fragment === 'object' && fragment[paths[i]];
    }

    return fragment;
}
