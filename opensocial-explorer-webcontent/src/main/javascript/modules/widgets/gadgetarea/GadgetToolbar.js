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
 * Toolbar for GadgetArea that contains a gadget's title and the GadgetMenuButton.
 *
 * @module explorer/widgets/gadgetarea/GadgetToolbar
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @augments dijit/_WidgetsInTemplateMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/query', 'dojo/text!./../../templates/GadgetToolbar.html', './GadgetMenuButton', 
        'dojo/dom-construct', 'dijit/_WidgetsInTemplateMixin', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, WidgetBase, TemplatedMixin, query, template, GadgetMenuButton, domConstruct,
            WidgetsInTemplateMixin) {
  return declare('GadgetToolbarWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin ], {
    templateString : template,

    /**
     * Gets the title of the gadget.
     *
     * @memberof module:explorer/widgets/gadgetarea/GadgetToolbar#
     * @param {Object} metadata - Object with the gadget's metadata.
     */
    getTitle : function(metadata) {
      var title = 'Gadget';
      if(metadata.modulePrefs) {
        if(metadata.modulePrefs.title && metadata.modulePrefs.title.length) {
          title = metadata.modulePrefs.title;
        }
      }
      return title;
    },

    /**
     * Takes the gadget's metadata, sets the GadgetToolbar's title and constructs the GadgetDropDownMenu.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetToolbar#
     * @param {Object} metadata - Object with the gadget's metadata.
     */
    setGadgetMetadata : function(metadata) {
      query('.brand', this.domNode).innerHTML(this.getTitle(metadata));
      this.gadgetMenuButton.constructMenu(metadata);
    },

    /**
     * Adds an action by handing it off to the GadgetDropDownMenu.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetToolbar#
     * @params {Object} action - The action object in a gadget's metadata.
     */
    addAction : function(action) {
      // For now, all actions go to the menu
      this.gadgetMenuButton.getGadgetDropDownMenu().addAction(action);
    },
    
    /**
     * Removes an action by handing it off to the GadgetDropDownMenu.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetToolbar#
     * @params {Object} action - The action object in a gadget's metadata.
     */
    removeAction : function(action) {
      this.gadgetMenuButton.getGadgetDropDownMenu().removeAction(action);
    },
    
    /**
     * Adds a menu item to the drop down menu.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetDropDownMenu#
     * @param {module:explorer/widgets/MenuItemWidget} menuItem - The menu item to add.
     */
    addMenuItem : function(menuItem) {
      this.gadgetMenuButton.getGadgetDropDownMenu().addMenuItem(menuItem);
    }
  });
});