'use strict';

var hammer = require('hammertime'),
    enjoi = require('../../lib/enjoi');

var enjoiValidator, schema;

schema = require('./schema.json');

hammer({
    iterations: 5000,
    before: function (done) {
        enjoiValidator = enjoi(schema);
        done();
    },
    after: function (results) {
        console.log('\tjoi: %d operations/second. (%dms)', results.ops, (results.time / 1000) / results.iterations);
    }
})
.time(function () {
    enjoiValidator.validate({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']});
});
