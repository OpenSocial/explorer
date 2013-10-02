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
 * Handles the OAuth login process via a popup. Multiple instances of this module are created
 * in the LoginDialog for each individual login option.
 *
 * @module modules/widgets/login/OAuthLogin
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dojo/_base/lang',
        'dojo/query', 'dojo/text!./../../templates/LoginItem.html', 'dojo/dom-construct', 'dojo/topic',
        'dojo/dom', 'dojo/dom-class', 'dojo/on', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, WidgetBase, TemplatedMixin, lang,
            query, template, domConstruct, topic, dom, domClass, on) {
  return declare('OAuthLogin', [ WidgetBase, TemplatedMixin ], {
    templateString : template,
    
    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:modules/widgets/login/OAuthLogin#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      var self = this;
      on(this.loginLink, 'click', function() {
        self.togglePopup();
      });
    },
    
    /**
     * Creates and opens the popup for user authentication.
     *
     * @memberof module:modules/widgets/login/OAuthLogin#
     */
    togglePopup : function() {
      var self = this,
          windowOptions = null,
          openCallback =  lang.hitch(this, 'onPopupOpen'),
          closeCallback = lang.hitch(this, 'onPopupClose');

      self.popup = new gadgets.oauth.Popup(this.endpoint, windowOptions, openCallback, closeCallback);
      self.popup.createOpenerOnClick()();
    },
    
    /**
     * Handler for when the popup window opens.
     *
     * @memberof module:modules/widgets/login/OAuthLogin#
     */
    onPopupOpen: function() {
      var self = this;
      document.addEventListener("myEvent", function(obj) {
        var responseObj = self.popup.win_.document.responseObj;
        self.securityToken = responseObj.securityToken;
        self.securityTokenTTL = responseObj.securityTokenTTL;
        self.popup.win_.close();
      });
    },

    /**
     * Handler for when the popup window closes.
     *
     * @memberof module:modules/widgets/login/OAuthLogin#
     */
    onPopupClose: function() {
      if(this.securityToken) {
        topic.publish("updateToken", this.securityToken, this.securityTokenTTL);
        topic.publish("hideModal");
        query('#login')[0].innerHTML = "Welcome!";
      }
    }
  });
});