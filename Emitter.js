/*jslint smarttabs:true */

"use strict";

var slice = Array.prototype.slice;

module.exports = require('clss')('Emitter', function (def) {
	def.init = function () {
		this._listeners_ = {};

		return this;
	};

	def.listeners = function (name) {
		var list = this._listeners_;

		if (!name) return list;

		if (!list[name]) list[name] = [];

		return list[name];
	};

	def.on =
	def.addListener = function (name, cb) {
		this.listeners(name).push(cb);

		return this.emit('newListener', name, cb);
	};

	def.send = function (name, args) {
		var list = this.listeners(name),
		    l = list.length,
		    i = 0;

		for (; i < l; i += 1) list[i].apply(this, args);

		return this;
	};

	def.emit = function (name) {
		return this.send(name, slice.call(arguments, 1));
	};

	def.once = function (name, listener) {
		return this.addListener(name, function emitter_once_closure () {
			listener.apply(this, arguments);

			this.removeListener(name, listener);
		});
	};

	def.forever = function (name) {
		var that = this,
		    list = this.listeners(name),
		    args = slice.call(arguments);

		if (list.emitForever) this.periodic(name);

		function emitter_forever_closure (nm) {
			if (nm === name) {
				that.emit.apply(that, args).removeAllListeners(nm);
			}
		}

		emitter_forever_closure.emitterName = name;
		list.emitForever = emitter_forever_closure;

		return this.addListener('newListener', emitter_forever_closure).
			emit.apply(that, args).removeAllListeners(name);
	};

	def.periodic = function (name) {
		var that = this,
		    list = this.listeners(name);

		if (!list.emitForever) return this;

		this.removeListener('newListener', list.emitForever);

		delete list.emitForever;

		return this;
	};

	function listenerIndex (list, listener) {
		if (list.indexOf) return list.indexOf(listener);

		for (var i = 0, l = list.length; i < l; i += 1) {
			if (list[i] === list) return i;
		}

		return -1;
	}

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

	def.sendAsync =
	def.emitAsync = function (name, cb) {
		var that = this,
		    done = false,
		    list = this.listeners(name).slice(0),
		    args = slice.call(arguments, 2),
		    l = list.length,
		    i = 0;

		function next (err) {
			if (done) return;

			if (i >= l) {
				done = true;
				cb.call(that, arguments);
			}

			if (err) {
				done = true;
				cb.call(that, arguments);
			}

			list[i].apply(that, args);
			i += 1;

			if (list[i].length < args.length) next();
		}

		args.push(next);

		next();

		return this;
	};
});
