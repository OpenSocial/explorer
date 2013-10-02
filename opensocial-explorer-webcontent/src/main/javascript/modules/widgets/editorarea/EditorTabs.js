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
 * Contains all the tabs of a spec's resources.
 *
 * @module modules/widgets/editorarea/EditorTabs
 * @requires module:modules/widgets/editorarea/GadgetEditor
 * @requires module:modules/widgets/editorarea/HtmlEditor
 * @requires module:modules/widgets/editorarea/CssEditor
 * @requires module:modules/widgets/editorarea/JSEditor
 * @requires module:modules/widgets/editorarea/JSONEditor
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/_base/array', 'dojo/text!./../../templates/EditorTabs.html',
        'dojo/dom-construct', './CssEditor', './GadgetEditor', './HtmlEditor', './JSEditor',
        './JSONEditor', 'dojo/query'],
        function(declare, WidgetBase, TemplatedMixin,
            arrayUtil, template, domConstruct, CssEditor, GadgetEditor, HtmlEditor, JSEditor, JSONEditor, query) {
  return declare('EditorTabsWidget', [ WidgetBase, TemplatedMixin ], {
    templateString : template,

    constructor : function() {
      this.tabs = [];
    },

    /**
     * Adds a tab to the dom. Also adds a activation listener to the tab.
     *
     * @memberof module:modules/widgets/editorarea/EditorTabs#
     * @param {EditorTab} tab - The EditorTab to add.
     */
    addTab : function(tab) {
      tab.addPreActivationListener(this.tabActivated());
      this.tabs.push(tab);
      domConstruct.place(tab.domNode, this.domNode);
      tab.startup();
    },

    /**
     * A callback function that returns a function that deactivates all tabs in EditorTabs.
     *
     * @memberof module:modules/widgets/editorarea/EditorTabs#
     * @returns {Function} Deactivates all the tabs in EditorTabs.
     */
    tabActivated : function() {
      var self = this;
      return function() {
        for(var i = 0; i < self.tabs.length; i++) {
          self.tabs[i].deactivate();
        }
      };
    },

    /**
     * Destroys each EditorTab and resets the tabs array.
     *
     * @memberof module:modules/widgets/editorarea/EditorTabs#
     */
    removeAllTabs : function() {
      for(var i = 0; i < this.tabs.length; i++) {
        this.tabs[i].destroy();
      }
      this.tabs = [];
    },

    /**
     * Gets a spec's title and resources as a JSON.
     *
     * @memberof module:modules/widgets/editorarea/EditorTabs#
     * @returns {Object} The gadgetspec's data.
     */
    getGadgetSpec : function() {
      var title = query("#gadget-name").innerHTML();
      var spec = {
          "htmlResources" : [],
          "cssResources" : [],
          "jsResources" : [],
          "title" : title
      };
      for(var i = 0; i < this.tabs.length; i++) {
        var tab = this.tabs[i];
        var resource = tab.getResource();
        var editor = tab.getEditor();
        if(editor instanceof GadgetEditor) {
          spec.gadgetResource = tab.getResource();
        } else if(editor instanceof CssEditor) {
          spec.cssResources.push(tab.getResource());
        } else if(editor instanceof JSEditor) {
          spec.jsResources.push(tab.getResource());
        } else if(editor instanceof HtmlEditor) {
          spec.htmlResources.push(tab.getResource());
        } else if(editor instanceof JSONEditor) {
          spec.eeResource = tab.getResource();
        }
      }
      return spec;
    },

    /**
     * Refreshes each EditorTab.
     *
     * @memberof module:modules/widgets/editorarea/EditorTabs#
     */
    refreshEditors : function() {
      arrayUtil.forEach(this.tabs, function(tab) {
        tab.getEditor().refresh();
      });
    }
  });
});