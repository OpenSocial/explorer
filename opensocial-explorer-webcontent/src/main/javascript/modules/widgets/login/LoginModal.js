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
* A modal window that allows users to login.
*
* @module explorer/widgets/login/LoginModal
* @augments module:explorer/widgets/ModalDialog
* @requires module:explorer/openid-service
* @requires module:explorer/widgets/login/OAuthLogin
*/
define(['dojo/_base/declare',  'explorer/widgets/ModalDialog', 'dijit/_WidgetsInTemplateMixin', 
        'dojo/query', 'dojo/dom-construct', 'explorer/widgets/login/OAuthLogin', 'dojo/topic', 
        '../../openid-service',  'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ModalDialog, WidgetsInTemplateMixin, query, domConstruct,
            OAuthLogin, topic, openIdService) {
  return declare('LoginModalWidget', [ ModalDialog, WidgetsInTemplateMixin ], {
    
    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/login/LoginModal#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      var self = this;
      this.setHeaderTitle('Sign-in or Create New Account');
      this.inherited(arguments);
      
      this.hideModalHandle = topic.subscribe("hideModal", function() {
        self.hide();
      });
    },

    /**
     * Shows the LoginModal modal.
     *
     * @memberof module:explorer/widgets/login/LoginModal#
     */
    show : function() {
      var modalBodies = query('.modal-body', this.domNode);
      
      if(!this.providers) {
        var self = this;
        openIdService.getProviders().then(function(data) {
          self.providers = data;
          for(var key in data) {
            if(data.hasOwnProperty(key)) {
              var metadata = data[key];
              var openIdLoginControl = new OAuthLogin({
                imageUrl: metadata.imageUrl,
                name: metadata.name,
                endpoint: "openid/authrequest?openid_identifier=" + encodeURIComponent(metadata.url)
              });
              modalBodies.append(openIdLoginControl.domNode);
              openIdLoginControl.startup();
            }
          }
        }, 
        function(data) {
          console.error('Error fetching providers.');
        });
      }

      if(!this.facebookOAuth) {
        this.facebookOAuth = new OAuthLogin({
          imageUrl: "http://g.etfv.co/http://www.facebook.com",
          name: "Facebook",
          endpoint: "facebookLogin/popup"
        });
        modalBodies.append(this.facebookOAuth.domNode);
        this.facebookOAuth.startup();
      } 
      
      if(!this.googleOAuth) {
        this.googleOAuth = new OAuthLogin({
          imageUrl: "http://g.etfv.co/http://www.google.com",
          name: "Google OAuth",
          endpoint: "googleLogin/popup"
        });
        modalBodies.append(this.googleOAuth.domNode);
        this.googleOAuth.startup();
      }
      
      this.inherited(arguments);
    },
    
    /**
     * Destroys this widget.
     * 
     * @memberof module:explorer/widgets/login/LoginModal# 
     */
    destroy: function() {
      this.inherited(arguments);
      if(this.hideModalHandle) {
        this.hideModalHandle.remove();
      }
    }
  });           
});