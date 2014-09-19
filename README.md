[![Build Status](https://travis-ci.org/tlivings/enjoi.png)](https://travis-ci.org/tlivings/enjoi) [![NPM version](https://badge.fury.io/js/enjoi.png)](http://badge.fury.io/js/enjoi)

# enjoi

Converts a JSON schema to a Joi schema.

**Stability:** `unstable`

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

Joi.validate({ firstName: 'John', lastName: 'Doe', age: 45}, function (error, value) {
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
