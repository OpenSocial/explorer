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
 * A ControlGroup for the list option of the PreferencesDialog.
 *
 * @module modules/widgets/controlgroups/ListControlGroup
 * @augments module:modules/widgets/controlgroups/ControlGroup
 */
define(['dojo/_base/declare', './ControlGroup', 'dojo/query', 'dojo/dom-construct',
        'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ControlGroup, query, domConstruct) {
  return declare('ListsControlGroupWidget', [ ControlGroup ], {

    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:modules/widgets/controlgroups/ListControlGroup#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate : function() {
      this.input = domConstruct.create("input", {"type" : "text", "value" : this.defaultValue});
      query('.controls', this.domNode).innerHTML(this.input);
    },

    /**
     * Gets the value of the ListControlGroup inputbox.
     *
     * @memberof module:modules/widgets/controlgroups/ListControlGroup#
     * @return {String} The value of the inputbox.
     */
    getValue : function() {
      return this.input.value;
    },

    /**
     * Sets the value of the ListControlGroup inputbox.
     *
     * @memberof module:modules/widgets/controlgroups/ListControlGroup#
     * @param {String} The value to set.
     */
    setValue : function(value) {
      this.input.value = value;
    }
  });
});