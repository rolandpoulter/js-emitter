module.exports = require('spc').describe('Emitter:', function () {
	var Emitter = require('../Emitter');

	before(function () {
		should();
	});

	beforeEach(function () {
		this.subject = new Emitter();
	});

	xit('should create a place to store listeners.', function () {
		var listeners = this.subject._listeners_;
		listeners.should.to.be.an['instanceof'](Object);
		listeners.should.be.empty;
	});

	describe('listen to an emitter for messages:', function () {
		beforeEach(function () {
			this.subject.on('message', this.listener = sinon.spy());
		});

		it('should store a listener for message.', function () {
			this.subject._listeners_.message[0].should.equal(this.listener);
		});

		it('should emit a new listener message.', {
			before: function () {
				this.subject.on('newListener', this.newListener = sinon.spy());
			}
		
		}, function () {
			this.newListener.called.should.be.ok;
		})
	});

	describe('emit messages to a listener:', function () {
		beforeEach(function () {
			this.subject.emit('message', 0, 1, 2, '...');
		});

		it('should call a message listener if one exists.', {
			before: function () {
				this.subject.on('message', this.listener = sinon.spy());
			}
		}, function () {
			this.listener.called.should.be.ok;
		});
	});
});

require('spc/reporter/dot')(module.exports);