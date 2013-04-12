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
        'dojo/text!./../templates/MenuItem.html', 'dojo/dom-construct',
        'dojo/dom-class', 'modules/widgets/DropDownMenu', 'dojo/on'],
        function(declare, WidgetBase, TemplatedMixin,
                template, domConstruct, domClass, DropDownMenu, on) {
            return declare('MenuItemWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                
                postCreate : function() {
                  
                },
                
                startup : function() {
                  if(this.onclick) {
                    on(this.domNode,'click', this.onclick);
                  }
                  
                  if(this.menuItems) {
                    this.setSubMenuContent(this.menuItems.items, this.menuItems.direction);
                  }
                },
                
                setSubMenuContent : function(menuItems, opt_direction) {
                  this.createSubMenu(opt_direction);
                  this.subMenu.clearMenuItems();
                  for(var i = 0; i < menuItems.length; i++) {
                    this.subMenu.addMenuItem(menuItems[i]);
                  }
                },
                
                createSubMenu : function(opt_direction) {
                  if(!this.subMenu) {
                    this.subMenu = new DropDownMenu();
                    domConstruct.place(this.subMenu.domNode, this.domNode);
                    this.subMenu.startup();
                    domClass.add(this.domNode, 'dropdown-submenu');
                    if(opt_direction) {
                      domClass.add(this.domNode, opt_direction);
                    }
                  }
                },
                
                getValue : function() {},
                
                addSubMenuItem : function(menuItem, opt_direction) {
                  this.createSubMenu(opt_direction);
                  this.subMenu.addMenuItem(menuItem);
                },
                
                removeSubMenuItem : function(menuName) {
                  this.subMenu.removeMenuItem(menuName);
                },
                
                getSubMenuItem : function(menuName) {
                  return this.subMenu.getMenuItem(menuName);
                }
            });
        });