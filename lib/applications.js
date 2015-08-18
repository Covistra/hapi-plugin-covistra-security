var P = require('bluebird'),
	_ = require('lodash'),
	crypto = require('crypto');

module.exports = function(server) {

	var clock = server.plugins['covistra-system'].clock;
	var db = server.plugins['covistra-mongodb'].MAIN;

	// Make sure our indexes are present in the database
	server.plugins['covistra-mongodb'].indexManager.registerIndex('MAIN', 'applications', { key: 1});

	function Application(data) {
		_.merge(this, data);
	}

	function _create(data) {
		var coll = db.collection('applications');

		data.key = crypto.randomBytes(16).toString('hex');
		data.secret = crypto.createHash('sha1').update(data.key).update(Date.now().toString()).digest('hex');

		return P.promisify(coll.insertOne, coll)(data).then(function(result){
			data._id = result._id;
			return new Application(data);
		});
	}

	function _list(filter, options) {
		options = options || {};
		var cursor = db.collection('applications').find(filter);

		if(options.limit) {
			cursor.limit(options.limit);
		}

		if(options.skip) {
			cursor.skip(options.skip);
		}

		if(options.sort) {
			cursor.sort(options.sort);
		}
		return P.promisify(cursor.toArray, cursor)();
	}

	function _getByKey(key) {
		var coll = db.collection('applications');
		return P.promisify(coll.findOne, coll)({key: key}).then(function(data){
			return new Application(data);
		});
	}

	function _findById(_id) {
		var coll = db.collection('applications');
		return P.promisify(coll.findOne, coll)({_id: _id}).then(function(data) {
			if(data) {
				return new Application(data);
			}
		});
	}

	Application.prototype.update = function(data) {
		var _this = this;
		var coll = db.collection('applications');
		_.merge(this, data);
		return P.promisify(coll.update, coll)({key: this.key}, {
			$set: data
		}).then(function() {
			return _this;
		});
	};

	Application.prototype.delete = function() {
		var coll = db.collection('applications');
		return P.promisify(coll.delete, coll)({key: this.key});
	};

	return {
		model: {
			create: _create,
			findById: _findById,
			list: _list,
			getByKey: _getByKey
		}
	}
};
