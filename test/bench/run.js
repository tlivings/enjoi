'use strict';

var spawn = require('child_process').spawn,
    path = require('path');

var enjoi, tv4;

console.log('tv4 vs joi benchmark:\n');

tv4 = spawn('node', [path.resolve(__dirname, 'tv4.js')]);

tv4.stdout.pipe(process.stdout);

tv4.once('close', function () {
    enjoi = spawn('node', [path.resolve(__dirname, 'enjoi.js')]);

    enjoi.stdout.pipe(process.stdout);

    enjoi.once('close', function () {
        process.exit(0);
    });
});
