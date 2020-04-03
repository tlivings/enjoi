
const Test = require('tape');
const Enjoi = require('../index');

Test('directives', function (t) {
    t.test('anyOf', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'anyOf': [
                {
                    type: 'string'
                },
                {
                    type: 'number'
                }
            ]
        });

        t.ok(!schema.validate('string').error, 'no error.');

        t.ok(!schema.validate(10).error, 'no error.');

        t.ok(schema.validate({}).error, 'error.');
    });

    t.test('oneOf', function (t) {
        t.plan(9);

        const schema = Enjoi.schema({
            'oneOf': [
                {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string'
                        }
                    }
                },
                {
                    type: 'object',
                    properties: {
                        b: {
                            type: 'number'
                        }
                    }
                }
            ]
        });

        t.ok(!schema.validate({ a: 'string' }).error, 'no error.');

        t.ok(!schema.validate({}).error, 'no error.');

        t.ok(!schema.validate(undefined).error, 'no error.');

        t.ok(!schema.validate({ b: 10 }).error, 'no error.');

        t.ok(schema.validate({ a: 'string', b: 10 }).error, 'error.');

        t.ok(schema.validate({ a: 'string', b: null }).error, 'error.');

        t.ok(schema.validate({ a: null, b: 10 }).error, 'error.');

        t.ok(schema.validate({ a: null, b: null }).error, 'error.');

        t.ok(schema.validate({ a: 'string', b: 'string' }).error, 'error.');
    });

    t.test('not', function (t) {
        t.plan(8);

        const schema = Enjoi.schema({
            'not': [
                {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string'
                        }
                    }
                },
                {
                    type: 'object',
                    properties: {
                        b: {
                            type: 'number'
                        }
                    }
                }
            ]
        });

        t.ok(schema.validate({ a: 'string' }).error, 'error.');

        t.ok(schema.validate({}).error, 'error.');

        t.ok(schema.validate({ b: 10 }).error, 'error.');

        t.ok(!schema.validate({ a: 'string', b: 10 }).error, 'no error.');

        t.ok(!schema.validate({ a: 'string', b: null }).error, 'no error.');

        t.ok(!schema.validate({ a: null, b: 10 }).error, 'no error.');

        t.ok(!schema.validate({ a: null, b: null }).error, 'no error.');

        t.ok(!schema.validate({ a: 'string', b: 'string' }).error, 'no error.');
    });

    t.test('additionalProperties boolean', function (t) {
        t.plan(4);

        const schema = {
            type: 'object',
            properties: {
                file: {
                    type: 'string'
                }
            }
        };

        t.ok(Enjoi.schema(schema).validate({ file: 'data', consumes: 'application/json' }).error, 'error.');

        schema.additionalProperties = false;
        t.ok(Enjoi.schema(schema).validate({ file: 'data', consumes: 'application/json' }).error, 'error.');

        schema.additionalProperties = true;
        t.ok(!Enjoi.schema(schema).validate({ file: 'data', consumes: 'application/json' }).error, 'no error.');

        t.ok(Enjoi.schema(schema).validate({ file: 5, consumes: 'application/json' }).error, 'error.');
    });

    t.test('default values', function (t) {
        t.plan(4);

        const schema = {
            type: 'object',
            properties: {
                user: {
                    type: 'string',
                    format: 'email'
                },
                locale: {
                    type: 'string',
                    default: 'en-US'
                },
                isSubscribed: {
                    type: 'boolean',
                    default: false
                },
                posts: {
                    type: 'number',
                    default: 0
                },
                empty: {
                    type: 'string',
                    default: ''
                }
            },
            required: ['user']
        };

        const { error, value } = Enjoi.schema(schema).validate({ user: 'test@domain.tld' });
        t.ok(!error, 'error');
        t.equal(value.locale, 'en-US');
        t.equal(value.isSubscribed, false);
        t.equal(value.posts, 0);
    });

    t.test('additionalProperties false should not allow additional properties', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'file'
        },
            {
                types: {
                    file: Enjoi.schema({
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            file: {
                                type: 'string'
                            }
                        }
                    })
                }
            });

        t.ok(schema.validate({ file: 'data', consumes: 'application/json' }).error);
    });

    t.test('additionalProperties true should allow additional properties', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'file'
        },
            {
                types: {
                    file: Enjoi.schema({
                        type: 'object',
                        additionalProperties: true,
                        properties: {
                            file: {
                                type: 'string'
                            }
                        }
                    })
                }
            });

        t.ok(!schema.validate({ file: 'data', consumes: 'application/json' }).error);
    });

    t.test('additionalProperties true should not affect validation of properties', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'file'
        },
            {
                types: {
                    file: Enjoi.schema({
                        type: 'object',
                        additionalProperties: true,
                        properties: {
                            file: {
                                type: 'string'
                            }
                        }
                    })
                }
            });

        t.ok(schema.validate({ file: 5, consumes: 'application/json' }).error);
    });

    t.test('additionalProperties object should not affect validation of properties', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'file'
        },
            {
                types: {
                    file: Enjoi.schema({
                        type: 'object',
                        additionalProperties: {
                            type: 'string'
                        },
                        properties: {
                            file: {
                                type: 'string'
                            }
                        }
                    })
                }
            });

        t.ok(!schema.validate({ file: 'asdf', consumes: 'application/json' }).error);
    });

    t.test('additionalProperties object should add to validated properties', function (t) {
        t.plan(1);

        const schema = Enjoi.schema({
            type: 'file'
        },
            {
                types: {
                    file: Enjoi.schema({
                        type: 'object',
                        additionalProperties: {
                            type: 'string'
                        },
                        properties: {
                            file: {
                                type: 'string'
                            }
                        }
                    })
                }
            });

        t.ok(schema.validate({ file: 'asdf', consumes: 5 }).error);
    });

    t.test('array additionalItems', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            type: 'array',
            items: [
                {
                    type: 'string'
                },
                {
                    type: 'number'
                }
            ],
            additionalItems: false
        });

        t.ok(!schema.validate(['test']).error, 'no error.');

        t.ok(!schema.validate(['test', 123]).error, 'no error.');

        t.ok(schema.validate(['test', 123, 'foo']).error, 'error.');
    });
});

Test('allOf', function (t) {

    t.test('allOf simple types', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            allOf: [
                {
                    type: 'string'
                },
                {
                    type: 'string',
                    maxLength: 3
                }
            ]
        });

        t.ok(!schema.validate('abc').error, 'no error.');

        t.ok(schema.validate('abcd').error, 'error.');
    });

    t.test('allOf object', function (t) {
        t.plan(3);

        const schema = Enjoi.schema({
            'allOf': [
                {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string'
                        }
                    }
                },
                {
                    type: 'object',
                    properties: {
                        b: {
                            type: 'number'
                        }
                    }
                }
            ]
        });

        t.ok(!schema.validate({ a: 'string', b: 10 }).error, 'no error.');

        const { error } = schema.validate({ a: 'string', b: 'string' });
        t.ok(error, 'error.');
        t.equal(error.details[0].message, '\"b\" must be a number');
    });

    t.test('allOf array with conflicting needs', function (t) {
        t.plan(1);

        //This should never validate due to all criteria being required to pass
        const schema = Enjoi.schema({
            'allOf': [
                {
                    type: 'array',
                    items: [
                        {
                            type: 'string'
                        }
                    ]
                },
                {
                    type: 'array',
                    items: [
                        {
                            type: 'number'
                        }
                    ]
                }
            ]
        });

        t.ok(schema.validate(['string', 10]).error, 'error.');
    });

    t.test('allOf nested', function (t) {
        t.plan(2);

        const schema = Enjoi.schema({
            title: "Organization Input",
            allOf: [
                {
                    title: "Organization Common",
                    allOf: [
                        {
                            type: "object",
                            properties: {
                                name: { type: "string", maxLength: 40 },
                                billingAddress: { type: "string", maxLength: 100 }
                            },
                            required: ["name"]
                        },
                        {
                            type: "object",
                            title: "Phone Number",
                            properties: { phoneCountryCode: { type: "string", minLength: 1 } },
                            required: ["phoneCountryCode"]
                        }
                    ]
                }
            ]
        });

        t.ok(!schema.validate({ name: 'test', phoneCountryCode: 'US' }).error, 'no error.');

        t.ok(schema.validate({ name: 'test' }).error, 'error.');
    });
});
