[![Build Status](https://travis-ci.org/tlivings/enjoi.png)](https://travis-ci.org/tlivings/enjoi) [![NPM version](https://badge.fury.io/js/enjoi.png)](http://badge.fury.io/js/enjoi)

# enjoi

Converts a JSON schema to a Joi schema for object validation.

### Schema Support

`enjoi` does not support all of json-schema.

Here is a list of some known missing keyword support still being worked on:

- `object:patternProperties` - unsupported due to Joi limitations.

Please file issues for other unsupported features.

### API

- `enjoi.schema(schema [, options])`
    - `schema` - a JSON schema or a string type representation (such as `'integer'`).
    - `options` - an (optional) object of additional options such as `subSchemas` and custom `types`.
- `enjoi.defaults(options)` - configure defaults `options` to be used with all `enjoi.schema` calls. `enjoi.schema` options passed will always override defaults set here.

### Options

- `subSchemas` - an (optional) object with keys representing schema ids, and values representing schemas.
- `types` - an (optional) object  with keys representing type names and values representing a Joi type. Values can also be functions that are expected to return Joi types. These functions have a context bound to the Joi being used by Enjoi and a single argument, `schema`, which represents the current schema being evaluated.
- `refineType(type, format)` - an (optional) function to call to apply to type based on the type and format of the JSON schema.
- `extensions` - an array of extensions to pass [joi.extend](https://github.com/hapijs/joi/blob/master/API.md#extendextension).
- `strictMode` - make schemas `strict(value)` with a default value of `false`.

Example:

```javascript
const Joi = require('@hapi/joi');
const Enjoi = require('enjoi');

const schema = Enjoi.schema({
    type: 'object',
    properties: {
        firstName: {
            description: 'First name.',
            type: 'string'
        },
        lastName: {
            description: 'Last name.',
            type: 'string'
        },
        age: {
            description: 'Age in years',
            type: 'integer',
            minimum: 1
        }
    },
    'required': ['firstName', 'lastName']
});

const { error, value } = schema.validate({firstName: 'John', lastName: 'Doe', age: 45});
```

### Sub Schemas

Sub-schemas can be provided through the `subSchemas` option for `$ref` values to lookup against.

Example:

```javascript
const schema = Enjoi.schema({
    type: 'object',
    properties: {
        a: {
            $ref: '#/b' // # is root schema
        },
        b: {
            type: 'string'
        },
        c: {
            $ref: 'sub#/d' // sub# is 'sub' under subSchemas.
        }
    }
}, {
    subSchemas: {
        sub: {
            d: {
                'type': 'string'
            }
        }
    }
});
```

### Defaults

The above example `subSchemas` can be added instead via defaults:

```javascript

const enjoi = Enjoi.defaults({
    subSchemas: {
        sub: {
            d: {
                'type': 'string'
            }
        }
    }
});

const schema = enjoi.schema({
    type: 'object',
    properties: {
        a: {
            $ref: '#/b' // # is root schema
        },
        b: {
            type: 'string'
        },
        c: {
            $ref: 'sub#/d' // sub# is 'sub' under subSchemas.
        }
    }
});
```

### Custom Types

Custom types can be provided through the `types` option.

```javascript
const schema = Enjoi.schema({
    type: 'thing'
}, {
    types: {
        thing: Joi.any()
    }
});
```

Also with functions.

```javascript
const schema = Enjoi.schema({
    type: 'thing'
}, {
    types: {
        thing(/* schema */) {
            return this.any();
        }
    }
});
```

### Refine Type

You can use the refine type function to help refine types based on `type` and `format`. This will allow transforming a type for lookup against the custom `types`.

```javascript
const schema = Enjoi.schema({
    type: 'string',
    format: 'email'
}, {
    types: {
        email: Joi.string().email()
    },
    refineType(type, format) {
        if (type === 'string' && format === 'email') {
            return 'email';
        }
    }
});
```

This can be used in conjunction with function based `type` definitions for additional logic:

```javascript
const schema = Enjoi.schema({
    type: 'string',
    format: 'email',
    'x-test': true
}, {
    types: {
        email(schema) {
            return schema['x-test'] ? : Joi.string().email().allow('test@example.com') : Joi.string().email()
        }
    },
    refineType(type, format) {
        if (type === 'string' && format === 'email') {
            return 'email';
        }
    }
});
```

### Extensions

Example:

```javascript
const schema = Enjoi.schema({
    type: 'foo'
}, {
    extensions: [
        {
            name: 'string',
            language: {
                foobar: 'needs to be \'foobar\''
            },
            rules: [{
                name: 'foobar',
                validate(params, value, state, options) {
                    return value === 'foobar' || this.createError('string.foobar', null, state, options);
                }
            }]
        }
    ]
});
```
