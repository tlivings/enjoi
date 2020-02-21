
const Joi = require('@hapi/joi');
const Util = require('util');
const Hoek = require('@hapi/hoek');

class SchemaResolver {
    constructor(root, { subSchemas, types, refineType, strictMode, extensions = [] }) {
        this.root = root;
        this.types = types;
        this.subSchemas = subSchemas;
        this.refineType = refineType;
        this.strictMode = strictMode;

        extensions.push({
            name: 'allOf',
            rules: [{
                name: 'items',
                params: {
                    items: Joi.array().items(Joi.object()).required()
                },
                validate(params, value, state, options) {
                    options = Hoek.applyToDefaults(options, { allowUnknown: true });

                    for (const schema of params.items) {
                        const { error } = schema.validate(value, options);
                        if (error) {
                            const details = error.details[0];
                            return this.createOverrideError(details.type, details.context, { path : details.path }, options, details.message);
                        }
                    }
                    return value;
                }
            }]
        });

        this.joi = Joi.extend(extensions);
    }

    resolve(schema = this.root) {
        if (schema.type) {
            return this.resolveType(schema);
        }

        if (schema.anyOf) {
            return this.resolveAnyOf(schema);
        }

        if (schema.allOf) {
            return this.resolveAllOf(schema.allOf);
        }

        if (schema.oneOf) {
            return this.resolveOneOf(schema);
        }

        if (schema.not) {
            return this.resolveNot(schema);
        }

        if (schema.$ref) {
            return this.resolve(this.resolveReference(schema.$ref));
        }

        //if no type is specified, just enum
        if (schema.enum) {
            return this.joi.any().valid(schema.enum);
        }

        // If schema is itself a string, interpret it as a type
        if (typeof schema === 'string') {
            return this.resolveType({ type: schema });
        }

        //Fall through to whatever.
        //eslint-disable-next-line no-console
        console.warn('WARNING: schema missing a \'type\' or \'$ref\' or \'enum\': \n%s', JSON.stringify(schema, null, 2));
        //TODO: Handle better
        return this.joi.any();
    }

    resolveReference(value) {
        let refschema;

        const id = value.substr(0, value.indexOf('#') + 1);
        const path = value.substr(value.indexOf('#') + 1);

        if (id && this.subSchemas) {
            refschema = this.subSchemas[id] || this.subSchemas[id.substr(0, id.length - 1)];
        }
        if (!refschema) {
            refschema = this.root;
        }

        Hoek.assert(refschema, 'Can not find schema reference: ' + value + '.');

        let fragment = refschema;
        const paths = path.split('/');

        for (let i = 1; i < paths.length && fragment; i++) {
            fragment = typeof fragment === 'object' && fragment[paths[i]];
        }

        return fragment;
    }

    resolveType(schema) {
        let joischema;

        const typeDefinitionMap = {
            description: 'description',
            title: 'label',
            default: 'default'
        };

        const joitype = (type, format) => {
            let joischema;

            if (this.refineType) {
                type = this.refineType(type, format);
            }

            switch (type) {
                case 'array':
                    joischema = this.array(schema);
                    break;
                case 'boolean':
                    joischema = this.joi.boolean();
                    break;
                case 'integer':
                case 'number':
                    joischema = this.number(schema);
                    break;
                case 'object':
                    joischema = this.object(schema);
                    break;
                case 'string':
                    joischema = this.string(schema);
                    break;
                case 'null':
                    joischema = this.joi.any().valid(null);
                    break;
                default:
                    if (this.types) {
                        const customType = this.types[type];
                        if (Util.isFunction(customType)) {
                            joischema = customType.call(this.joi, schema);
                        }
                        else {
                            joischema = customType;
                        }
                    }
            }

            Hoek.assert(joischema, 'Could not resolve type: ' + schema.type + '.');

            return joischema.strict(this.strictMode);
        }

        if (Util.isArray(schema.type)) {
            const schemas = [];

            for (let i = 0; i < schema.type.length; i++) {
                schemas.push(joitype(schema.type[i], schema.format));
            }

            joischema = this.joi.alternatives(schemas);
        }
        else {
            joischema = joitype(schema.type, schema.format);
        }

        Object.keys(typeDefinitionMap).forEach(function (key) {
            if (schema[key] !== undefined) {
                joischema = joischema[typeDefinitionMap[key]](schema[key]);
            }
        });

        return joischema;
    }

    resolveOneOf(schema) {
        Hoek.assert(Util.isArray(schema.oneOf), 'Expected allOf to be an array.');

        return this.joi.alternatives().try(schema.oneOf.map((schema) => {
            return this.resolve(schema);
        }));
    }

    resolveAnyOf(schema) {
        Hoek.assert(Util.isArray(schema.anyOf), 'Expected anyOf to be an array.');

        return this.joi.alternatives().try(schema.anyOf.map((schema) => {
            return this.resolve(schema);
        }));
    }

    resolveAllOf(items) {
        Hoek.assert(Util.isArray(items), 'Expected allOf to be an array.');

        return this.joi.allOf().items(items.map((item) => this.resolve(item)));
    }

    resolveNot(schema) {
        Hoek.assert(Util.isArray(schema.not), 'Expected Not to be an array.');

        return this.joi.alternatives().when(Joi.alternatives().try(schema.not.map((schema) => {
            return this.resolve(schema);
        })), {then: this.joi.any().forbidden(), otherwise: this.joi.any()});
    }

    object(schema) {

        const resolveproperties = () => {
            const schemas = {};

            if (!Util.isObject(schema.properties)) {
                return;
            }

            Object.keys(schema.properties).forEach((key) => {
                const property = schema.properties[key];

                let joischema = this.resolve(property);

                if (schema.required && !!~schema.required.indexOf(key)) {
                    joischema = joischema.required();
                }

                schemas[key] = joischema;
            });

            return schemas;
        }

        let joischema = this.joi.object(resolveproperties(schema));

        if (schema.additionalProperties === true) {
            joischema = joischema.unknown(true);
        }

        if (Util.isObject(schema.additionalProperties)) {
            joischema = joischema.pattern(/^/, this.resolve(schema.additionalProperties));
        }

        Util.isNumber(schema.minProperties) && (joischema = joischema.min(schema.minProperties));
        Util.isNumber(schema.maxProperties) && (joischema = joischema.max(schema.maxProperties));

        return joischema;
    }

    array(schema) {
        let joischema = this.joi.array();
        let items;

        const resolveAsArray = (value) => {
            if (Util.isArray(value)) {
                // found an array, thus its _per type_
                return value.map((v) => this.resolve(v));
            }
            // it's a single entity, so just resolve it normally
            return [this.resolve(value)];
        }

        if (schema.items) {
            items = resolveAsArray(schema.items);

            joischema = joischema.items(items);
        }
        else if (schema.ordered) {
            items = resolveAsArray(schema.ordered);
            joischema = joischema.ordered(items);
        }

        if (items && schema.additionalItems === false) {
            joischema = joischema.max(items.length);
        }

        Util.isNumber(schema.minItems) && (joischema = joischema.min(schema.minItems));
        Util.isNumber(schema.maxItems) && (joischema = joischema.max(schema.maxItems));

        if (schema.uniqueItems) {
            joischema = joischema.unique();
        }

        return joischema;
    }

    number(schema) {
        let joischema = this.joi.number();

        if (schema.type === 'integer') {
            joischema = joischema.integer();
        }

        Util.isNumber(schema.minimum) && (joischema = joischema.min(schema.minimum));
        Util.isNumber(schema.maximum) && (joischema = joischema.max(schema.maximum));
        Util.isNumber(schema.exclusiveMinimum) && (joischema = joischema.greater(schema.exclusiveMinimum));
        Util.isNumber(schema.exclusiveMaximum) && (joischema = joischema.less(schema.exclusiveMaximum));
        Util.isNumber(schema.multipleOf) && schema.multipleOf !== 0 && (joischema = joischema.multiple(schema.multipleOf));

        return joischema;
    }

    string(schema) {
        let joischema = this.joi.string();

        const dateRegex ='(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])';
        const timeRegex = '([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(.[0-9]+)?(Z|(\\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))';
        const dateTimeRegex = dateRegex + 'T' + timeRegex;

        if (schema.enum) {
            return this.joi.any().valid(schema.enum);
        }

        switch (schema.format) {
            case 'date':
                return joischema.regex(new RegExp('^' + dateRegex + '$', 'i'), 'JsonSchema date format');
            case 'time':
                return joischema.regex(new RegExp('^' + timeRegex + '$', 'i'), 'JsonSchema time format');
            case 'date-time':
                return joischema.regex(new RegExp('^' + dateTimeRegex + '$', 'i'), 'JsonSchema date-time format');
            case 'binary':
                joischema = this.binary(schema);
                break;
            case 'email':
                return joischema.email();
            case 'hostname':
                return joischema.hostname();
            case 'ipv4':
                return joischema.ip(['ipv4']);
            case 'ipv6':
                return joischema.ip(['ipv6']);
            case 'uri':
                return joischema.uri();
            case 'byte':
                joischema = joischema.base64();
                break;
            case 'uuid':
                return joischema.guid({ version: ['uuidv4'] });
            case 'guid':
                return joischema.guid();
        }
        return this.regularString(schema, joischema);
    }

    regularString(schema, joischema) {
        schema.pattern && (joischema = joischema.regex(new RegExp(schema.pattern)));

        if (Util.isUndefined(schema.minLength)) {
            schema.minLength = 0;
        }
        else if (schema.minLength === 0) {
            joischema = joischema.allow('');
        }
        Util.isNumber(schema.minLength) && (joischema = joischema.min(schema.minLength));
        Util.isNumber(schema.maxLength) && (joischema = joischema.max(schema.maxLength));
        return joischema;
    }

    binary(schema) {
        let joischema = this.joi.binary();
        Util.isNumber(schema.minLength) && (joischema = joischema.min(schema.minLength));
        Util.isNumber(schema.maxLength) && (joischema = joischema.max(schema.maxLength));
        return joischema;
    }
}

module.exports = SchemaResolver;
