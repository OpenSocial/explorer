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
        'dojo/_base/array', 'dojo/text!./../../templates/EditorTabs.html',
        'dojo/dom-construct', 'modules/widgets/editorarea/CssEditor', 'modules/widgets/editorarea/GadgetEditor', 'modules/widgets/editorarea/HtmlEditor', 'modules/widgets/editorarea/JSEditor',
        'modules/widgets/editorarea/JSONEditor'],
        function(declare, WidgetBase, TemplatedMixin,
                arrayUtil, template, domConstruct, CssEditor, GadgetEditor, HtmlEditor, JSEditor, JSONEditor) {
            return declare('EditorTabsWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                
                constructor : function() {
                  this.tabs = [];
                },
                
                addTab : function(tab) {
                  tab.addPreActivationListener(this.tabActivated());
                  this.tabs.push(tab);
                  domConstruct.place(tab.domNode, this.domNode);
                  tab.startup();
                },
                
                tabActivated : function() {
                  var self = this;
                  return function() {
                    for(var i = 0; i < self.tabs.length; i++) {
                      self.tabs[i].deactivate();
                    }
                  };
                },
                
                removeAllTabs : function() {
                  for(var i = 0; i < this.tabs.length; i++) {
                    this.tabs[i].destroy();
                  }
                  this.tabs = [];
                },
                
                getGadgetSpec : function() {
                  var spec = {
                          "htmlResources" : [],
                          "cssResources" : [],
                          "jsResources" : []
                  };
                  for(var i = 0; i < this.tabs.length; i++) {
                    var tab = this.tabs[i];
                    var resource = tab.getResource();
                    var editor = tab.getEditor();
                    if(editor instanceof GadgetEditor) {
                      spec['gadgetResource'] = tab.getResource();
                    } else if(editor instanceof CssEditor) {
                      spec['cssResources'].push(tab.getResource());
                    } else if(editor instanceof JSEditor) {
                      spec['jsResources'].push(tab.getResource());
                    } else if(editor instanceof HtmlEditor) {
                      spec['htmlResources'].push(tab.getResource());
                    } else if(editor instanceof JSONEditor) {
                      spec['eeResource'] = tab.getResource();
                    }
                  }
                  return spec;
                },
                
                refreshEditors : function() {
                  arrayUtil.forEach(this.tabs, function(tab) {
                    tab.getEditor().refresh();
                  });
                }
            });
        });