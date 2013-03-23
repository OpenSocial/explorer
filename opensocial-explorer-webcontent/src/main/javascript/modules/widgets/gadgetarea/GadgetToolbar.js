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
        'dojo/query', 'dojo/text!./../../templates/GadgetToolbar.html',
        'modules/widgets/gadgetarea/GadgetMenuButton', 'modules/widgets/gadgetarea/PreferencesDialog', 'dojo/dom-construct', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, WidgetBase, TemplatedMixin, query, template, GadgetMenuButton, PreferencesDialog, domConstruct) {
            return declare('GadgetToolbarWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                
                startup : function() {
                  this.prefDialog = new PreferencesDialog();
                  domConstruct.place(this.prefDialog.domNode, this.domNode);
                  this.prefDialog.startup();
                  
                  this.gadgetMenuButton = new GadgetMenuButton({"gadgetArea" : this.gadgetArea, "prefDialog" : this.prefDialog});
                  query('.navbar-inner .nav-collapse .navbar-form', this.domNode).append(this.gadgetMenuButton.domNode);
                  this.gadgetMenuButton.startup();
                },
                
                getTitle : function(metadata) {
                  var title = 'Gadget';
                  if(metadata.modulePrefs) {
                    if(metadata.modulePrefs.title && metadata.modulePrefs.title.length) {
                      title = metadata.modulePrefs.title;
                    }
                  }
                  return title;
                },
                
                setGadgetMetadata : function(metadata) {
                  query('.brand', this.domNode).innerHTML(this.getTitle(metadata));
                  this.gadgetMenuButton.constructMenu(metadata);
                  this.prefDialog.addPrefsToUI(metadata.userPrefs);
                },
                
                getPrefDialog : function() {
                  return this.prefDialog;
                },
                
                addAction : function(action) {
                  // For now, all actions go to the menu
                  this.gadgetMenuButton.getGadgetDropDownMenu().addAction(action);
                },
                
                removeAction : function(action) {
                  this.gadgetMenuButton.getGadgetDropDownMenu().removeAction(action);
                }
             });
        });