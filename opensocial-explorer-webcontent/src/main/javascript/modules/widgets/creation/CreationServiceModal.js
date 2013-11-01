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
 * @module explorer/widgets/creation/CreationSpecModal
 * @augments module:explorer/widgets/ModalDialog
 * @augments dijit/_WidgetsInTemplateMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 */
define(['dojo/_base/declare', 'explorer/widgets/ModalDialog', 'dijit/_WidgetsInTemplateMixin', 
        'dojo/text!./../../templates/CreationServiceModal.html', 'dojo/query', 'dojo/dom', 
        'dojo/on', 'dojo/dom-construct', 'dojo/dom-class', 'explorer/services-service', 'dojo/topic',
        'dojo/NodeList-manipulate', 'dojo/NodeList-dom', 'dojo/domReady!'],
        function(declare, ModalDialog, WidgetsInTemplateMixin, template, query, 
            dom, on, domConstruct, domClass, servicesService, topic) {
  return declare('CreationServiceModalWidget', [ModalDialog, WidgetsInTemplateMixin], {
    templateString: template,
    dropdownValue: 'OAuth',
    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/creation/CreationSpecModal#
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
          if(value == 'OAuth') {
            domClass.toggle(self.oAuthAdvancedContent, 'active');
            domClass.toggle(self.oAuthGeneralContent, 'active');
          }

          if(value == 'OAuth2') {
            domClass.toggle(self.oAuth2AdvancedContent, 'active');
            domClass.toggle(self.oAuth2GeneralContent, 'active');
          }
          
          domClass.toggle(self.advancedPill, 'active');
          domClass.toggle(self.generalPill, 'active');
        }
      });
       
      // Dropdown Listener
      query(this.serviceSelection, this.domNode).on('click', function(e) {
        var value = self.serviceSelection.value;
        if(value !== self.dropdownValue) {
          self.clearContent();
          self.dropdownValue = value;
          self.resetPill();
          
          if(value == 'OAuth') {
            query(self.oAuthGeneralContent).addClass('active');
          }
          
          if(value == 'OAuth2') {
            query(self.oAuth2GeneralContent).addClass('active');
          }
        };
      });
      
      // Submit Listener
      query(this.serviceSubmit, this.domNode).on('click', function(e) {
        var value = self.serviceSelection.value;
        var securityToken = self.getToken();
        alert(securityToken);
        if(value == 'OAuth') {
          var oAuth = {
              version: value,
              st: securityToken,
              name: self.oAuthName.value,
              key: self.oAuthKey.value,
              secret: self.oAuthSecret.value,
              keyType: self.oAuthKeyType.value
          }
        }
        
        if(value == 'OAuth2') {
          var oAuth = {
              version: value,
              st: securityToken,
              name: self.oAuth2Name.value,
              key: self.oAuth2Key.value,
              secret: self.oAuth2Secret.value,
              authUrl: self.oAuth2Authorization.value,
              tokenUrl: self.oAuth2Token.value,
              type: self.oAuth2Type.value,
              grantType: self.oAuth2GrantType.value,
              authentication: self.oAuth2Authentication.value,
              override: self.oAuth2Override.checked ? 'true' : 'false',
              authHeader: self.oAuth2Header.checked ? 'true' : 'false',
              urlParam: self.oAuth2Parameter.checked ? 'true' : 'false'    
          }
        }
        
        self.submitOAuthService(oAuth);
      });
    },
    
    getToken: function() {
      topic.subscribe('tokenResponse', function(securityToken) {
        return securityToken;
      });
      
      topic.publish('tokenRequest');
    }
    
    toggleTab: function() {
      domClass.toggle(this.newServiceTab, 'active');
      domClass.toggle(this.servicesTab, 'active');
      
      domClass.toggle(this.newServiceContent, 'active');
      domClass.toggle(this.servicesContent, 'active');
    },
    
    clearContent: function() {
      query('.pill-pane').removeClass('active');
    },
    
    resetPill: function() {
      query(this.generalPill).addClass('active');
      query(this.advancedPill).removeClass('active');
    },
    
    submitOAuthService: function(oAuth) {
      this.getServicesService().createNewService(oAuth, {
        success: function(data) {
          console.log(JSON.stringify(data));
        },
        error: function(data) {
          console.error("There was an error");
        }
      }); 
    },
    
    
    /**
     * Getter method for the servicesService module for testing purposes.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceModal#
     * @returns {servicesService} The servicesService object.
     */
    getServicesService : function() {
      return servicesService;
    }
  });
});