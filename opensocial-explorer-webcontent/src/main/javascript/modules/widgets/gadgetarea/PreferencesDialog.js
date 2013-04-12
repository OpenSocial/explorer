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
define(['dojo/_base/declare',  'modules/widgets/ModalDialog', 'dojo/query', 'dojo/dom-construct',
        'modules/widgets/controlgroups/StringControlGroup', 'modules/widgets/controlgroups/BooleanControlGroup', 'modules/widgets/controlgroups/EnumControlGroup', 
        'modules/widgets/controlgroups/ListControlGroup', 'dojo/on', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ModalDialog, query, domConstruct, StringControlGroup, BooleanControlGroup, EnumControlGroup, ListControlGroup, on) {
            return declare('ModalDialogWidget', [ ModalDialog ], {
                
                constructor : function() {
                  this.controlGroups = {};
                  this.prefsChangedListeners = [];
                },
                
                postCreate : function() {
                  var form = domConstruct.create('div', {"class" : "form-horizontal"}),
                      self = this,
                      closeBtn = domConstruct.create('button', {"class" : "btn", "innerHTML" : "Close"}),
                      saveBtn = domConstruct.create('button', {"class" : "btn btn-primary", "innerHTML" : "Save"}),
                      footer = query('.modal-footer', this.domNode);
                  query('.modal-body', this.domNode).append(form);
                  on(closeBtn, 'click', function(e) {
                    self.hide();
                  });
                  on(saveBtn, 'click', function(e) {
                    self.hide();
                    self.notifyPrefsChangedListeners.call(self);
                  });
                  footer.append(saveBtn);
                  footer.append(closeBtn);
                },
                
                startup : function() {
                  this.setHeaderTitle('Preferences');
                  this.inherited(arguments);
                },
                
                addPrefsToUI : function(prefs) {
                  query('.form-horizontal > *', this.domNode).remove();
                  //TODO we probably need to destroy the widgets created as well
                  for(var key in prefs) {
                    var pref = prefs[key];
                    this.addPrefToUI(pref);
                  }
                },
                
                addPrefToUI : function(pref) {
                  var controlGroup;
                  if(pref.dataType === 'BOOL') {
                    controlGroup = new BooleanControlGroup(pref);
                  } else if(pref.dataType === 'ENUM') {
                    controlGroup = new EnumControlGroup(pref);
                  } else if(pref.dataType === 'STRING') {
                    controlGroup = new StringControlGroup(pref);
                  } else if(pref.dataType === 'LIST') {
                    controlGroup = new ListControlGroup(pref);
                  }
                  if(controlGroup) {
                    var form = query('.modal-body .form-horizontal', this.domNode);
                    form.append(controlGroup.domNode);
                    controlGroup.startup();
                    this.controlGroups[pref.name] = controlGroup;
                  }
                },
                
                notifyPrefsChangedListeners : function() {
                  if(!this.isValid()) {
                    return;
                  }
                  var prefs = {};
                  for(var key in this.controlGroups) {
                    prefs[this.controlGroups[key].name] = this.controlGroups[key].getValue();
                  }
                  for(var j = 0; j < this.prefsChangedListeners.length; j++) {
                    this.prefsChangedListeners[j](prefs);
                  }
                },
                
                isValid : function() {
                  //TODO go through and validate each field to make sure that the required prefs have values
                  return true;
                },
                
                addPrefsChangedListener : function(listener) {
                  this.prefsChangedListeners.push(listener);
                },
                
                setPrefs : function(prefs) {
                  for(var key in prefs) {
                    var controlGroup = this.controlGroups[key];
                    if(controlGroup) {
                      controlGroup.setValue(prefs[key]);
                    }
                  }
                }
            });
        });