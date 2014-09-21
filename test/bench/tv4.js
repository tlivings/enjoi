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
        console.log('\ttv4:   %d operations/second. (%d iterations in %dms)', results.ops, results.iterations, results.time / 1000000);
    }
})
.time(function () {
    tv4Validator.validateResult({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']}, schema).valid;
});
