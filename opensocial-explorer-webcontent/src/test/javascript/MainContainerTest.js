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
define(['explorer/widgets/MainContainer', 'dojo/_base/declare', 'dojo/Evented', 'dojo/dom-class', 'dojo/query',
        'dojo/topic', 'explorer/gadget-spec-service', 'dojo/Deferred'], 
        function(MainContainer, declare, Evented, domClass, query, topic, gadgetSpecService, Deferred){
  describe('An MainContainer widget', function() {
    
    var MockContainer = declare([Evented], {
      fireSetPreferences : function(site, url, preferences) {
        this.emit('setpreferences', site, url, preferences);
      }
    });
  
    var prefs = {
            "hello_pref": {
              "name": "hello_pref",
              "defaultValue": "World",
              "displayName": "Name",
              "dataType": "STRING",
              "required": true,
              "orderedEnumValues": []
            },
            "number_pref": {
              "name": "number_pref",
              "defaultValue": "0",
              "displayName": "Number",
              "dataType": "STRING",
              "required": true,
              "orderedEnumValues": []
            },
            "list_pref": {
              "name": "list_pref",
              "defaultValue": "foo|bar|foobar",
              "displayName": "List",
              "dataType": "LIST",
              "required": true,
              "orderedEnumValues": []
            },
            "boolean_pref": {
              "name": "boolean_pref",
              "defaultValue": "false",
              "displayName": "Boolean",
              "dataType": "BOOL",
              "required": true,
              "orderedEnumValues": []
            },
            "enum_pref": {
              "name": "enum_pref",
              "defaultValue": "Red",
              "displayName": "Enum",
              "dataType": "ENUM",
              "required": true,
              "orderedEnumValues": [{"value": "Red", "displayValue": "Red"}, {"value": "Green", "displayValue": "Green"},
                                    {"value": "Blue", "displayValue": "Blue"}, {"value": "Gray", "displayValue": "Gray"},
                                    {"value": "Purple", "displayValue": "Purple"},{"value": "Black", "displayValue": "Black"}]
            }
    };
  
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
      mainContainer = new MainContainer();
      var dfd = new Deferred();
      spyOn(dfd, 'then').andReturn(undefined);
      spyOn(gadgetSpecService, 'getSpecTree').andReturn(dfd);
      spyOn(gadgetSpecService, 'getDefaultGadgetSpec').andReturn(dfd);
      mockContainer = new MockContainer();
      spyOn(mainContainer.gadgetArea, 'getExplorerContainer').andReturn(mockContainer);
      document.getElementById('testDiv').appendChild(mainContainer.domNode);
      mainContainer.startup();
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
      mainContainer.destroy();
    });
    
    it("handle preferences changing", function() {
      mainContainer.prefModal.addPrefsToUI(prefs);
      spyOn(mainContainer.gadgetArea, 'reRenderGadget').andReturn(undefined);
      mainContainer.prefModal.notifyPrefsChangedListeners();
      expect(mainContainer.gadgetArea.reRenderGadget.calls.length).toEqual(1);
    }); 
    
    it("handles the setpreferences event", function() {
      spyOn(mainContainer.prefModal, 'setPrefs').andCallThrough();
      mockContainer.fireSetPreferences(jasmine.createSpy('site'), 'http://example.com/gadget.xml', {"set_pref" : "1234"});
      expect(mainContainer.prefModal.setPrefs).toHaveBeenCalledWith({"set_pref" : "1234"});
    });
  });
});