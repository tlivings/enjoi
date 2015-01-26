'use strict';

var Hammer = require('hammertime');
var Themis = require('themis');

var schema, validator;

schema = require('./schema.json');

Hammer({
    iterations: 5000,
    before: function (done) {
        validator = Themis.validator(schema);
        done();
    },
    after: function (results) {
        console.log('\tthemis: %d operations/second. (%dms)', results.ops, (results.time / 1000) / results.iterations);
    }
})
.time(function () {
    validator({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']}, 'testSchema');
});
