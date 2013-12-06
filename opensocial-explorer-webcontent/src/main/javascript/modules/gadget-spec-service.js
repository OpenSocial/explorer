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
* @module explorer/gadget-spec-service
*/
define(['dojo/request/xhr', 'dojo/json', './url-util'], function(xhr, json, urlUtil) {
  function getGadgetSpecBase(id) {
    return xhr(urlUtil.getContextRoot() + '/gadgetspec/' + id, {
      handleAs: "json"
    });
  }
  return {
    /**
     * Gets the default gadget spec's data.
     *
     * @memberof module:explorer/gadget-spec-service
     * @returns {Deferred} The deferred object from the xhr call.
     */
    getDefaultGadgetSpec : function() {
      return getGadgetSpecBase('default');
    },
    
    /**
     * Gets a gadget spec's data.
     *
     * @memberof module:explorer/gadget-spec-service
     * @param {String} id - The ID of the gadget spec.
     * @returns {Deferred} The deferred object from the xhr call.
     */
    getGadgetSpec : function(id) {
      return getGadgetSpecBase(id);
    },
    
    /**
     * Posts a new spec to the servlet.
     *
     * @memberof module:explorer/gadget-spec-service
     * @param {Object} specData - Data of the new spec to be posted.
     * @returns {Deferred} The deferred object from the xhr call.
     */
    createNewGadgetSpec : function(specData) {
      return xhr(urlUtil.getContextRoot() + '/gadgetspec', {
        handleAs: "json",
        method: "POST",
        data: json.stringify(specData),
        headers : {
          "Content-Type": "application/json"
        }
      });
    },
    
    /**
     * Gets the json representation of the spec tree.
     *
     * @memberof module:explorer/gadget-spec-service
     * @returns {Deferred} The deferred object from the xhr call.
     */
    getSpecTree : function() {
      return xhr(urlUtil.getContextRoot() + '/gadgetspec/specTree', {
        handleAs: "json"
      });
    }
  };
});