'use strict';

var hammer = require('hammertime'),
    tv4 = require('tv4');

var schema;

schema = require('./schema.json');

hammer({
    iterations: 5000,
    before: function (done) {
        done();
    },
    after: function (results) {
        console.log('\ttv4: %d operations/second. (%dms)', results.ops, (results.time / 1000) / results.iterations);
    }
})
.time(function () {
    tv4.validateResult({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']}, schema);
});
