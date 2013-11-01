/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
*
* Handles all xhr calls between client and servlet side for services.
*
* @module explorer/services-service
*/
define(['dojo/request/xhr', 'dojo/json', './url-util'], function(xhr, json, urlUtil) {
  return {
    /**
     * Posts a new service to the servlet.
     *
     * @memberof module:explorer/services-service
     * @param {Object} specData - Data of the new spec to be posted.
     * @param {Object} callbacks - Object with a success and an error function.
     * @param {Function} callbacks.success - Fired if xhr was successful.
     * @param {Function} callbacks.error - Fired if xhr was not successful.
     */
    createNewService : function(authService, callbacks) {
      xhr(urlUtil.getContextRoot() + '/services', {
        handleAs: "json",
        method: "POST",
        data: JSON.stringify(authService),
        headers : {
          "Content-Type": "application/json"
        } 
      }).then(callbacks.success, callbacks.error);
    },
    
    
    
    
    /**
     * Gets the OpenID providers.
     *
     * @memberof module:explorer/openid-service
     * @param {Object} callbacks - Object with a success and an error function.
     * @param {Function} callbacks.success - Fired if xhr was successful.
     * @param {Function} callbacks.error - Fired if xhr was not successful.
     */
    getProviders : function(callbacks) {
      xhr('openid/providers', {
        handleAs : "json"
      }).then(function(data) {
        if(callbacks.success) {
          callbacks.success(data);
        }
      },
      function(error){
        if(callbacks.error) {
          callbacks.error(error);
        }
      });
    }
  };
});