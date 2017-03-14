### v2.2.1

* Add default value (#30).

### v2.2.0

* Added support for directly passing a `string` instead of a schema to indicate type.

### v2.1.0

* added support for mapping title (to label in joi).
* added support for mapping description.
* fixed engine version.

### v2.0.0

* updated `joi` to ^9.
* requires node 4 minimum.

### v1.0.4

* when undefined `minLength` should default to 0.

### v1.0.3

* Validate when `additionalProperties` is boolean.

### v1.0.2

* Support for `oneOf`.

### v1.0.1

* Support for `format` in string types.

### v1.0.0

* [BREAKING] `subSchemas` is now passed as a property in `options`.
* Support for custom types using `options.types`.
