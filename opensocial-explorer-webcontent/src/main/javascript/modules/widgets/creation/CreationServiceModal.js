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
 * A modal window that allows users to create a new spec along with information about the spec.
 *
 * @module explorer/widgets/creation/CreationServiceModal
 * @requires module:explorer/ExplorerContainer
 * @requires module:explorer/widgets/creation/CreationOAuthItem
 * @augments module:explorer/widgets/ModalDialog
 * @augments dijit/_WidgetsInTemplateMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 * 
 * TODO: Implement OAuth2 support.
 */
define(['dojo/_base/declare', 'explorer/widgets/ModalDialog', 'dijit/_WidgetsInTemplateMixin', 
        'dojo/text!./../../templates/CreationServiceModal.html', 'explorer/widgets/creation/CreationOAuthItem',
        'explorer/widgets/creation/CreationOAuth2Item','explorer/ExplorerContainer', 'dojo/_base/lang', 'dojo/json',
        'dojo/query', 'dojo/dom', 'dojo/on', 'dojo/dom-construct', 'dojo/dom-class', 'explorer/services-service', 
        'dojo/dom-style', 'dojo/topic', 'dojo/NodeList-manipulate', 'dojo/NodeList-traverse', 'dojo/NodeList-dom', 'dojo/domReady!'],
        function(declare, ModalDialog, WidgetsInTemplateMixin, template, CreationOAuthItem, CreationOAuth2Item, 
            ExplorerContainer, lang, JSON, query, dom, on, domConstruct, domClass, servicesService, domStyle, topic) {
  return declare('CreationServiceModalWidget', [ModalDialog, WidgetsInTemplateMixin], {
    templateString: template,
    dropdownValue: 'oauth',
    
    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate: function() {
      var self = this;
      
      // Tabs Listener
      query('.tab', this.domNode).on('click', function(e) {
        if(!domClass.contains(this, 'active')) {
          self.toggleTab();
        }
      });
      
      // Pill Listener
      query('.pill', this.domNode).on('click', function(e) {
        if(!domClass.contains(this, 'active')) {
          var value = self.serviceSelection.value;
          if(value == 'oauth') {
            domClass.toggle(self.oAuthAdvancedContent, 'active');
            domClass.toggle(self.oAuthGeneralContent, 'active');
          }

          if(value == 'oauth2') {
            domClass.toggle(self.oAuth2AdvancedContent, 'active');
            domClass.toggle(self.oAuth2GeneralContent, 'active');
          }
          
          domClass.toggle(self.advancedPill, 'active');
          domClass.toggle(self.generalPill, 'active');
        }
      });
       
      // Dropdown Listener
      query(this.serviceSelection, this.domNode).on('click', function(e) {
        lang.hitch(self, self.dropdownClickHandler());
      });
      
      // Submit Listener
      query(this.serviceSubmit, this.domNode).on('click', function(e) {
        var value = self.serviceSelection.value;
        var securityToken = self.getToken();
        if(value == 'oauth') {
          var oAuth = {
              version: value,
              st: securityToken,
              name: self.oAuthName.value,
              key: self.oAuthKey.value,
              secret: self.oAuthSecret.value,
              keyType: self.oAuthKeyType.value,
              callbackUrl: "%origin%%contextRoot%/gadgets/oauthcallback"
          }
        }
        
        else if(value == 'oauth2') {
          var oAuth = {
              version: value,
              st: securityToken,
              name: self.oAuth2Name.value,
              clientId: self.oAuth2ClientId.value,
              clientSecret: self.oAuth2ClientSecret.value,
              authUrl: self.oAuth2AuthUrl.value,
              tokenUrl: self.oAuth2TokenUrl.value,
              type: self.oAuth2Type.value,
              grantType: self.oAuth2GrantType.value,
              authentication: self.oAuth2Authentication.value,
              override: self.oAuth2Override.checked ? 'true' : 'false',
              authHeader: self.oAuth2Header.checked ? 'false' : 'true',
              urlParam: self.oAuth2Parameter.checked ? 'true' : 'false',
              redirectUrl: "%origin%%contextRoot%/gadgets/oauth2callback"
          }
        }
        
        if(self.validateFields(oAuth)) {
          domClass.add(self.oAuthFieldsValidation, "hide");
          domClass.add(self.oAuth2FieldsValidation, "hide");
          self.submitService(oAuth);
        } else {
          if(oAuth.version == "oauth") {
            domClass.remove(self.oAuthFieldsValidation, "hide");
          } else {
            domClass.remove(self.oAuth2FieldsValidation, "hide");
          }
        }
      });
      
      // Deletion Listener
      this.subscription = topic.subscribe('serviceDeleted', function() {
        var oAuthServices = query(".creationOAuthItem", self.domNode);
        var oAuth2Services = query(".creationOAuth2Item", self.domNode);
        
        if(oAuthServices.length == 0) {
          domClass.add(self.oAuth, "hide");
        }
        
        if(oAuth2Services.length == 0) {
          domClass.add(self.oAuth2, "hide");
        }
        
        if(oAuthServices.length == 0 && oAuth2Services.length == 0) {
          domClass.remove(self.noServices, "hide");
        } 
      });  
    },
    
    /**
     * Checks the oAuth object generated from user entry fields 
     * to ensure no fields are empty prior to submission.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     * 
     * @param {Object} oAuth - The oAuth service object containing user-filled data.
     */
    validateFields: function(oAuth) {
      if(oAuth.version == "oauth") {
        return oAuth.name != "" && oAuth.key != "" && oAuth.secret != "";
      } else {
        return oAuth.name != "" && oAuth.id != "" && oAuth.secret != "" && oAuth.authUrl != "" && oAuth.tokenUrl != "";
      }
    },
    
    /**
     * Handles the logic after the dropdown is clicked and a selection is toggled.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     */
    dropdownClickHandler: function() {
      var value = this.serviceSelection.value;
      // Something happens only if a different dropdown option is selected.
      if(value !== this.dropdownValue) {
        this.clearContent();
        this.dropdownValue = value;
        this.resetPill();
        if(value == 'oauth') {
          query(this.oAuthGeneralContent).addClass('active');
        }
        
        else if(value == 'oauth2') {
          query(this.oAuth2GeneralContent).addClass('active');
        }
      }
    },
    
    /**
     * Adds all of a user's services to the servicesContent UI. Also hides/unhides the
     * "No Services", "OAuth", and "OAuth2" title appropriately.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     * 
     * @param {Object} data - The service data returned from the servlet that contains all of a user's services.
     * This object is comprised of two arrays, each of which can be empty: one for OAuth1, and one for OAuth2.
     */
    populate: function(data) {
      var self = this;
      query("#services-content > div", self.domNode).forEach(domConstruct.destroy);
      
      if(data.oauth.length == 0) {
        domClass.add(this.oAuth, "hide");
      } else {
        domClass.remove(this.oAuth, "hide");
        data.oauth.forEach(function(obj) {
          self.addOAuthItem(obj);
        });
      }
      
      if(data.oauth2.length == 0) {
        domClass.add(this.oAuth2, "hide");
      } else {
        domClass.remove(this.oAuth2, "hide");
        data.oauth2.forEach(function(obj) {
          self.addOAuth2Item(obj);
        }); 
      }

      if(data.oauth.length == 0 && data.oauth2.length == 0) {
        domClass.remove(this.noServices, "hide");
      } else {
        domClass.add(this.noServices, "hide");
      }
    },
    
    /**
     * Gets a user's services from the servlet.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     */
    fetchServices: function() {
      var self = this;
      servicesService.getServices(this.getToken()).then(
        function(data) {
          self.populate(data);
        },
        function(data) {
          console.error("Error fetching services");
        });
    },

    /**
     * Posts a user-created service to the servlet.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     * @param {Object} oAuth - Object that contains the filled-out details of the custom service.
     */
    submitService: function(oAuth) {
      var self = this;
      servicesService.createNewService(oAuth).then(
        function(data) {
          self.toggleTab();
          self.populate(data);
          self.resetFields();
        },
        function(data) {
          console.error("Error submitting service. Services data: " + JSON.stringify(data));
        });
    },
    
    /**
     * Creates a new CreationOAuthItem out of the data and places it in the DOM.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     * @param {Object} data - The service's data.
     */
    addOAuthItem: function(data) {
      var newItem = new CreationOAuthItem(data);
      domConstruct.place(newItem.domNode, this.oAuth, "after");
      newItem.startup();
    },
    
    /**
     * Creates a new CreationOAuth2Item out of the data and places it in the DOM.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     * @param {Object} data - The service's data.
     */
    addOAuth2Item: function(data) {
      var newItem = new CreationOAuth2Item(data);
      domConstruct.place(newItem.domNode, this.oAuth2, "after");
      newItem.startup();
    },
    
    /**
     * Changes the active tab content.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     */
    toggleTab: function() {
      domClass.toggle(this.newServiceTab, 'active');
      domClass.toggle(this.servicesTab, 'active');
      
      domClass.toggle(this.newServiceContent, 'active');
      domClass.toggle(this.servicesContent, 'active');
    },
    
    /**
     * Brings the focus back to the general pill.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     */
    resetPill: function() {
      query(this.generalPill).addClass('active');
      query(this.advancedPill).removeClass('active');
    },

    /**
     * Removes the active class from all the pill content.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     */
    clearContent: function() {
      query('.pill-pane').removeClass('active');
    },
    
    /**
     * Resets all the user inputted fields upon submission.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     */
    resetFields: function() {
      this.oAuthName.value = "";
      this.oAuthKey.value = "";
      this.oAuthSecret.value = "";
      this.oAuthKeyType.selectedIndex = 0;
      
      this.oAuth2Name.value = "";
      this.oAuth2ClientId.value = "";
      this.oAuth2ClientSecret.value = "";
      this.oAuth2AuthUrl.value = "";
      this.oAuth2TokenUrl.value = "";
      this.oAuth2Type.selectedIndex = 0;
      this.oAuth2GrantType.selectedIndex = 0;
      this.oAuth2Authentication.selectedIndex = 0;
      this.oAuth2Override.checked = true;
      this.oAuth2Header.checked = true;
      this.oAuth2Parameter.checked = true;
    },
    
    /**
     * Getter method for the security token in the ExplorerContainer module.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     * @returns {String} The security token as a string.
     */
    getToken: function() {
      return ExplorerContainer.getInstance().containerToken;
    },
    
    /**
     * Opens the modal and requests a user's services.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     */
    show: function() {
      this.inherited(arguments);
      this.fetchServices();
    },
    
    /**
     * Unsubscribes and deletes the Widget. Used for testing purposes.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     */
    destroy: function() {
      this.subscription.remove();
      this.inherited(arguments);
    }
  });
});