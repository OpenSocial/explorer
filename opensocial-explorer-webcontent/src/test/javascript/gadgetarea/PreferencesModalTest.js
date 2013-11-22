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
define(['explorer/widgets/gadgetarea/PreferencesModal', 'dojo/query', 
        'dojo/topic', 'dojo/dom-class'], function(PreferencesModal, query, topic, domClass){
  describe('A PreferencesModal widget', function() {
    
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
              "orderedEnumValues": [
                                    {
                                      "value": "Red",
                                      "displayValue": "Red"
                                    },
                                    {
                                      "value": "Green",
                                      "displayValue": "Green"
                                    },
                                    {
                                      "value": "Blue",
                                      "displayValue": "Blue"
                                    },
                                    {
                                      "value": "Gray",
                                      "displayValue": "Gray"
                                    },
                                    {
                                      "value": "Purple",
                                      "displayValue": "Purple"
                                    },
                                    {
                                      "value": "Black",
                                      "displayValue": "Black"
                                    }
                                    ]
            }
    };
  
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
    });
  
    it("can be started", function() {
      var prefModal = new PreferencesModal();
    
      document.getElementById('testDiv').appendChild(prefModal.domNode);
      prefModal.startup();
      expect(query('div.modal-header h3', prefModal.domNode).innerHTML()).toEqual('Preferences');
      expect(query('.btn', prefModal.domNode).length).toEqual(2);
      prefModal.destroy();
    });
    
    it("supports adding preferences", function() {
      var prefModal = new PreferencesModal();
      document.getElementById('testDiv').appendChild(prefModal.domNode);
      prefModal.startup();
      prefModal.addPrefsToUI(prefs);
      expect(query('.control-group', this.domNode).length).toEqual(5);
      prefModal.destroy();
    });
    
    it("can notify pref listeners", function() {
      var prefModal = new PreferencesModal();
      document.getElementById('testDiv').appendChild(prefModal.domNode);
      prefModal.startup();
      prefModal.addPrefsToUI(prefs);
      var myPrefs;
      prefModal.addPrefsChangedListener(function(prefs) {
        myPrefs = prefs;
      });
      prefModal.show();
      query('.btn-primary', prefModal.domNode)[0].click();
      expect(myPrefs).toEqual({
        "hello_pref" : "World",
        "number_pref" : "0",
        "list_pref" : "foo|bar|foobar",
        "boolean_pref" : false,
        "enum_pref" : "Red"
      });
      prefModal.destroy();
    });
    
    it("does not notify pref listeners if invalid", function() {
      var prefModal = new PreferencesModal();
      document.getElementById('testDiv').appendChild(prefModal.domNode);
      prefModal.startup();
      prefModal.addPrefsToUI(prefs);
      var myPrefs;
      prefModal.addPrefsChangedListener(function(prefs) {
        myPrefs = prefs;
      });
      spyOn(prefModal, 'isValid').andReturn(false);
      prefModal.show();
      query('.btn-primary', prefModal.domNode)[0].click();
      expect(myPrefs).toBeUndefined();
      prefModal.destroy();
    });
    
    it("allows consumers to set preferences", function() {
      var prefModal = new PreferencesModal();
      document.getElementById('testDiv').appendChild(prefModal.domNode);
      prefModal.startup();
      prefModal.addPrefsToUI(prefs);
      prefModal.setPrefs({
        "hello_pref" : "Foo",
        "number_pref" : "1",
        "list_pref" : "foo|foobar",
        "boolean_pref" : true,
        "enum_pref" : "Blue"
      });
      expect(prefModal.getPrefs()).toEqual({
        "hello_pref" : "Foo",
        "number_pref" : "1",
        "list_pref" : "foo|foobar",
        "boolean_pref" : true,
        "enum_pref" : "Blue"
      });
      prefModal.destroy();
    });
    
    it("can be shown via a topic", function() {
      var prefModal = new PreferencesModal();
      document.getElementById('testDiv').appendChild(prefModal.domNode);
      prefModal.startup();
      topic.publish('org.opensocial.explorer.prefdialog.show');
      expect(domClass.contains(prefModal.domNode, 'hide')).toBeFalsy();
      prefModal.destroy();
    });
    
    it("can be hidden via a topic", function() {
      var prefModal = new PreferencesModal();
      document.getElementById('testDiv').appendChild(prefModal.domNode);
      prefModal.startup();
      topic.publish('org.opensocial.explorer.prefdialog.hide');
      expect(domClass.contains(prefModal.domNode, 'hide')).toBeTruthy();
      prefModal.destroy();
    });
  });
});