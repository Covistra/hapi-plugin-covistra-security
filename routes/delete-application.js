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

    var Applications = server.plugins['covistra-security'].Applications;

    function handler(req, reply) {
        server.log(['plugin', 'users', 'debug'], "Users:Route:deleteApplications", req.payload);
        if(_.contains(req.auth.credentials.token.token.roles, "admin") ) {
            Applications.model.delete(req.params.key).then(Calibrate.response).catch(Calibrate.error).then(reply);
        }
    }

    return {
        method: 'DELETE', path: '/applications/{key}', handler: handler, config: {
            tags: ['api', 'security'],
            description: "Delete an application in the system. Limited to staff",
            auth: 'token',
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('A Bearer token value')
                }).unknown()
            }
        }
    };
};

