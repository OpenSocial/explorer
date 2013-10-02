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
* Handles all xhr calls between client and servlet side for specs.
*
* @module modules/gadget-spec-service
*/
define(['dojo/request/xhr', 'dojo/json', './url-util'], function(xhr, json, urlUtil) {
  function getGadgetSpecBase(id, success, error) {
    xhr(urlUtil.getContextRoot() + '/gadgetspec/' + id, {
      handleAs: "json"
    }).then(function(data) {
      if(success) {
        success(data);
      }
    }, function(err) {
      if(error) {
        error(err);
      }
    });
  }
  return {
    /**
     * Gets the default gadget spec's data.
     *
     * @memberof module:modules/gadget-spec-service
     * @param {Object} callbacks - Object with a success and an error function.
     * @param {Function} callbacks.success - Fired if xhr was successful.
     * @param {Function} callbacks.error - Fired if xhr was not successful.
     */
    getDefaultGadgetSpec : function(callbacks) {
      getGadgetSpecBase('default', callbacks.success, callbacks.error);
    },
    
    /**
     * Gets a gadget spec's data.
     *
     * @memberof module:modules/gadget-spec-service
     * @param {String} id - The ID of the gadget spec.
     * @param {Object} callbacks - Object with a success and an error function.
     * @param {Function} callbacks.success - Fired if xhr was successful.
     * @param {Function} callbacks.error - Fired if xhr was not successful.
     */
    getGadgetSpec : function(id, callbacks) {
      getGadgetSpecBase(id, callbacks.success, callbacks.error);
    },
    
    /**
     * Posts a new spec to the servlet.
     *
     * @memberof module:modules/gadget-spec-service
     * @param {Object} specData - Data of the new spec to be posted.
     * @param {Object} callbacks - Object with a success and an error function.
     * @param {Function} callbacks.success - Fired if xhr was successful.
     * @param {Function} callbacks.error - Fired if xhr was not successful.
     */
    createNewGadgetSpec : function(specData, callbacks) {
      xhr(urlUtil.getContextRoot() + '/gadgetspec', {
        handleAs: "json",
        method: "POST",
        data: json.stringify(specData),
        headers : {
          "Content-Type": "application/json"
        }
      }).then(callbacks.success, callbacks.error);
    },
    
    /**
     * Gets the json representation of the spec tree.
     *
     * @memberof module:modules/gadget-spec-service
     * @param {Object} callbacks - Object with a success and an error function.
     * @param {Function} callbacks.success - Fired if xhr was successful.
     * @param {Function} callbacks.error - Fired if xhr was not successful.
     */
    getSpecTree : function(callbacks) {
      xhr(urlUtil.getContextRoot() + '/gadgetspec/specTree', {
        handleAs: "json"
      }).then(callbacks.success, callbacks.error);
    }
  };
});