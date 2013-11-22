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
define(['explorer/widgets/creation/CreationServiceModal', 'explorer/widgets/creation/CreationMenu', 
        'dojo/topic', 'dojo/dom-class', 'dojo/dom-style', 'explorer/services-service', 'dojo/Deferred'], 
        function(CreationServiceModal, CreationMenu, topic, domClass, domStyle, servicesService, Deferred){
  describe('An CreationServiceModal widget', function() {
    
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
    });
    
    it("can be shown", function() {
      var creationMenu = new CreationMenu();
      document.getElementById('testDiv').appendChild(creationMenu.domNode);
      
      creationMenu.addServiceButton.click();
      
      expect(domClass.contains(creationMenu.serviceModal.domNode), "hide").toBe(false);
      
      creationMenu.destroy();
    }); 
    
    it("can fetch existing services with no data", function() {
      var creationServiceModal = new CreationServiceModal();
      document.getElementById('testDiv').appendChild(creationServiceModal.domNode);
      
      spyOn(servicesService, "getServices").andCallFake(function() {
        var dfd = new Deferred();
        var data = [];
        dfd.resolve(data);
        return dfd;
      });
      
      creationServiceModal.show();

      expect(domClass.contains(creationServiceModal.noServices, "hide")).toBe(false);
      expect(domClass.contains(creationServiceModal.oAuth, "hide")).toBe(true);
      
      creationServiceModal.destroy();
    });
    
    it("can fetch existing services with data", function() {
      var testData = {
          name: "testName",
          key: "testKey",
          secret: "testSecret",
          keyType: "testKeyType",
          callbackUrl : "testCallbackUrl"
      };
      
      var creationServiceModal = new CreationServiceModal();
      document.getElementById('testDiv').appendChild(creationServiceModal.domNode);
      
      spyOn(creationServiceModal, "addServiceItem");
      spyOn(servicesService, "getServices").andCallFake(function() {
        var dfd = new Deferred();
        var data = [testData];
        dfd.resolve(data);
        return dfd;
      });
      
      creationServiceModal.show();

      expect(domClass.contains(creationServiceModal.noServices, "hide")).toBe(true);
      expect(domClass.contains(creationServiceModal.oAuth, "hide")).toBe(false);
      expect(creationServiceModal.addServiceItem).toHaveBeenCalledWith(testData);
      
      creationServiceModal.destroy();
    });
    
    it("can create a new service and display the services tab afterwards", function() {
      var testData = {
          version: "OAuth",
          st: "testSt",
          name: "testName",
          key: "testKey",
          secret: "testSecret",
          keyType: "HMAC_SYMMETRIC",
          callbackUrl : "%origin%%contextRoot%/gadgets/oauthcallback"
      };
      
      var creationServiceModal = new CreationServiceModal();
      document.getElementById('testDiv').appendChild(creationServiceModal.domNode);
      
      spyOn(creationServiceModal, "getToken").andReturn("testSt");
      spyOn(creationServiceModal, "addServiceItem");
      spyOn(servicesService, "createNewService").andCallFake(function() {
        var dfd = new Deferred();
        var data = [testData];
        dfd.resolve(data);
        return dfd;
      });
      
      creationServiceModal.oAuthName.value = "testName";
      creationServiceModal.oAuthKey.value = "testKey";
      creationServiceModal.oAuthSecret.value = "testSecret";
      creationServiceModal.toggleTab();
      creationServiceModal.serviceSubmit.click();
      
      expect(creationServiceModal.addServiceItem).toHaveBeenCalledWith(testData);
      expect(domClass.contains(creationServiceModal.servicesTab, "active")).toBe(true);
      expect(domClass.contains(creationServiceModal.oAuthFieldsValidation, "hide")).toBe(true);
      
      creationServiceModal.destroy();
    });
    
    it("resets user inputted fields after a successful submission", function() {
      var testData = {
          version: "OAuth",
          st: "testSt",
          name: "testName",
          key: "testKey",
          secret: "testSecret",
          keyType: "PLAINTEXT",
          callbackUrl : "%origin%%contextRoot%/gadgets/oauthcallback"
      };
      
      var creationServiceModal = new CreationServiceModal();
      document.getElementById('testDiv').appendChild(creationServiceModal.domNode);
      
      spyOn(creationServiceModal, "getToken").andReturn("testSt");
      spyOn(creationServiceModal, "addServiceItem");
      spyOn(servicesService, "createNewService").andCallFake(function() {
        var dfd = new Deferred();
        var data = [testData];
        dfd.resolve(data);
        return dfd;
      });
      
      creationServiceModal.oAuthName.value = "testName";
      creationServiceModal.oAuthKey.value = "testKey";
      creationServiceModal.oAuthSecret.value = "testSecret";
      creationServiceModal.oAuthKeyType.selectedIndex = 1;
      creationServiceModal.toggleTab();
      creationServiceModal.serviceSubmit.click();
      
      expect(creationServiceModal.oAuthName.value).toBe("");
      expect(creationServiceModal.oAuthKey.value).toBe("");
      expect(creationServiceModal.oAuthSecret.value).toBe("");
      expect(creationServiceModal.oAuthKeyType.selectedIndex).toBe(0);
      
      expect(creationServiceModal.addServiceItem).toHaveBeenCalledWith(testData);
      expect(domClass.contains(creationServiceModal.servicesTab, "active")).toBe(true);
      expect(domClass.contains(creationServiceModal.oAuthFieldsValidation, "hide")).toBe(true);
      
      creationServiceModal.destroy();
    });
    
    it("will prompt the user to fill out all fields if any are left blank upon submission", function() {
      var testData = {
          version: "OAuth",
          st: "testSt",
          name: "",
          key: "",
          secret: "",
          keyType: "HMAC_SYMMETRIC",
          callbackUrl : "%origin%%contextRoot%/gadgets/oauthcallback"
      };
      
      var creationServiceModal = new CreationServiceModal();
      document.getElementById('testDiv').appendChild(creationServiceModal.domNode);
      
      spyOn(creationServiceModal, "getToken").andReturn("testSt");
      spyOn(creationServiceModal, "validateFields");
      creationServiceModal.toggleTab();
      creationServiceModal.serviceSubmit.click();
      
      expect(creationServiceModal.validateFields).toHaveBeenCalledWith(testData);
      expect(domClass.contains(creationServiceModal.oAuthFieldsValidation, "hide")).toBe(false);
      
      creationServiceModal.destroy();
    }); 
    
    it("changes its content when a different oAuth selection in the dropdown is toggled", function() {
      var testData = {
          version: "OAuth",
          st: "testSt",
          name: "",
          key: "",
          secret: "",
          keyType: "HMAC_SYMMETRIC",
          callbackUrl : "%origin%%contextRoot%/gadgets/oauthcallback"
      };
      
      var creationServiceModal = new CreationServiceModal();
      document.getElementById('testDiv').appendChild(creationServiceModal.domNode);
      
      spyOn(creationServiceModal, "clearContent").andCallThrough();
      
      creationServiceModal.serviceSelection.value = "OAuth2";
      
      expect(domClass.contains(creationServiceModal.oAuthGeneralContent, "active")).toBe(true);
      
      creationServiceModal.dropdownClickHandler();
      
      expect(creationServiceModal.clearContent).toHaveBeenCalled(); 
      expect(domClass.contains(creationServiceModal.generalPill, "active")).toBe(true);
      expect(domClass.contains(creationServiceModal.advancedPill, "active")).toBe(false);
      expect(domClass.contains(creationServiceModal.oAuth2GeneralContent, "active")).toBe(true); 
      expect(domClass.contains(creationServiceModal.oAuthGeneralContent, "active")).toBe(false);
      
      creationServiceModal.destroy();
    }); 
  });
});