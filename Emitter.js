"use strict";

var slice = Array.prototype.slice;

module.exports = require('clss')('Emitter', function (def) {
	def.listeners = function (name) {
		if (!this.hasOwnProperty('_listeners_')) this._listeners_ = {};

		var list = this._listeners_;

		if (!name) return list;

		if (!list[name]) list[name] = [];

		return list[name];
	};

	def.on =
	def.addListener = function (name, listener) {
		if (typeof listener !== 'function') return this;

		this.listeners(name).push(listener);

		return this.emit('newListener', name, listener);
	};

	def.send = function (name, args, andEmpty) {
		var list = this.listeners(name),
		    l = list.length,
		    i = 0;

		if (andEmpty) {
			list = list.slice(0);

			this.listeners(name).length = 0;
		}

		for (; i < l; i += 1) list[i].apply(this, args);

		return this;
	};

	def.sendAndEmpty = function (name, args) {
		return this.send(name, args, true);
	};

	def.emit = function (name) {
		var args = slice.call(arguments, 1);

		return this.send(name, args);
	};

	def.once = function (name, listener) {
		if (typeof listener !== 'function') return this;

		return this.addListener(name, emitOnce);

		function emitOnce () {
			listener.apply(this, arguments);

			this.removeListener(name, listener);
		}
	};

	def.off =
	def.removeListener = function (name, listener) {
		var list = this.listeners(name),
		    index = listenerIndex(list, listener);

		if (~index) list.splice(index, 1);

		return this;
	};

	def.allOff =
	def.removeAllListeners = function (name) {
		this.listeners()[name] = [];

		return this;
	};

	function listenerIndex (list, listener) {
		if (list.indexOf) return list.indexOf(listener);

		for (var i = 0, l = list.length; i < l; i += 1) {
			if (list[i] === list) return i;
		}

		return -1;
	}

	def.forever = function (name) {
		var that = this,
		    list = this.listeners(name),
		    args = slice.call(arguments, 1);

		if (list.emitForever) this.periodic(name);

		emitForever.emitterName = name;
		list.emitForever = emitForever;

		this.addListener('newListener', emitForever);
		this.sendAndEmpty(name, args);

		return this;

		function emitForever (nm) {
			if (nm === name) that.sendAndEmpty(name, args);
		}
	};

	def.unforever =
	def.periodic = function (name) {
		var list = this.listeners(name);

		if (!list.emitForever) return this;

		this.removeListener('newListener', list.emitForever);

		delete list.emitForever;

		return this;
	};

	def.sendAsync = function (name, args, callback, andEmpty) {
		var that = this,
		    done = false,
		    list = this.listeners(name).slice(0),
		    l = list.length,
		    i = 0;

		if (andEmpty) this.listeners(name).length = 0;

		args.push(next);

		next();

		return this;

		function next (err) {
			if (done) return;

			if (i >= l) {
				done = true;
				return end(arguments);
			}

			if (err) {
				done = true;
				return end(arguments);
			}

			list[i].apply(that, args);
			i += 1;

			if (list[i].length < args.length) next();
		}

		function end (args) {
			if (typeof callback === 'function') callback.call(that, args);
		};
	};

	def.sendAsyncAndEmpty = function (name, args, callback) {
		return this.sendAsync(name, args, callback, true);
	};

	def.emitAsync = function (name) {
		var args = slice.call(arguments, 1),
		    callback = args.pop();

		return this.sendAsync(name, args, callback);
	};
});
