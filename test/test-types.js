
const Test = require('tape');
const Enjoi = require('../index');

Test('types', function (t) {

    t.test('object min/max length', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'object',
            'maxProperties': 2,
            'minProperties': 1
        });

        t.ok(!schema.validate({ a: 'a', b: 'b' }).error, 'no error');
        t.ok(schema.validate({ a: 'a', b: 'b', c: 'c' }).error, 'error');
        t.ok(schema.validate({}).error, 'error');
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

        t.ok(!schema.validate([1, 2]).error, 'no error');
        t.ok(schema.validate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).error, 'error');
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

        t.ok(!schema.validate([1, 'abc']).error, 'no error');
        t.ok(!schema.validate([0, 1]).error, 'no error');
        t.ok(!schema.validate(['abc', 'def']).error, 'no error');
        t.ok(!schema.validate([1]).error, 'no error');
        t.ok(!schema.validate(['abc']).error, 'no error');
        t.ok(!schema.validate([]).error, 'no error');
        t.ok(schema.validate([{ foo: 'bar' }]).error, 'error');
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

        t.ok(!schema.validate([1, 'abc']).error, 'no error');
        t.ok(!schema.validate([]).error, 'no error');
        t.ok(schema.validate([0, 1]).error, 'error');
        t.ok(schema.validate(['abc', 'def']).error, 'error');
        t.ok(!schema.validate([1]).error, 'no error');
        t.ok(schema.validate(['abc']).error, 'error');
        t.ok(schema.validate([{ foo: 'bar' }]).error, 'error');
        t.ok(schema.validate([1, 'abc', 'def']).error, 'error');
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

        t.ok(!schema.validate([1, 2]).error, 'no error');
        t.ok(schema.validate([1, 3]).error, 'error');
    });

    t.test('number exclusiveMinimum exclusiveMaximum', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'number',
            'exclusiveMinimum': 0,
            'exclusiveMaximum': 2,
        });

        t.ok(schema.validate(0).error, 'error');
        t.ok(!schema.validate(1).error, 'no error');
        t.ok(schema.validate(2).error, 'error');
    });

    t.test('number multipleOf', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'number',
            'multipleOf': 1.5,
        });

        t.ok(schema.validate(4).error, 'error');
        t.ok(!schema.validate(4.5).error, 'no error');
        t.ok(!schema.validate(0).error, 'no error');
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

        t.ok(!schema.validate([1, 2]).error, 'no error');
        t.ok(schema.validate([1, 1]).error, 'error');
    });

    t.test('boolean', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'boolean'
        });

        t.ok(schema.validate('1').error, 'error');
        t.ok(!schema.validate('true').error, 'no error');
        t.ok(!schema.validate(true).error, 'no error');
    });

    t.test('boolean strictMode', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'boolean'
        }, {
            strictMode: true
        });

        t.ok(schema.validate('1').error, 'error');
        t.ok(schema.validate('true').error, 'error in strictMode');
        t.ok(!schema.validate(true).error, 'no error');
    });

    t.test('string regex', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'string',
            'pattern': /foobar/
        });

        t.ok(schema.validate('foo').error, 'error');
        t.ok(schema.validate('').error, 'error');
        t.ok(!schema.validate('foobar').error, 'no error');
    });

    t.test('string length', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'string',
            'minLength': 2,
            'maxLength': 4
        });

        t.ok(schema.validate('f').error, 'error');
        t.ok(schema.validate('foobar').error, 'error');
        t.ok(!schema.validate('foo').error, 'no error');
    });

    t.test('string email', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'email',
            'maxLength': 20
        });

        t.ok(schema.validate('').error, 'empty string');
        t.ok(schema.validate('wrongemail').error, 'wrong email error');
        t.ok(!schema.validate('right@email.com').error, 'good email');
    });

    t.test('string date RFC3339', function (t) {
        const validDateValues = [
            '2018-11-16',
            '2018-02-31'
        ];
        const invalidDateValues = [
            '',
            '1akd2536',
            '20181116',
            '16-11-2018',
            '16-11-2018T12:12:12Z',
            '12:12:12Z'
        ];
        t.plan(validDateValues.length + invalidDateValues.length);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'date'
        });

        // Valid values
        validDateValues.forEach((time) => {
            t.ok(!schema.validate(time).error, 'should be valid');
        });

        // Invalid values
        invalidDateValues.forEach((time) => {
            t.ok(schema.validate(time).error, time + ' should be invalid');
        });
    });

    t.test('string time RFC3339', function (t) {
        const validTimeValues = [
            '12:00:00Z',
            '12:00:00+02:10',
            '12:00:00-02:10',
            '12:00:00.1Z',
            '12:00:00.123Z',
            '12:00:00.123456789Z'
        ];
        const invalidTimeValues = [
            '',
            '1akd2536',
            '2:0:0Z',
            '2:00:00Z',
            '12:00:00',
            '2018-11-16',
            '12:00:00.Z',
            '12:00:00+02',
            '12:00:00+2:00',
            '16-11-2018T12:12:12Z'
        ];
        t.plan(validTimeValues.length + invalidTimeValues.length);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'time'
        });

        // Valid values
        validTimeValues.forEach((time) => {
            t.ok(!schema.validate(time).error, time + ' should be valid');
        });

        // Invalid values
        invalidTimeValues.forEach((time) => {
            t.ok(schema.validate(time).error, time + ' should be invalid');
        });
    });

    t.test('string date-time RFC3339', function (t) {
        const validDateTimeValues = [
            '2018-11-16T12:00:00Z',
            '2018-11-16t12:00:00z',
            '2018-11-16T12:00:00+02:00',
            '2018-11-16T12:00:00-02:00',
            '2018-11-16T12:00:00.1Z',
            '2018-11-16T12:00:00.123Z',
            '2018-11-16T12:00:00.123456789Z',
        ];
        const invalidDateTimeValues = [
            '',
            '1akd2536',
            '2018-11-16',
            '12:12:12Z',
            '20181116T121212Z',
            '2018-11-16T12:00:00',
            '2018-11-16T12:00:00.Z',
        ];
        t.plan(validDateTimeValues.length + invalidDateTimeValues.length);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'date-time'
        });

        // Valid values
        validDateTimeValues.forEach((time) => {
            t.ok(!schema.validate(time).error, time + ' should be valid');
        });

        // Invalid values
        invalidDateTimeValues.forEach((time) => {
            t.ok(schema.validate(time).error, time + ' should be invalid');
        });
    });

    t.test('string hostname', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'hostname'
        });

        t.ok(schema.validate('').error, "empty string.");
        t.ok(schema.validate('not@host').error, "bad host error.");
        t.ok(!schema.validate('isahost.com').error, "good host.");
    });

    t.test('string ipv4', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'ipv4'
        });

        t.ok(schema.validate('').error, "empty string.");
        t.ok(schema.validate('asdf').error, "bad ipv4 error.");
        t.ok(!schema.validate('127.0.0.1').error, "good ipv4.");
    });

    t.test('string ipv6', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'ipv6'
        });

        t.ok(schema.validate('').error, "empty string.");
        t.ok(schema.validate('asdf').error, "bad ipv6 error.");
        t.ok(!schema.validate('::1').error, "good ipv6.");
    });

    t.test('string uri', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': 'string',
            'format': 'uri'
        });

        t.ok(schema.validate('').error, "empty string.");
        t.ok(schema.validate('asdf').error, "bad uri error.");
        t.ok(!schema.validate('http://example.com').error, "good uri.");
    });

    t.test('string binary', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'binary'
        });

        t.ok(!schema.validate(new Buffer.from('hello')).error, 'no error.');
        t.ok(schema.validate([1, 2, 3, 4]).error, 'error.');
    });

    t.test('string binary min/max', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'binary',
            minLength: 2,
            maxLength: 4
        });

        t.ok(schema.validate(new Buffer.from('hello')).error, 'error.');
        t.ok(schema.validate(new Buffer.from('h')).error, 'error.');
        t.ok(!schema.validate(new Buffer.from('hell')).error, 'no error.');
    });

    t.test('string byte', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'byte'
        });

        t.ok(!schema.validate('U3dhZ2dlciByb2Nrcw==').error, 'no error.');
        t.ok(schema.validate('hello').error, 'error.');
    });

    t.test('string uuid', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'uuid'
        });

        t.ok(!schema.validate('36c6e954-3c0a-4fbf-a4cd-6993ffe3bdd2').error, 'no error.');
        t.ok(schema.validate('').error, 'empty string.');
        t.ok(schema.validate('not a uuid').error, 'error.');
    });

    t.test('string guid', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            type: 'string',
            format: 'guid'
        });

        t.ok(!schema.validate('36c6e954-3c0a-4fbf-a4cd-6993ffe3bdd2').error, 'no error.');
        t.ok(schema.validate('').error, 'empty string.');
        t.ok(schema.validate('not a uuid').error, 'error.');
    });

    t.test('empty string', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            type: 'string'
        });

        t.ok(!schema.validate('foobar').error, 'no error.');
        t.ok(!schema.validate('').error, 'no error');
    });

    t.test('no type, ref, or enum validates anything.', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'description': 'something'
        });

        t.ok(!schema.validate('A').error, 'no error.');
        t.ok(!schema.validate({ 'A': 'a' }).error, 'no error.');
        t.ok(!schema.validate([1, 2, 3]).error, 'no error.');
    });

    t.test('shorthand type', function (t) {
        t.plan(1);

        const schema = Enjoi.schema('string');
        t.ok(!schema.validate('A').error, 'no error.');
    });


    t.test('shorthand property type', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            'type': 'object',
            'properties': {
                'name': 'string'
            }
        });

        t.ok(!schema.validate({ name: 'test' }).error, 'no error.');
    });

    t.test('enum', function (t) {
        t.plan(7);

        let schema = Enjoi.schema({
            'enum': ['A', 'B']
        });

        t.ok(!schema.validate('A').error, 'no error.');
        t.ok(!schema.validate('B').error, 'no error.');
        t.ok(schema.validate('C').error, 'error.');

        schema = Enjoi.schema({
            type: 'string',
            'enum': ['A', 'B']
        });

        t.ok(!schema.validate('B').error, 'no error.');
        t.ok(schema.validate('C').error, 'error.');

        schema = Enjoi.schema({
            type: 'string',
            enum: ['A', 'B']
        }).insensitive()

        t.ok(!schema.validate('b').error, 'no error.');
        t.ok(schema.validate('c').error, 'error.');
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

        t.ok(schema.validate(10).error, 'error.');
        t.ok(!schema.validate(true).error, 'no error.');
        t.ok(!schema.validate('true').error, 'no error.');
    });

    t.test('array for type with null support', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'type': ['string', 'null']
        });

        t.ok(!schema.validate('test').error, 'no error.');
        t.ok(!schema.validate(null).error, 'no error.');
        t.ok(schema.validate(false).error, 'error.');
    });

    t.test('recursive type', function (t) {
        t.plan(2);

        const jsonSchema = {
            type: "object",
            properties: {
                value: { type: "string" },
                next: { $ref: '#' }
            }
        }
        const schema = Enjoi.schema(jsonSchema);

        t.ok(!schema.validate({
            value: "foo",
            next: {
                value: "bar",
                next: {
                    value: "baz"
                }
            }
        }).error, 'no error');
        t.ok(schema.validate({
            value: "foo",
            next: {
                value: "bar",
                next: {
                    value: 0
                }
            }
        }).error, 'error');
    });

});

