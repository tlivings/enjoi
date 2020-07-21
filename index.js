const Joi = require('joi');
const Hoek = require('@hapi/hoek');
const Util = require('util');
const SchemaResolver = require('./lib/resolver');

const schemaSchema = Joi.alternatives(Joi.object().unknown(true), Joi.string()).required();

const optionsSchema = Joi.object({
    subSchemas: Joi.object().unknown(true).allow(null),
    extensions: Joi.array().items(Joi.object().unknown(true)).allow(null),
    refineType: Joi.func().allow(null),
    refineSchema: Joi.func().allow(null),
    strictMode: Joi.boolean().default(false),
});

const validate = function (schema, options = {}) {
    const validateOptions = optionsSchema.validate(options);

    Hoek.assert(!validateOptions.error, validateOptions.error);

    const validateSchema = schemaSchema.validate(schema);

    Hoek.assert(!validateSchema.error, validateSchema.error);

    return validateOptions.value;
};

exports.defaults = function (defaults = {}) {
    return {
        schema(schema, options = {}) {
            const merged = {
                subSchemas: Object.assign({}, defaults.subSchemas, options.subSchemas),
                extensions: defaults.extensions || [],
                refineType: options.refineType || defaults.refineType,
                refineSchema: options.refineSchema || defaults.refineSchema,
                strictMode: options.strictMode || defaults.strictMode
            };
            if (Util.isArray(options.extensions)) {
                merged.extensions = merged.extensions.concat(options.extensions);
            }
            options = validate(schema, merged);
            return new SchemaResolver(schema, options).resolve();
        }
    };
};

exports.schema = function (schema, options = {}) {
    options = validate(schema, options);
    return new SchemaResolver(schema, options).resolve();
};
