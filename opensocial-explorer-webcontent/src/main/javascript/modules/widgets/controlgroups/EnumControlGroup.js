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
 * A ControlGroup for the enum option of the PreferencesDialog.
 *
 * @module modules/widgets/controlgroups/EnumControlGroup
 * @augments module:modules/widgets/controlgroups/ControlGroup
 */
define(['dojo/_base/declare', 'modules/widgets/controlgroups/ControlGroup',
        'dojo/_base/array', 'dojo/query', 'dojo/dom-construct',
        'dojo/dom-attr', 'dojo/on', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ControlGroup, arrayUtil, query, domConstruct, domAttr, on) {
  return declare('EnumControlGroupWidget', [ ControlGroup ], {

    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:modules/widgets/controlgroups/EnumControlGroup#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate : function() {
      var select = domConstruct.create('select'),
      self = this;
      on(select, 'change', function(e) {
        var options = e.currentTarget.options;
        self.toggleSelection(options, e.currentTarget.value);
      });
      for(var i = 0; i < this.orderedEnumValues.length; i++) {
        var option = domConstruct.create('option', 
            {"value" : this.orderedEnumValues[i].value, "innerHTML" : this.orderedEnumValues[i].displayValue}, select);
        if(this.orderedEnumValues[i].displayValue === this.defaultValue) {
          domAttr.set(option, 'selected', 'selected');
          this.currentValue = this.defaultValue;
        }
      }
      domConstruct.place(select, query('.controls', this.domNode)[0]);

    },

    /**
     * Gets the value of the EnumControlGroup dropdown.
     *
     * @memberof module:modules/widgets/controlgroups/EnumControlGroup#
     * @return {String} The enumeration selected.
     */
    getValue : function() {
      return this.currentValue;
    },

    /**
     * Handles the user selection of an option in the dropdown.
     *
     * @memberof module:modules/widgets/controlgroups/EnumControlGroup#
     * @param {HTMLOptionsCollection} options - The options of the dropdown.
     * @param {String} selected - The option selected.
     */
    toggleSelection : function(options, selected) {
      this.currentValue = selected;
      arrayUtil.forEach(options, function(option) {
        if(domAttr.get(option, 'selected')) {
          domAttr.set(option, 'selected', '');
        }
        if(selected === domAttr.get(option, 'value')) {
          domAttr.set(option, 'selected', 'selected');
        }
      });
    },

    /**
     * Sets the value of the EnumControlGroup dropdown.
     *
     * @memberof module:modules/widgets/controlgroups/EnumControlGroup#
     * @param {String} selected - The option selected.
     */
    setValue : function(selected) {
      var options = query('.controls select')[0].options;
      this.toggleSelection(options, selected);
    }
  });
});