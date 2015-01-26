'use strict';

var Hammer = require('hammertime');
var Tv4 = require('tv4');

var schema;

schema = require('./schema.json');

Hammer({
    iterations: 5000,
    before: function (done) {
        done();
    },
    after: function (results) {
        console.log('\ttv4: %d operations/second. (%dms)', results.ops, (results.time / 1000) / results.iterations);
    }
})
.time(function () {
    Tv4.validateResult({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']}, schema);
});
