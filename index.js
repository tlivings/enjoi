
const Joi = require('joi');
const Hoek = require('hoek');
const SchemaResolver = require('./resolver');

const schemaSchema = Joi.alternatives(Joi.object().unknown(true), Joi.string()).required();

const optionsSchema = Joi.object({
    subSchemas: Joi.object().unknown(true).allow(null),
    types: Joi.object().unknown(true).allow(null),
    extensions: Joi.object().unknown(true).allow(null),
    refineType: Joi.func().allow(null),
    strictMode: Joi.boolean().default(false)
});

exports.schema = function (schema, options = {}) {
    const validateOptions = Joi.validate(options, optionsSchema);

    Hoek.assert(!validateOptions.error, validateOptions.error);

    const validateSchema = Joi.validate(schema, schemaSchema);

    Hoek.assert(!validateSchema.error, validateSchema.error);

    return new SchemaResolver(schema, validateOptions.value).resolve();
};