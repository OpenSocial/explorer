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
define(['dojo/_base/lang', 'dojo/_base/declare', 'modules/widgets/DropDownMenu',
        'dojo/query', 'dojo/dom-class', 'modules/widgets/MenuItemWidget', 'modules/opensocial-data',
        'dojo/text!./../../templates/GadgetDropDownMenu.html', 'dijit/_WidgetsInTemplateMixin',
        'dojo/on', 'dojo/topic', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(lang, declare, DropDownMenu, query, domClass, MenuItemWidget, osData, template, WidgetsInTemplateMixin,
                on, topic) {
            return declare('GadgetDropDownMenuWidget', [ DropDownMenu, WidgetsInTemplateMixin ], {
                templateString : template,
                
                startup : function() {
                  var self = this;
                  on(this.personMenuOption.domNode,'click', function(e) {
                    self.publishSelection('opensocial.Person');
                  });
                  on(this.fileMenuOption.domNode,'click', function(e) {
                    self.publishSelection('opensocial.File');
                  });
                  on(this.messageMenuOption.domNode,'click', function(e) {
                    self.publishSelection('opensocial.Message');
                  });
                  on(this.sideMenuOption.domNode,'click', function(e) {
                    query('div.editor').removeClass('topBottom');
                    query('div.result').removeClass('topBottom');
                    query('.CodeMirror-scroll').removeClass('topBottom');
                    require(['modules/widgets/editorarea/EditorArea'], function(EditorArea){
                      EditorArea.getInstance().getEditorTabs().refreshEditors();
                    });
                  });
                  on(this.bottomMenuOption.domNode,'click', function(e) {
                    query('div.editor').addClass('topBottom');
                    query('div.result').addClass('topBottom');
                    query('.CodeMirror-scroll').addClass('topBottom');
                    //TODO investigate why requiring the EditorArea module in the GadgetDropDownMenu module
                    //returns an empty object.  For now this seems to work but seems unnecessary.
                    require(['modules/widgets/editorarea/EditorArea'], function(EditorArea){
                      EditorArea.getInstance().getEditorTabs().refreshEditors();
                    });
                  });
                  on(this.preferencesMenuItem.domNode, 'click', function(e) {
                    topic.publish('org.opensocial.explorer.prefdialog.show');
                  });
                },
                
                setViews : function(views) {
                  var items = [];
                  for(var key in views) {
                    items.push(new MenuItemWidget({"name" : key, "onclick" : lang.hitch(this, function(key){
                      require(['modules/widgets/gadgetarea/GadgetArea'], function(GadgetArea) {
                        GadgetArea.getInstance().reRenderGadget({"view" : key});
                      });
                    }, key)}));
                  }
                  this.viewsMenu.setSubMenuContent(items, 'pull-left');
                },
                
                addAction : function(action) {
                  var actionItem = new MenuItemWidget({"name" : action.label || action.id, "onclick" : action.runAction});
                  if (action.path) {
                    // Just add it to the menu
                    this.actionsMenu.addSubMenuItem(actionItem);
                  } else {
                    // It's an action contributed to a type
                    var typeMenu = this.actionsMenu.getSubMenuItem(action.dataType);
                    if (!typeMenu) {
                      typeMenu = new MenuItemWidget({"name" : action.dataType});
                      this.actionsMenu.addSubMenuItem(typeMenu, 'pull-left');
                    }
                    typeMenu.addSubMenuItem(actionItem, 'pull-left');
                  }
                },
                
                removeAction : function(action) {
                  // TODO: Removing an action by name is not the most reliable thing to do. Should
                  // we create an "actionId" to pass to the MenuItemWidget constructor that we can
                  // use when removing the menu items?
                  
                  var actionName = action.label || action.id;
                  if (action.path) {
                    // Simply remove the item from the subMenu
                    this.actionsMenu.removeSubMenuItem(actionName);
                  } else {
                    // It's an action contributed to a type
                    var typeMenu = this.actionsMenu.getSubMenuItem(action.dataType);
                    typeMenu.removeSubMenuItem(actionName);
                    
                    // FIXME: If all actions of a given type have been removed, remove the type menu item
                  }
                },

                publishSelection : function(type) {
                  var selection = osData.get(type);
                  if(selection) {
                    //TODO investigate why requiring the GadgetArea module in the GadgetDropDownMenu module
                    //returns an empty object.  For now this seems to work but seems unnecessary.
                    require(['modules/widgets/gadgetarea/GadgetArea'], function(GadgetArea) {
                      GadgetArea.getInstance().getContainer().selection.setSelection(selection); 
                    });
                  }
                }
            });
        });