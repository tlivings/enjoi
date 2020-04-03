

### 6.0.2

* Correct usage of @hapi/joi `validate` function. joiSchema.validate(obj) instead of Joi.validate(obj, joiSchema).

### 6.0.1

* #83 differentiate between undefined and falsy
* #73 updated fix

### 6.0.0

* Do not set empty string as valid for all string types (#73)
* Updated joi and hoek to latest, drop Node 6 support (#76)

### v5.0.1

* #69

### v5.0.1

* #66

### v5.0.0

* [BREAKING] Addresses #63 : date format to follow RFC3339 as per JSON-Schema.

### v4.1.1

* Fixes `oneOf` requiring (#61).

### v4.1.0

* Added support for string formats `uuid` (v4) and `guid`.

### v4.0.0

* [BREAKING] export interface changed. Call `Enjoi.schema` instead of `Enjoi`.
* [BREAKING] `joi` is a peer.
* Added `extensions` support.
* `types` can also contain function values to do complex resolving of custom types.
* Added support for `Enjoi.defaults` which returns a new Enjoi with default options.

### v3.2.5

* Fixed allOf support (#53)

### v3.2.4

* Support for allOf
* Bug fixes

### v3.2.3

* Security fix to resolve https://nodesecurity.io/advisories/566

### v3.2.2

* Documentation fixes.

### v3.2.1

* Support array:additionalItems false setting.

### v3.2.0

* Added `strictMode` support and resolves #34.

### v3.1.0

* Added a refineType function option.

### v3.0.0

* [BREAKING] supports Joi 13.x (required Node 6+)
* Fixed additional properties https://github.com/tlivings/enjoi/pull/31
* Adds support for ordered and items https://github.com/tlivings/enjoi/pull/38

### v2.2.4

* Fixes mutating `options` to add `stripUnknown`.

### v2.2.3

* Fix #25 by supporting array for type (e.g. ['string', 'null']).
* Additional formats: hostname, uri, ipv4, ipv6.

### v2.2.2

* Added @jsdevel's additionalProperties (#14) fixes (thanks!)

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
