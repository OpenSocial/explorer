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
        'dojo/query', 'dojo/text!./../../templates/EditorToolbar.html', 'dojo/on',
        'dojo/dom-class', 'modules/gadget-spec-service', 
        'dojo/NodeList-manipulate', 'dojo/NodeList-dom', 'dojo/ready', 'dojo/domReady!'],
        function(declare, WidgetBase, TemplatedMixin, query, 
                 template, on, domClass, gadgetSpecService) {
            return declare('EditorToolbarWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                
                startup : function() {
                  var self = this;
                  query('#renderBtn', this.domNode).on('click', function(e){
                    self.postGadgetSpec.call(self, function(data) {
                      self.editorArea.renderGadget(data.id);
                      require(['modules/widgets/sidebar/SidebarNav'], function(SidebarNav) {
                        var selectedObject = SidebarNav.getInstance().specTree.get("selectedItems")[0];
                        selectedObject.id = data.id;
                      });
                    });
                  });
                  
                  query('#renderEEBtn', this.domNode).on('click', function(e){
                    self.postGadgetSpec.call(self, function(data) {
                      self.editorArea.renderEmbeddedExperience(data.id);
                      require(['modules/widgets/sidebar/SidebarNav'], function(SidebarNav) {
                        var selectedObject = SidebarNav.getInstance().specTree.get("selectedItems")[0];
                        selectedObject.id = data.id;
                      });
                    });
                  });
                },
                
                setTitle: function(title) {
                  query('.brand', this.domNode)[0].innerHTML = title;
                },
                
                postGadgetSpec : function(thenFunction) {
                  var self = this;
                  this.getGadgetSpecService().createNewGadgetSpec(this.editorArea.getGadgetSpec(),{
                    success : thenFunction,
                    error : function(data) {
                      console.error("There was an error");
                    }
                  });
                },

                getGadgetSpecService : function() {
                  return gadgetSpecService;
                },
                
                showRenderEEButton: function() {
                  domClass.remove("renderEEBtn", "hide");
                },
                
                hideRenderEEButton: function() {
                  domClass.add("renderEEBtn", "hide");
                },
                
                showRenderGadgetButton: function() {
                  domClass.remove("renderBtn", "hide");
                },
                
                hideRenderGadgetButton: function() {
                  domClass.add("renderBtn", "hide");
                }
            });
        });