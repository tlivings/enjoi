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
