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
 * A ControlGroup for the boolean option of the PreferencesDialog.
 *
 * @module modules/widgets/controlgroups/BooleanControlGroup
 * @augments module:modules/widgets/controlgroups/ControlGroup
 */
define(['dojo/_base/declare', './ControlGroup', 'dojo/query', 'dojo/dom-construct',
        'dojo/dom-attr', 'dojo/on', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ControlGroup, query, domConstruct, domAttr, on) {
  return declare('BooleanControlGroupWidget', [ ControlGroup ], {

    constructor : function() {
    },

    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:modules/widgets/controlgroups/BooleanControlGroup#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate : function() {
      this.input = domConstruct.create('input', {"type" : "checkbox"});
      if(this.defaultValue.toUpperCase() === 'TRUE') {
        domAttr.set(this.input, 'checked', 'checked');
      }
      on(this.input, 'click', function(e) {
        if(domAttr.get(e.currentTarget, 'checked')) {
          domAttr.set(e.currentTarget, 'checked', '');
        } else {
          domAttr.set(e.currentTarget, 'checked', 'checked');
        }
      });
      query('.controls', this.domNode).append(this.input);
    },

    /**
     * Gets the state of the BooleanControlGroup checkbox.
     *
     * @memberof module:modules/widgets/controlgroups/BooleanControlGroup#
     * @return {Boolean} Whether or not the checkbox is checked.
     */
    getValue : function() {
      return this.input.checked;
    },

    /**
     * Sets the state of the BooleanControlGroup checkbox.
     *
     * @memberof module:modules/widgets/controlgroups/BooleanControlGroup#
     * @param {Boolean} checked - Whether or not the checkbox should be checked.
     */
    setValue : function(checked) {
      this.input.checked = checked;
    }
  });
});