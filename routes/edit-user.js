/**

 Copyright 2015 Covistra Technologies Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
"use strict";

var Calibrate = require('calibrate'),
    Joi = require('joi'),
    _ = require('lodash');

module.exports = function (server) {

    var Users = server.plugins['covistra-security'].Users;

    function handler(req, reply) {
        server.log(['plugin', 'users', 'debug'], "Users:Route:editUsers", req.payload);

        if(req.auth.credentials.emitter.username === req.params.username || _.contains(req.auth.credentials.token.token.roles, "admin") ) {

            return Users.model.getByUsername(req.params.username).then(function(user) {
                return user.update(req.payload)
            }).then(Calibrate.response).catch(Calibrate.error).then(reply);
        }
        else {
            reply(403, new Error("not-enough-permissions"));
        }

    }

    return {
        method: 'PUT', path: '/users/{username}', handler: handler, config: {
            tags: ['api', 'security'],
            description: "Edit a user in the system",
            auth: 'token',
            validate: {
                payload: Joi.object().keys({
                    email : Joi.string().email(),
                    first_name : Joi.string(),
                    last_name : Joi.string(),
                    password: Joi.string(),
                    groups : Joi.array().items(Joi.string()),
                    opt_in : Joi.boolean(),
                    phone : Joi.string(),
                    status : Joi.string().allow('ACTIVE', 'INACTIVE'),
                    medias: Joi.array().items(Joi.string()).description('An array of Cloudinary public_id associated with this user account')
                }),
                headers: Joi.object({
                    'authorization': Joi.string().required().description('A Bearer token value')
                }).unknown()
            }
        }
    };
};

