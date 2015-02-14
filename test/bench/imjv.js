'use strict';

var Hammer = require('hammertime');
var imjv = require('is-my-json-valid');

var schema, validator;

schema = require('./schema.json');

Hammer({
    iterations: 5000,
    before: function (done) {
        validator = imjv(schema);
        done();
    },
    after: function (results) {
        console.log('\tis-my-json-valid: %d operations/second. (%dms)', results.ops, (results.time / 1000) / results.iterations);
    }
})
.time(function () {
    validator({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']});
});
