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
     * @param {Object} authService - Data of the new service to be posted.
     */
    createNewService : function(authService) {
      return xhr(urlUtil.getContextRoot() + '/services?' + urlUtil.serialize(authService), {
        method: "POST",
        handleAs: "json"
      });
    },
    
    /**
     * Gets a user's existing services from the servlet.
     *
     * @memberof module:explorer/services-service
     * @param {String} st - User's security token as a string, also serves as the identifier.
     */
    getServices : function(st) {
      return xhr(urlUtil.getContextRoot() + '/services?st=' + st, {
        method: "GET",
        handleAs: "json"
      });
    },
    
    /**
     * Deletes a particular service from the servlet.
     *
     * @memberof module:explorer/services-service
     * @param {Object} queryJson - Data of the service to be deleted. Includes service name and user security token.
     */
    deleteService : function(queryJson) {
      return xhr(urlUtil.getContextRoot() + '/services?' + urlUtil.serialize(queryJson), {
        method: "DELETE",
        handleAs: "json"
      });
    }
  };
});