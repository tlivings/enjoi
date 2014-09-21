'use strict';

var hammer = require('hammertime'),
    tv4 = require('tv4');

var tv4Validator, schema;

schema = require('./schema.json');

hammer({
    iterations: 5000,
    before: function (done) {
        tv4Validator = tv4.freshApi();
        done();
    },
    after: function (results) {
        console.log('\ttv4:   %d operations/second.', results.ops);
    }
})
.time(function () {
    tv4Validator.validateResult({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']}, schema).valid;
});
