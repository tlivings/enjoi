![Build](https://github.com/tlivings/enjoi/workflows/Node.js%20CI/badge.svg) [![NPM version](https://badge.fury.io/js/enjoi.png)](http://badge.fury.io/js/enjoi)

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

Custom types can be provided through the `extensions` option.

```javascript
const schema = Enjoi.schema({
    type: 'thing'
}, {
    extensions: [{
        type: 'thing',
        base: Joi.any()
    }]
});
```

Also with functions.

```javascript
const schema = Enjoi.schema({
    type: 'thing'
}, {
    extensions: [{
        type: 'thing',
        validate(value, helpers) {
            if (value !== 'foobar') {
                return { value, errors: helpers.error('thing.foobar') };
            }
        },
        messages: {
            'thing.foobar': '{#label} must be \'foobar\''
        }
    }]
});
```

### Refine Type

You can use the refine type function to help refine types based on `type` and `format`. This will allow transforming a type for lookup. 

```javascript
const schema = Enjoi.schema({
    type: 'string',
    format: 'email'
}, {
    extensions: [{
        type: 'email',
        base: Joi.string().email()
    }],
    refineType(type, format) {
        if (type === 'string' && format === 'email') {
            return 'email';
        }
    }
});
```

This can be used in conjunction with function based `extensions` for additional logic:

```javascript
const schemaDesc = {
    type: 'string',
    format: 'email',
    'x-test': true
}
const schema = Enjoi.schema(schemaDesc, {
    extensions: [{
        type: 'email',
        validate(value, helpers) {
            const validator = schemaDesc['x-test'] ? Joi.string().email().equal('test@example.com') : Joi.string().email();
            const validation = validator.validate(value);
            if (validation.error) {
                return { value, errors: validation.error };
            }
        }
    }],
    refineType(type, format) {
        if (type === 'string' && format === 'email') {
            return 'email';
        }
    }
});
```

### Extensions

Refer to Joi documentation on extensions: https://hapi.dev/module/joi/api/?v=17#extensions
