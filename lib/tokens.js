var P = require('bluebird'),
    _ = require('lodash'),
    Boom = require('boom'),
    jwt = require('jsonwebtoken');

module.exports = function(plugin) {

    var clock = plugin.plugins['covistra-system'].clock;
    var db = plugin.plugins['covistra-mongodb'].MAIN;
    var log = plugin.plugins['covistra-system'].systemLog.child({model:'token'});
    var Users = plugin.plugins['covistra-security'].Users;
    var Applications = plugin.plugins['covistra-security'].Applications;

    plugin.plugins['covistra-mongodb'].indexManager.registerIndex('MAIN', 'tokens', {token:1});

    function Token(data) {
        _.merge(this, data);
    }

    function _create(data) {
        var coll = db.collection('tokens'), _this = this;
        return P.promisify(coll.insertOne, coll)(data).then(function(result){
            data._id = result._id;
            return new Token(data);
        });
    }

    function _loadToken(tokenString) {
        log.debug("Load token", tokenString);
        var coll = db.collection('tokens');
        return P.promisify(coll.findOne, coll)({token: tokenString}).then(function(token) {

            if(token) {
                // Load all token fields in parallel
                return P.props({
                    token: token,
                    emitter: Users.model.findById(token.emitter),
                    bearer: Users.model.findById(token.bearer),
                    app: Applications.model.findById(token.app)
                });
            }
            else {
                throw Boom.notFound("invalid token");
            }

        });

    }

    function _allocateToken(credentials, app, options) {
        log.debug("Allocating token for user %s and app %s", credentials.username, app.key);

        // Generate the JWT for subsequent API calls
        var token = jwt.sign({
            username: credentials.username,
            email: credentials.email,
            first_name: credentials.first_name,
            last_name: credentials.last_name,
            last_presence_ts: credentials.last_presence_ts,
            status: credentials.status,
            roles: credentials.roles || options.roles || []
        }, app.secret, options);

        log.debug("Secure token %s was successfully allocated", token);

        return _create({
            token: token,
            bearer: credentials._id,
            emitter: credentials._id,
            app: app._id,
            permissions: ['user'],
            ts: clock.nowTs()
        });
    }

    return {
        model: {
            create: _create,
            loadToken: _loadToken,
            allocateToken: _allocateToken
        }
    };

};