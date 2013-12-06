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
 * An individual item in the Services tab for OAuth2.
 *
 * @module explorer/widgets/creation/CreationOAuth2Item
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/text!./../../templates/CreationOAuth2Item.html', 'dojo/dom-construct', 'dojo/topic', 'dojo/json',
        'dojo/dom-class', 'dojo/on', 'explorer/services-service', 'explorer/ExplorerContainer', 'dojo/Evented'],
        function(declare, WidgetBase, TemplatedMixin, template, domConstruct, topic, JSON,
            domClass, on, servicesService, ExplorerContainer, Evented) {
  return declare('CreationOAuth2ItemWidget', [ WidgetBase, TemplatedMixin ], {
    templateString : template,

    /**
     * Creates a new CreationOAuth2Item.
     * @constructor
     * 
     * @memberof module:explorer/widgets/CreationOAuth2Item#
     */
    constructor: function(obj) {
      this.name = obj.name;
      this.clientId = obj.clientId;
      this.clientSecret = obj.clientSecret;
      this.authUrl = obj.authUrl;
      this.tokenUrl = obj.tokenUrl;
      this.type = obj.type;
      this.grantType = obj.grantType;
      this.authentication = obj.authentication;
      this.override = obj.override;
      this.authHeader = obj.authHeader;
      this.urlParam = obj.urlParam;
    },
    
    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/CreationOAuth2Item#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate : function() {
      var self = this;
      on(this.itemDelete, 'click', function(e) {
        self.deleteItem();
      });
    },
    
    /**
     * Deletes the CreationOAuth2Item that is clicked.
     *
     * @memberof module:explorer/widgets/creation/CreationOAuth2Item#
     */
    deleteItem: function() {
      var self = this;
      var nameTokenPair = {
        name: this.name,
        st: this.getToken()
      };
      
      servicesService.deleteService(nameTokenPair, "oauth2").then(
          function(data) {
            self.destroy();
            topic.publish("serviceDeleted");
          },
          function(data) {
            console.error("There was an error. Services data: " + JSON.stringify(data));
          }
      );
    },
    
    /**
     * Gets the security token.
     *
     * @memberof module:explorer/widgets/creation/CreationOAuth2Item#
     * @returns {String} The security token as a string.
     */
    getToken: function() {
      return ExplorerContainer.getInstance().containerToken;
    }
  });
});