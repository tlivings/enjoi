'use strict';

var Hammer = require('hammertime');
var Enjoi = require('../../lib/enjoi');

var validator, schema;

schema = require('./schema.json');

Hammer({
    iterations: 5000,
    before: function (done) {
        validator = Enjoi(schema);
        done();
    },
    after: function (results) {
        console.log('\tjoi: %d operations/second. (%dms)', results.ops, (results.time / 1000) / results.iterations);
    }
})
.time(function () {
    validator.validate({firstName: 'John', lastName: 'Doe', age: 45, tags: ['man', 'human']});
});
