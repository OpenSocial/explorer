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
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/query', 'dojo/text!./../../templates/OpenIDLogin.html',
        'dojo/dom', 'dojo/dom-class', 'dojo/_base/lang', 'dojo/on',
        'dojo/request/xhr', 'modules/widgets/gadgetarea/GadgetArea', 
        'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, WidgetBase, TemplatedMixin,
                query, template, dom, domClass, lang, on, xhr, GadgetArea) {
            return declare('OpenIDLoginControls', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                
                show : function(parentDialog) {
                  this.parentDialog = parentDialog;
                  // TODO: Show some UI that allows the end user to select their provider.  For now, we default to Google
                  // var discoveryUrl = <The URL the end user chose>
                  this.popup("https://www.google.com/accounts/o8/id");
                },
                
                popup : function(discoveryUrl) {
                  /*
                   * Most of Shindig's oauthpopup is generic enough that it could be reused for an
                   * openId popup. The only thing that would change would be the "destination"
                   * parameter that is provided to the gadgets.oauth.Popup constructor. This
                   * destination, in the case of OAuth, has a redirect URI that points to the
                   * Shindig server on it. We would need something similar for OpenID so that the
                   * server could receive the response from the OpenID request and mint a security
                   * token with the owner and viewer ID in it. This is the only way to secure the
                   * process. We can't allow clients to mint security tokens or a hosted version of
                   * OSE would be inherently insecure.
                   * 
                   * The real issue is how does the client get the security token securely? In the
                   * case of OAuth, this is done with a security token. I think we may not be able
                   * to get around the fact that we need a server-side processed page that writes
                   * the security token into it -OR- part of the redirect that occurs with the
                   * OpenID popup could allow us to pass the variable to the main client page before
                   * the popup window closes.
                   * 
                   */
                  var destination = "/openid/authrequest?openid_identifier=" + encodeURIComponent(discoveryUrl),
                      windowOptions = null,
                      openCallback = dojo.hitch(this, 'openPopup', function() {return popup;}),
                      closeCallback = dojo.hitch(this, 'closePopup'),
                      popup = new gadgets.oauth.Popup(destination, windowOptions, openCallback, closeCallback);
                  
                  // CONSIDER: Will popup blockers be okay with this?  If not, we should tie this to the click of the OpenID provider buttons.
                  popup.createOpenerOnClick()();
                },
                
                openPopup : function(fGetPopup) {
                  var popup = fGetPopup();
                  popup.win_.setResponseObj_ = dojo.hitch(this, function(responseObj) {
                      this.securityToken = responseObj['securityToken'];
                      this.securityTokenTTL = responseObj['securityTokenTTL'];
                    });
                },
                
                closePopup : function() {
                  this.parentDialog.hide();
                  GadgetArea.getInstance().updateContainerSecurityToken(this.securityToken, this.securityTokenTTL);
                  // TODO: Indicate the user is logged in.  We won't have a username...
                  query('#openid-login')[0].innerHTML = "Welcome!";
                }
            });
});