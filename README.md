[![Build Status](https://travis-ci.org/tlivings/enjoi.png)](https://travis-ci.org/tlivings/enjoi) [![NPM version](https://badge.fury.io/js/enjoi.png)](http://badge.fury.io/js/enjoi)

# enjoi

Converts a JSON schema to a Joi schema for object validation.

### Schema Support

`enjoi` is built against json-schema v4, but does not support all json-schema properties
(sometimes due to lack of support in Joi).

Here is a list of some missing keyword support still being worked on:

- `enum`
- `allOf`
- `anyOf`
- `oneOf`
- `not`
- `format`
- `object:patternProperties`
- `object:additionalProperties`
- `object:maxProperties`
- `object:minProperties`
- `array:items` (supports as schema, not supported as array).
- `array:additionalItems`

### API

- `enjoi` - function with arguments:
    - `schema` - a JSON schema.
    - `subSchemas` - an object with keys representing schema ids, and values representing schemas.

Example:

```javascript
var Joi = require('joi'),
    enjoi = require('enjoi');

var schema = enjoi({
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
var schema = enjoi({
    'title': 'Example Schema',
    'type': 'object',
    'properties': {
        'A': {
            '$ref': 'sub#/something'
        }
    }
}, {
    'sub': {
        'something': {
            'type': 'string'
        }
    }
});
```

### Performance

Joi's validation is very fast. `enjoi` is meant to be used to prepare a schema in advance of
validation; not alongside validation.

You can run a benchmark against `tv4` by running the following command.

```shell
$ npm run bench
$
$ tv4 vs joi benchmark:
$ 	tv4:   48744 operations/second.
$ 	enjoi: 114419 operations/second.
```
