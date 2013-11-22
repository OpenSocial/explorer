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
 * A ControlGroup template for features of the PreferencesModal.
 *
 * @module explorer/widgets/controlgroups/ControlGroup
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/query', 'dojo/text!./../../templates/ControlGroup.html', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, WidgetBase, TemplatedMixin, query, template) {
  return declare('ControlGroupWidget', [ WidgetBase, TemplatedMixin ], {
    templateString : template,

    /**
     * Sets the label of the ControlGroup.
     * 
     * @memberof module:explorer/widgets/controlgroups/ControlGroup#
     * @param {String} name - The name to set.
     */
    setLabel : function(name) {
      query('.control-label', this.domNode).innerHTML(name);
    },

    /**
     * Gets the value of the ControlGroup. This method must be overridden.
     * 
     * @abstract
     * @memberof module:explorer/widgets/controlgroups/ControlGroup#
     */
    getValue : function() {

    },

    /**
     * Sets the value of the ControlGroup. This method must be overridden.
     * 
     * @abstract
     * @param {String} value - The value to set.
     * @memberof module:explorer/widgets/controlgroups/ControlGroup#
     */
    setValue : function(value) {

    }
  });
});