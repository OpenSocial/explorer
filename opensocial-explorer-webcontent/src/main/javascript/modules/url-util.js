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
* Utility module for parsing URLs.
*
* @module explorer/url-util
*/
define([], function() {
  return {
    /**
     * Gets the context root of where the OpenSocial Explorer is running.
     * This may not be the same context root of the container page.
     * 
     * @memberof module:explorer/url-util
     * @returns {String} The context root.
     */
    getContextRoot : function() {
      var modulePath = require.toUrl('explorer');
      var pathArray = modulePath.split('/');
      //explorer is at js/explorer so we need to pop 2 paths off the array
      pathArray.pop();
      pathArray.pop();
      return pathArray.join('/');
    }
  };
});