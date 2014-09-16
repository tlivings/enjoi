# enjoi

Converts a JSON schema to a Joi schema.

```javascript
var enjoi = require('enjoi');

var schema = enjoi({
    "title": "Example Schema",
    "type": "object",
    "properties": {
        "firstName": {
            "type": "string"
        },
        "lastName": {
            "type": "string"
        },
        "age": {
            "description": "Age in years",
            "type": "integer",
            "minimum": 0
        }
    },
    "required": ["firstName", "lastName"]
});
```

Will now be a Joi schema.

### API

- `enjoi` - function with arguments:
    - `schema` - a JSON schema.
    - `subSchemas` - an object with keys representing schema ids, and values representing schemas.
