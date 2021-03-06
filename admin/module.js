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
var path = require('path');

module.exports = {
    menus:[{
        name:'Security',
        items:[{
            label:'Manage Users',
            state:'admin.users'
        }]
    }],
    states: require('./users-states'),
    controllers: {
        AdminUsersCtrl: require('./users-ctrl')
    },
    resources: {
        Users: {
            endpoint: 'users/{username}',
            methods: '*'
        }
    },
    services:{
        CMBF: 'CMBF'
    },
    views: {
        "users/home": path.resolve(__dirname, "templates/users/home.html")
    }
};
