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
* A modal window that allows users to login with their OpenID.
*
* @module modules/widgets/openid/OpenIDLoginDialog
* @augments module:modules/widgets/ModalDialog
* @requires module:modules/openid-service
* @requires module:modules/widgets/openid/AuthProvider
*/
define(['dojo/_base/declare',  '../ModalDialog', 'dojo/query', 'dojo/dom-construct',
        'dojo/on', './AuthProvider', 'dojo/_base/array', '../../openid-service', 
        'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ModalDialog, query, domConstruct, on, AuthProvider, array, openIdService) {
  var OpenIDLoginDialog = declare('OpenIDLoginDialog', [ ModalDialog ], {

    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:modules/widgets/openid/OpenIDLoginDialog#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      this.setHeaderTitle('Sign-in or Create New Account');
      this.inherited(arguments);
    },

    /**
     * Shows the OpenIDLoginDialog modal.
     *
     * @memberof module:modules/widgets/openid/OpenIDLoginDialog#
     */
    show : function() {
      if(!this.providers) {
        var modalBodies = query('.modal-body', this.domNode);
        var self = this;
        openIdService.getProviders({
          success : function(data) {
            self.providers = data;
            for(var key in data) {
              if(data.hasOwnProperty(key)) {
                var openIdLoginControl = new AuthProvider(data[key]);
                modalBodies.append(openIdLoginControl.domNode);
                openIdLoginControl.startup();
              }
            }
          },
          error : function(error) {
            console.error('Error fetching providers.');
          }
        });
      }
      this.inherited(arguments);
    }
  });
  var instance;

  return {
    getInstance : function() {
      if(!instance) {
        instance = new OpenIDLoginDialog();
      }
      return instance;
    }
  };            
});