'use strict';

module.exports = function refpath(obj, path) {
	var fragment, paths;

	paths = Array.isArray(path) ? path : path.split('/');
	fragment = obj;

	for (var i = 1; i < paths.length && fragment; i++) {
		fragment = typeof fragment === 'object' && fragment[paths[i]];
	}

	return fragment;
};
