
const Test = require('tape');
const Enjoi = require('../index');
const Joi = require('joi');

Test('types', function (t) {

    t.test('object min/max length', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'object',
            'maxProperties': 2,
            'minProperties': 1
        });

        Joi.validate({ a: 'a', b: 'b' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ a: 'a', b: 'b', c: 'c' }, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate({}, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays and numbers', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'array',
            'items': {
                'type': 'number'
            },
            'maxItems': 10,
            'minItems': 0
        });

        Joi.validate([1, 2], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays with specific item type assignment', function (t) {
        t.plan(7);

        const schema = Enjoi.schema({
            'type': 'array',
            'items': [
                {
                    'type': 'number'
                }, {
                    'type': 'string'
                }
            ],
        });

        Joi.validate([1, 'abc'], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([0, 1], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(['abc', 'def'], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(['abc'], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([{ foo: 'bar' }], schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays with ordered item assignment', function (t) {
        t.plan(8);

        const schema = Enjoi.schema({
            'type': 'array',
            'ordered': [
                {
                    'type': 'number'
                }, {
                    'type': 'string'
                }
            ],
        });

        Joi.validate([1, 'abc'], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([0, 1], schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate(['abc', 'def'], schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate([1], schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(['abc'], schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate([{ foo: 'bar' }], schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate([1, 'abc', 'def'], schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('arrays and refs', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'array',
            'items': {
                '$ref': 'definitions#/number'
            }
        }, {
            subSchemas: {
                'definitions': {
                    'number': {
                        'type': 'number',
                        'minimum': 0,
                        'maximum': 2
                    }
                }
            }
        });

        Joi.validate([1, 2], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1, 3], schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('number exclusiveMinimum exclusiveMaximum', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'number',
            'exclusiveMinimum': 0,
            'exclusiveMaximum': 2,
        });

        Joi.validate(0, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate(1, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(2, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('number multipleOf', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'number',
            'multipleOf': 1.5,
        });

        Joi.validate(4, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate(4.5, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(0, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('arrays and unique', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'array',
            'items': {
                'type': 'integer'
            },
            'uniqueItems': true
        });

        Joi.validate([1, 2], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1, 1], schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('boolean', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'boolean'
        });

        Joi.validate('1', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate('true', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(true, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('boolean strictMode', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'boolean'
        }, {
            strictMode: true
        });

        Joi.validate('1', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate('true', schema, function (error, value) {
            t.ok(error, 'error in strictMode.');
        });

        Joi.validate(true, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string regex', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'pattern': /foobar/
        });

        Joi.validate('foo', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate('foobar', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string length', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'string',
            'minLength': 2,
            'maxLength': 4
        });

        Joi.validate('f', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate('foobar', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate('foo', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string email', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'email',
            'maxLength': 20
        });

        Joi.validate('wrongemail', schema, function (error, value) {
            t.ok(error, "wrong email error.");
        });

        Joi.validate('right@email.com', schema, function (error, value) {
            t.ok(!error, "good email.");
        });

    });

    t.test('string date ISO 8601', function (t) {
        t.plan(5);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'date',
            'minimum': '1-1-2000 UTC',
            'maximum': Date.now()
        });

        Joi.validate('1akd2536', schema, function (error, value) {
            t.ok(error, "wrong date format.");
        });

        Joi.validate('12-10-1900 UTC', schema, function (error, value) {
            t.ok(error, "minimum date.");
        });

        Joi.validate(Date.now() + 1000000, schema, function (error, value) {
            t.ok(error, "maximum date.");
        });

        Joi.validate('1-2-2015 UTC', schema, function (error, value) {
            t.ok(!error, "good date.");
        });

        Joi.validate('2005-01-01', schema, function (error, value) {
            t.ok(!error, "good date 2");
        });

    });

    t.test('string hostname', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'hostname'
        });

        Joi.validate('not@host', schema, function (error, value) {
            t.ok(error, "bad host error.");
        });

        Joi.validate('isahost.com', schema, function (error, value) {
            t.ok(!error, "good host.");
        });

    });

    t.test('string ipv4', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'ipv4'
        });

        Joi.validate('asdf', schema, function (error, value) {
            t.ok(error, "bad ipv4 error.");
        });

        Joi.validate('127.0.0.1', schema, function (error, value) {
            t.ok(!error, "good ipv4.");
        });

    });

    t.test('string ipv6', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'ipv6'
        });

        Joi.validate('asdf', schema, function (error, value) {
            t.ok(error, "bad ipv6 error.");
        });

        Joi.validate('::1', schema, function (error, value) {
            t.ok(!error, "good ipv6.");
        });

    });

    t.test('string uri', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'uri'
        });

        Joi.validate('asdf', schema, function (error, value) {
            t.ok(error, "bad uri error.");
        });

        Joi.validate('http://example.com', schema, function (error, value) {
            t.ok(!error, "good uri.");
        });

    });

    t.test('string binary', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'binary'
        });

        Joi.validate(new Buffer('hello'), schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1, 2, 3, 4], schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('string binary min/max', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'binary',
            minLength: 2,
            maxLength: 4
        });

        Joi.validate(new Buffer('hello'), schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate(new Buffer('h'), schema, function (error) {
            t.ok(error, 'error.');
        });

        Joi.validate(new Buffer('hell'), schema, function (error) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('string byte', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'byte'
        });

        Joi.validate('U3dhZ2dlciByb2Nrcw==', schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('hello', schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('string uuid', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'uuid'
        });

        Joi.validate('36c6e954-3c0a-4fbf-a4cd-6993ffe3bdd2', schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('not a uuid', schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('string guid', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'guid'
        });

        Joi.validate('36c6e954-3c0a-4fbf-a4cd-6993ffe3bdd2', schema, function (error) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('not a uuid', schema, function (error) {
            t.ok(error, 'error.');
        });
    });

    t.test('no type, ref, or enum validates anything.', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'description': 'something'
        });

        Joi.validate('A', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate({ 'A': 'a' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate([1, 2, 3], schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('shorthand type', function (t) {
        t.plan(1);

        const schema = Enjoi.schema('string');
        Joi.validate('A', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });


    t.test('shorthand property type', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            'type': 'object',
            'properties': {
                'name': 'string'
            }
        });

        Joi.validate({ name: 'test' }, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('enum', function (t) {
        t.plan(5);

        let schema = Enjoi.schema({
            'enum': ['A', 'B']
        });

        Joi.validate('A', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('B', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('C', schema, function (error, value) {
            t.ok(error, 'error.');
        });

        schema = Enjoi.schema({
            type: 'string',
            'enum': ['A', 'B']
        });

        Joi.validate('B', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('C', schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

    t.test('unknown type fails', function (t) {
        t.plan(1);

        t.throws(function () {
            Enjoi.schema({
                'type': 'something'
            });
        });
    });

    t.test('array for type', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': ['boolean', 'string']
        });

        Joi.validate(10, schema, function (error, value) {
            t.ok(error, 'error.');
        });

        Joi.validate(true, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate('true', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });
    });

    t.test('array for type with null support', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': ['string', 'null']
        });

        Joi.validate('test', schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(null, schema, function (error, value) {
            t.ok(!error, 'no error.');
        });

        Joi.validate(false, schema, function (error, value) {
            t.ok(error, 'error.');
        });
    });

});

