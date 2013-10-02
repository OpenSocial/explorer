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
 * The button located in the GadgetToolbar that toggles the GadgetDropDownMenu widget.
 *
 * @module modules/widgets/gadgetarea/GadgetMenuButton
 * @requires module:modules/widgets/GadgetDropDownMenu
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @augments dijit/_WidgetsInTemplateMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/text!./../../templates/GadgetMenuButton.html',
        './GadgetDropDownMenu', 'dojo/dom-construct',
        'dijit/_WidgetsInTemplateMixin'],
        function(declare, WidgetBase, TemplatedMixin, template, GadgetDropDownMenu, domConstruct,
            WidgetsInTemplateMixin) {
  return declare('GadgetMenuButtonWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin ], {
    templateString : template,

    /**
     * Populates the GadgetDropDownmenu with the gadget's metadata.
     *
     * @memberof module:modules/widgets/gadgetarea/GadgetMenuButton#
     * @param {Object} metadata - Object with the gadget's metadata.
     */
    constructMenu : function(metadata) {
      this.gadgetDropDown.setViews(metadata.views);
    },

    /**
     * Getter method for the GadgetDropDownMenu.
     *
     * @memberof module:modules/widgets/gadgetarea/GadgetMenuButton#
     * @returns {GadgetDropDownMenu} The DropDownMenu connected to this button.
     */
    getGadgetDropDownMenu : function() {
      return this.gadgetDropDown;
    }
  });
});