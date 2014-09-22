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
        console.log('\tjoi: %d operations/second. (%d iterations in %dms)', results.ops, results.iterations, results.time / 1000000);
    }
})
.time(function () {
    enjoiValidator.validate({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']});
});
