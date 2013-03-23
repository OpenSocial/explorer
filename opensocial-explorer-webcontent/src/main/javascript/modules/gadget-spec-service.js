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
define(['dojo/request/xhr', 'dojo/json'], function(xhr, json) {
  function getGadgetSpecBase(id, success, error) {
    xhr('gadgetspec/' + id, {
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
  };
  return {
    getDefaultGadgetSpec : function(callbacks) {
      getGadgetSpecBase('default', callbacks.success, callbacks.error);
    },
    
    getGadgetSpec : function(id, callbacks) {
      getGadgetSpecBase(id, callbacks.success, callbacks.error);
    },
    
    createNewGadgetSpec : function(specData, callbacks) {
      xhr('gadgetspec', {
        handleAs: "json",
        method: "POST",
        data: json.stringify(specData),
        headers : {
          "Content-Type": "application/json"
        }
      }).then(callbacks.success, callbacks.error);
    },
    
    getSpecTree : function(callbacks) {
      xhr('gadgetspec/specTree', {
        handleAs: "json"
      }).then(callbacks.success, callbacks.error);
    }
  };
});