[![Build Status](https://travis-ci.org/tlivings/enjoi.png)](https://travis-ci.org/tlivings/enjoi) [![NPM version](https://badge.fury.io/js/enjoi.png)](http://badge.fury.io/js/enjoi)

# enjoi

Converts a JSON schema to a Joi schema for object validation.

### Schema Support

`enjoi` is built against json-schema v4, but does not support all of json-schema (yet).

Here is a list of some missing keyword support still being worked on:

- `not`
- `format`
- `object:patternProperties`
- `object:additionalProperties` (supported as a boolean, not supported as a schema).
- `array:items` (supports as single schema, not supported as array of schemas).
- `array:additionalItems`

### API

- `enjoi(schema [, options])`
    - `schema` - a JSON schema.
    - `options` - an (optional) object of additional options such as `subSchemas` and custom `types`.
        - `subSchemas` - an (optional) object with keys representing schema ids, and values representing schemas.
        - `types` - an (optional) object  with keys representing type names and values representing a Joi schema.

Example:

```javascript
var Joi = require('joi');
var Enjoi = require('enjoi');

var schema = Enjoi({
    'title': 'Example Schema',
    'type': 'object',
    'properties': {
        'firstName': {
            'type': 'string'
        },
        'lastName': {
            'type': 'string'
        },
        'age': {
            'description': 'Age in years',
            'type': 'integer',
            'minimum': 0
        }
    },
    'required': ['firstName', 'lastName']
});

Joi.validate({firstName: 'John', lastName: 'Doe', age: 45}, schema, function (error, value) {
    error && console.log(error);
});
```

Can also call `validate` directly on the created schema.

```javascript
schema.validate({firstName: 'John', lastName: 'Doe', age: 45}, function (error, value) {
    error && console.log(error);
});
```

### Sub Schemas

Example:

```javascript
var schema = Enjoi({
    'title': 'Example Schema',
    'type': 'object',
    'properties': {
        'A': {
            '$ref': 'sub#/something'
        }
    }
}, {
    subSchemas: {
        'sub': {
            'something': {
                'type': 'string'
            }
        }
    }
});
```

### Custom Types

```javascript
var schema = Enjoi({
    type: 'file'
}, {
    types: {
        file: Enjoi({
            type: 'object',
            properties: {
                file: {
                    type: 'string'
                },
                consumes: {
                    type: 'string',
                    pattern: /multipart\/form-data/
                }
            }
        })
    }
});

schema.validate({file: 'data', consumes: 'multipart/form-data'}, function (error, value) {
    error && console.log(error);
});
```

### Custom error messages

to add a custom error message use the message object and overide the language key with yout message

```
messages: {
  base: the number must exist
}
```

## Language keys
```
date: {
    base: 'must be a number of milliseconds or valid date string',
    format: 'must be a string with one of the following formats {{format}}',
    strict: 'must be a valid date',
    min: 'must be larger than or equal to "{{limit}}"',
    max: 'must be less than or equal to "{{limit}}"',
    isoDate: 'must be a valid ISO 8601 date',
    timestamp: {
        javascript: 'must be a valid timestamp or number of milliseconds',
        unix: 'must be a valid timestamp or number of seconds'
    },
    ref: 'references "{{ref}}" which is not a date'
},
number: {
    base: 'must be a number',
    min: 'must be larger than or equal to {{limit}}',
    max: 'must be less than or equal to {{limit}}',
    less: 'must be less than {{limit}}',
    greater: 'must be greater than {{limit}}',
    float: 'must be a float or double',
    integer: 'must be an integer',
    negative: 'must be a negative number',
    positive: 'must be a positive number',
    precision: 'must have no more than {{limit}} decimal places',
    ref: 'references "{{ref}}" which is not a number',
    multiple: 'must be a multiple of {{multiple}}'
},
string: {
    base: 'must be a string',
    min: 'length must be at least {{limit}} characters long',
    max: 'length must be less than or equal to {{limit}} characters long',
    length: 'length must be {{limit}} characters long',
    alphanum: 'must only contain alpha-numeric characters',
    token: 'must only contain alpha-numeric and underscore characters',
    regex: {
        base: 'with value "{{!value}}" fails to match the required pattern: {{pattern}}',
        name: 'with value "{{!value}}" fails to match the {{name}} pattern',
        invert: {
            base: 'with value "{{!value}}" matches the inverted pattern: {{pattern}}',
            name: 'with value "{{!value}}" matches the inverted {{name}} pattern'
        }
    },
    email: 'must be a valid email',
    uri: 'must be a valid uri',
    uriRelativeOnly: 'must be a valid relative uri',
    uriCustomScheme: 'must be a valid uri with a scheme matching the {{scheme}} pattern',
    isoDate: 'must be a valid ISO 8601 date',
    guid: 'must be a valid GUID',
    hex: 'must only contain hexadecimal characters',
    base64: 'must be a valid base64 string',
    hostname: 'must be a valid hostname',
    lowercase: 'must only contain lowercase characters',
    uppercase: 'must only contain uppercase characters',
    trim: 'must not have leading or trailing whitespace',
    creditCard: 'must be a credit card',
    ref: 'references "{{ref}}" which is not a number',
    ip: 'must be a valid ip address with a {{cidr}} CIDR',
    ipVersion: 'must be a valid ip address of one of the following versions {{version}} with a {{cidr}} CIDR'
}
```
