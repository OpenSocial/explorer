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
define(['explorer/widgets/gadgetarea/PreferencesDialog', 'dojo/query', 
        'dojo/topic', 'dojo/dom-class'], function(PreferencesDialog, query, topic, domClass){
  describe('A PreferencesDialog widget', function() {
    
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
      var prefDialog = new PreferencesDialog();
    
      document.getElementById('testDiv').appendChild(prefDialog.domNode);
      prefDialog.startup();
      expect(query('div.modal-header h3', prefDialog.domNode).innerHTML()).toEqual('Preferences');
      expect(query('.btn', prefDialog.domNode).length).toEqual(2);
      prefDialog.destroy();
    });
    
    it("supports adding preferences", function() {
      var prefDialog = new PreferencesDialog();
      document.getElementById('testDiv').appendChild(prefDialog.domNode);
      prefDialog.startup();
      prefDialog.addPrefsToUI(prefs);
      expect(query('.control-group', this.domNode).length).toEqual(5);
      prefDialog.destroy();
    });
    
    it("can notify pref listeners", function() {
      var prefDialog = new PreferencesDialog();
      document.getElementById('testDiv').appendChild(prefDialog.domNode);
      prefDialog.startup();
      prefDialog.addPrefsToUI(prefs);
      var myPrefs;
      prefDialog.addPrefsChangedListener(function(prefs) {
        myPrefs = prefs;
      });
      prefDialog.show();
      query('.btn-primary', prefDialog.domNode)[0].click();
      expect(myPrefs).toEqual({
        "hello_pref" : "World",
        "number_pref" : "0",
        "list_pref" : "foo|bar|foobar",
        "boolean_pref" : false,
        "enum_pref" : "Red"
      });
      prefDialog.destroy();
    });
    
    it("does not notify pref listeners if invalid", function() {
      var prefDialog = new PreferencesDialog();
      document.getElementById('testDiv').appendChild(prefDialog.domNode);
      prefDialog.startup();
      prefDialog.addPrefsToUI(prefs);
      var myPrefs;
      prefDialog.addPrefsChangedListener(function(prefs) {
        myPrefs = prefs;
      });
      spyOn(prefDialog, 'isValid').andReturn(false);
      prefDialog.show();
      query('.btn-primary', prefDialog.domNode)[0].click();
      expect(myPrefs).toBeUndefined();
      prefDialog.destroy();
    });
    
    it("allows consumers to set preferences", function() {
      var prefDialog = new PreferencesDialog();
      document.getElementById('testDiv').appendChild(prefDialog.domNode);
      prefDialog.startup();
      prefDialog.addPrefsToUI(prefs);
      prefDialog.setPrefs({
        "hello_pref" : "Foo",
        "number_pref" : "1",
        "list_pref" : "foo|foobar",
        "boolean_pref" : true,
        "enum_pref" : "Blue"
      });
      expect(prefDialog.getPrefs()).toEqual({
        "hello_pref" : "Foo",
        "number_pref" : "1",
        "list_pref" : "foo|foobar",
        "boolean_pref" : true,
        "enum_pref" : "Blue"
      });
      prefDialog.destroy();
    });
    
    it("can be shown via a topic", function() {
      var prefDialog = new PreferencesDialog();
      document.getElementById('testDiv').appendChild(prefDialog.domNode);
      prefDialog.startup();
      topic.publish('org.opensocial.explorer.prefdialog.show');
      expect(domClass.contains(prefDialog.domNode, 'hide')).toBeFalsy();
      prefDialog.destroy();
    });
    
    it("can be hidden via a topic", function() {
      var prefDialog = new PreferencesDialog();
      document.getElementById('testDiv').appendChild(prefDialog.domNode);
      prefDialog.startup();
      topic.publish('org.opensocial.explorer.prefdialog.hide');
      expect(domClass.contains(prefDialog.domNode, 'hide')).toBeTruthy();
      prefDialog.destroy();
    });
  });
});