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
 * A drop-down menu that displays MenuItems.
 *
 * @module explorer/widgets/DropDownMenu
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/_base/array', 'dojo/text!./../templates/DropDownMenu.html', 'dojo/dom-construct'],
        function(declare, WidgetBase, TemplatedMixin, arrayUtil, template, domConstruct) {
  return declare('DropDownMenuWidget', [ WidgetBase, TemplatedMixin ], {
    templateString : template,

    constructor : function() {
      this.menuItems = [];
    },

    /**
     * Adds a MenuItem to the menu.
     *
     * @memberof module:explorer/widgets/DropDownMenu#
     * @param {MenuItemWidget} menuItem - The MenuItem to add.
     */
    addMenuItem : function(menuItem) {
      this.menuItems.push(menuItem);
      domConstruct.place(menuItem.domNode, this.domNode);
      menuItem.startup();
    },

    /**
     * Clears all existing MenuItems in the menuItems array.
     *
     * @memberof module:explorer/widgets/DropDownMenu#
     */
    clearMenuItems : function() {
      for(var i = 0; i < this.menuItems.length; i++) {
        this.menuItems[i].destroy();
      }
      this.menuItems = [];
    },

    /**
     * Removes a MenuItem from the menuItems array.
     *
     * @memberof module:explorer/widgets/DropDownMenu#
     * @param {String} menuName - The name of MenuItem to remove.
     */
    removeMenuItem : function(menuName) {
      for(var i = 0; i < this.menuItems.length; i++) {
        if (this.menuItems[i].name === menuName) {
          this.menuItems[i].destroy();
          this.menuItems.splice(i, 1);
          // CONSIDER: Do we need to delete spliced array items?
              break;
        }
      }

      if (this.menuItems.length === 0) {
        // this.destroy();
        // TODO: If this.menuItems.length == 0 should I call this.destroy()? Can I show a
            // menu item with a label of <Empty>?
      }
    },

    /**
     * Gets a MenuItem from the menuItems array.
     *
     * @memberof module:explorer/widgets/DropDownMenu#
     * @param {String} menuName - The name of MenuItem to retrieve.
     * @returns {MenuItemWidget} The MenuItem that matches the name.
     */
    getMenuItem : function(menuName) {
      for(var i = 0; i < this.menuItems.length; i++) {
        if (this.menuItems[i].name === menuName) {
          return this.menuItems[i];
        }
      }
      return null;
    }
  });
});