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

/**
 * An individual item in the DropDownMenu.
 *
 * @module modules/widgets/MenuItemWidget
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/text!./../templates/MenuItem.html', 'dojo/dom-construct',
        'dojo/dom-class', 'modules/widgets/DropDownMenu', 'dojo/on'],
        function(declare, WidgetBase, TemplatedMixin, template, domConstruct, domClass, DropDownMenu, on) {
  return declare('MenuItemWidget', [ WidgetBase, TemplatedMixin ], {
    templateString : template,

    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:modules/widgets/MenuItemWidget#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      if(this.onclick) {
        on(this.domNode,'click', this.onclick);
      }

      if(this.menuItems) {
        this.setSubMenuContent(this.menuItems.items, this.menuItems.direction);
      }
    },

    /**
     * Sets the MenuItem's submenu.
     *
     * @memberof module:modules/widgets/MenuItemWidget#
     * @param {MenuItemWidget[]} menuItems - The array of MenuItems to add to the submenu.
     * @param {String} opt-direction - The direction the submenu will display when moused over.
     */
    setSubMenuContent : function(menuItems, opt_direction) {
      this.createSubMenu(opt_direction);
      this.subMenu.clearMenuItems();
      for(var i = 0; i < menuItems.length; i++) {
        this.subMenu.addMenuItem(menuItems[i]);
      }
    },

    /**
     * Creates the submenu of the MenuItem if it doesn't exist yet and adds it to the dom in the specified direction.
     *
     * @memberof module:modules/widgets/MenuItemWidget#
     * @param {MenuItemWidget[]} menuItems - The array of MenuItems to add to the submenu.
     * @param {String} opt_direction - The direction the submenu will display when moused over.
     */
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
    
    /**
     * Adds a MenuItem to the child DropDownMenu of this MenuItem.
     *
     * @memberof module:modules/widgets/MenuItemWidget#
     * @param {MenuItemWidget} menuItem - The MenuItem to add.
     * @param {String} opt_direction - The direction the submenu will display when moused over.
     */
    addSubMenuItem : function(menuItem, opt_direction) {
      this.createSubMenu(opt_direction);
      this.subMenu.addMenuItem(menuItem);
    },

    /**
     * Removes a MenuItem from the child DropDownMenu of this MenuItem.
     *
     * @memberof module:modules/widgets/MenuItemWidget#
     * @param {String} menuName - The name of MenuItem to remove.
     */
    removeSubMenuItem : function(menuName) {
      this.subMenu.removeMenuItem(menuName);
    },

    /**
     * Gets a MenuItem from the child DropDownMenu of this MenuItem.
     *
     * @memberof module:modules/widgets/MenuItemWidget#
     * @param {String} menuName - The name of MenuItem to retrieve.
     * @returns {MenuItemWidget} The MenuItem that matches the name.
     */
    getSubMenuItem : function(menuName) {
      return this.subMenu ? this.subMenu.getMenuItem(menuName) : undefined;
    }
  });
});