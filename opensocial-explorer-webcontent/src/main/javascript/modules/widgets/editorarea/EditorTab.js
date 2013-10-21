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
 * A Clickable tab representing a particular resource of a spec.
 *
 * @module explorer/widgets/editorarea/EditorTab
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 * 
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/_base/array', 'dojo/text!./../../templates/EditorTab.html', 'dojo/dom-class',
        'dojo/on'],
        function(declare, WidgetBase, TemplatedMixin,
            arrayUtil, template, domClass, on) {
  return declare('EditorTabWidget', [ WidgetBase, TemplatedMixin ], {
    templateString : template,

    constructor : function() {
      this.preActivationListeners = [];
    },

    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/editorarea/EditorTab#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate : function() {
      if(this.isActive) {
        this.activate();
      }
      var self = this;
      on(this.domNode, 'click', function(e) {
        for(var i = 0; i < self.preActivationListeners.length; i++) {
          self.preActivationListeners[i]();
        }
        self.activate.call(self);
      });
    },

    /**
     * Activation handler for when the tab is clicked. Shows the code for the particular tab.
     *
     * @memberof module:explorer/widgets/editorarea/EditorTab#
     */
    activate : function() {
      domClass.add(this.domNode, 'active');
      this.editor.show();
    },

    /**
     * Deactivation handler for when a different tab is clicked. Hides the code for the particular tab.
     *
     * @memberof module:explorer/widgets/editorarea/EditorTab#
     */
    deactivate : function() {
      domClass.remove(this.domNode, 'active');
      this.editor.hide();
    },

    /**
     * Adds a listener function to the instance variable preActivationListeners.
     *
     * @memberof module:explorer/widgets/editorarea/EditorTab#
     * @param {Function} listener - A callback function that deactivates all other tabs when this tab is clicked.
     */
    addPreActivationListener : function(listener) {
      this.preActivationListeners.push(listener);
    },

    /**
     * Destroys this instance of EditorTab. For testing purposes.
     *
     * @memberof module:explorer/widgets/editorarea/EditorTab#
     */
    destroy : function() {
      this.editor.destroy();
      this.inherited(arguments);
    },
    
    /**
     * Gets the spec's resource for this particular tab.
     *
     * @memberof module:explorer/widgets/editorarea/EditorTab#
     * @returns {Object} Object containing the content and name of the tab's resource.
     */
    getResource : function() {
      return {
        "content" : this.editor.getContent(),
        "name" : this.resource.name
      };
    },

    /**
     * Getter method for the editor.
     *
     * @memberof module:explorer/widgets/editorarea/EditorTab#
     * @returns {Editor} The editor corresponding to the tab.
     */
    getEditor : function() {
      return this.editor;
    }
  });
});