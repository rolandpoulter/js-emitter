module.exports = require('spc').describe('Emitter', function () {
	var Emitter = require('./Emitter');

	before(function () {
		should();
	});
});

require('spc/reporter/dot')(module.exports);