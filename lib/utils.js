'use strict';

module.exports = {
    contains: function (array, value) {
        return !!~array.indexOf(value);
    }
};
