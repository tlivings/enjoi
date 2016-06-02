'use strict';

var Assert = require('assert');
var Joi = require('joi');
var Thing = require('core-util-is');

module.exports = function enjoi(schema, options) {
    var subSchemas, types;

    options = options || {};

    Assert.ok(Thing.isObject(schema), 'Expected schema to be an object.');
    Assert.ok(Thing.isObject(options), 'Expected options to be an object.');

    subSchemas = options.subSchemas;
    types = options.types;

    Assert.ok(!subSchemas || Thing.isObject(subSchemas), 'Expected options.subSchemas to be an object.');
    Assert.ok(!types || Thing.isObject(types), 'Expected options.types to be an object.');

    function resolve(current) {
        if (current.type) {
            return resolvetype(current);
        }

        if (current.anyOf) {
            return resolveAnyOf(current);
        }

        if (current.allOf) {
            return resolveAllOf(current);
        }

        if (current.oneOf) {
            return resolveOneOf(current);
        }

        if (current.$ref) {
            return resolve(resolveref(current.$ref));
        }

        //if no type is specified, just enum
        if (current.enum) {
            return Joi.any().valid(current.enum);
        }

        //Fall through to whatever.
        console.warn('WARNING: schema missing a \'type\' or \'$ref\' or \'enum\': %s', JSON.stringify(current));
        return Joi.any();
    }

    function resolveref(value) {
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
            default:
                if (types) {
                    joischema = types[current.type];
                }
        }

        Assert.ok(joischema, 'Could not resolve type: ' + current.type + '.');

        return joischema;
    }

    function resolveAnyOf(current) {
        Assert.ok(Thing.isArray(current.anyOf), 'Expected anyOf to be an array.');

        return Joi.alternatives().try(current.anyOf.map(function (schema) {
            return resolve(schema);
        }));
    }

    function resolveAllOf(current) {
        Assert.ok(Thing.isArray(current.allOf), 'Expected allOf to be an array.');

        return new All().try(current.allOf.map(function (schema) {
            return resolve(schema);
        }));
    }

    function resolveOneOf(current) {
        Assert.ok(Thing.isArray(current.oneOf), 'Expected allOf to be an array.');

        return Joi.alternatives().try(current.oneOf.map(function (schema) {
            return resolve(schema);
        })).required();
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

        if (current.additionalProperties === true) {
            joischema = joischema.unknown(true);
        }

        Thing.isNumber(current.minProperties) && (joischema = joischema.min(current.minProperties));
        Thing.isNumber(current.maxProperties) && (joischema = joischema.max(current.maxProperties));

        return joischema;
    }

    function array(current) {
        var joischema = Joi.array();

        joischema = joischema.items(resolve(current.items));

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

        if (current.enum) {
            return Joi.any().valid(current.enum);
        }

        switch (current.format) {
            case 'date':
            case 'date-time':
                joischema = date(current);
                break;
            case 'email':
                joischema = email(current);
                break;
            default:
                joischema = regularString(current);
                break;
        }
        return joischema;
    }

    function regularString(current) {
        var joischema = Joi.string();
        current.pattern && (joischema = joischema.regex(new RegExp(current.pattern)));
        
        if (Thing.isUndefined(current.minLength)) {
          current.minLength = 0;
        }
        
        if (Thing.isNumber(current.minLength)) {
            if (current.minLength === 0) {
                joischema = joischema.allow('');
            }
            joischema = joischema.min(current.minLength);
        }

        Thing.isNumber(current.maxLength) && (joischema = joischema.max(current.maxLength));
        return joischema;
    }

    function email(current) {
        var joischema = Joi.string().email();
        Thing.isNumber(current.maxLength) && (joischema = joischema.max(current.maxLength));
        return joischema;
    }

    function date(current) {
        var joischema = Joi.date();
        current.min && (joischema = joischema.min(current.min));
        current.max && (joischema = joischema.max(current.max));
        return joischema;
    }

    return resolve(schema);
};


function All() {
    All.super_.call(this);
    this._type = 'all';
    this._invalids.remove(null);
    this._inner.matches = [];
}

require('util').inherits(All, Object.getPrototypeOf(require('joi/lib/alternatives')).constructor);

All.prototype._base = function (value, state, options) {
    var errors = [];
    var results = [];

    if (!options) {
        options = {};
    }

    options.stripUnknown = true;

    for (var i = 0, il = this._inner.matches.length; i < il; ++i) {
        var item = this._inner.matches[i];
        var schema = item.schema;
        if (!schema) {
            var failed = item.is._validate(item.ref(state.parent, options), null, options, state.parent).errors;
            schema = failed ? item.otherwise : item.then;
            if (!schema) {
                continue;
            }
        }

        var result = schema._validate(value, state, options);

        if (!result.errors) {
            results.push(result.value);
        }
        else {
            errors = errors.concat(result.errors);
        }
    }

    return { value: value, errors: errors };
};
