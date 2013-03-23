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
        'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(lang, declare, DropDownMenu, query, domClass, MenuItemWidget, osData) {
            return declare('GadgetDropDownMenuWidget', [ DropDownMenu ], {
                startup : function() {
                  var self = this,
                      subMenuItems = [];
                  domClass.add(this.domNode, 'gadgetMenuDropDown');
                  this.preferencesMenuItem = new MenuItemWidget({"name" : "Preferences", "onclick" : function(e) {
                    self.prefDialog.show();
                  }});
                  this.addMenuItem(this.preferencesMenuItem);
                  this.viewsMenu = new MenuItemWidget({"name" : "Views"});
                  this.addMenuItem(this.viewsMenu);
                  this.selectionMenu = new MenuItemWidget({"name" : "Selection"});
                  this.addMenuItem(this.createSelectionMenu());
                  
                  // Setup menus for actions.
                  this.actionsMenu = new MenuItemWidget({"name" : "Actions"});
                  this.addMenuItem(this.actionsMenu);
                  this.actionsMenu.setSubMenuContent([], 'pull-left');
                  this.addMenuItem(this.createLocationMenu());
                },
                
                createSelectionMenu : function() {
                  var items = [],
                      self = this;
                  items.push(new MenuItemWidget({"name" : "opensocial.Person", "onclick" : function(e) {
                    self.publishSelection('opensocial.Person');
                  }}));
                  items.push(new MenuItemWidget({"name" : "opensocial.File", "onclick" : function(e) {
                    self.publishSelection('opensocial.File');
                  }}));
                  items.push(new MenuItemWidget({"name" : "opensocial.Message", "onclick" : function(e) {
                    self.publishSelection('opensocial.Message');
                  }}));
                  return new MenuItemWidget({"name" : "Selection", "menuItems" : {"items" : items, "direction" : "pull-left"}});
                },
                
                createLocationMenu : function() {
                  var items = [];
                  items.push(new MenuItemWidget({"name" : "Side", "onclick" : function(e) {
                    query('div.editor').removeClass('topBottom');
                    query('div.result').removeClass('topBottom');
                    query('.CodeMirror-scroll').removeClass('topBottom');
                    require(['modules/widgets/editorarea/EditorArea'], function(EditorArea){
                      EditorArea.getInstance().getEditorTabs().refreshEditors();
                    });
                  }}));
                  items.push(new MenuItemWidget({"name" : "Bottom", "onclick" : function(e) {
                    query('div.editor').addClass('topBottom');
                    query('div.result').addClass('topBottom');
                    query('.CodeMirror-scroll').addClass('topBottom');
                    //TODO investigate why requiring the EditorArea module in the GadgetDropDownMenu module
                    //returns an empty object.  For now this seems to work but seems unnecessary.
                    require(['modules/widgets/editorarea/EditorArea'], function(EditorArea){
                      EditorArea.getInstance().getEditorTabs().refreshEditors();
                    });
                  }}));
                  return new MenuItemWidget({"name" : "Location" , "menuItems" : {"items" : items, "direction" : "pull-left"}});
                },
                
                setViews : function(views) {
                  var items = [];
                  for(var key in views) {
                    items.push(new MenuItemWidget({"name" : key, "onclick" : lang.hitch(this, function(key){
                      this.gadgetArea.reRenderGadget({"view" : key});
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