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
 * Contains the EditorToolbar, EditorTabs, and Editors
 *
 * @module explorer/widgets/editorarea/EditorArea
 * @requires module:explorer/widgets/editorarea/EditorToolbar
 * @requires module:explorer/widgets/editorarea/EditorTabs
 * @requires module:explorer/widgets/editorarea/GadgetEditor
 * @requires module:explorer/widgets/editorarea/HtmlEditor
 * @requires module:explorer/widgets/editorarea/CssEditor
 * @requires module:explorer/widgets/editorarea/JSEditor
 * @requires module:explorer/widgets/editorarea/JSONEditor
 * @requires module:explorer/widgets/editorarea/EditorTab
 * @requires module:explorer/gadget-spec-service
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @augments dijit/_WidgetsInTemplateMixin
 * @augments dojo/Evented
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dojo/Evented.html|Evented Documentation}
 */
define([ 'dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 'dojo/Evented', 'dojo/topic',
         'dojo/query', 'dojo/on', 'dojo/text!./../../templates/EditorArea.html', './EditorToolbar',
         './EditorTabs', './GadgetEditor', './HtmlEditor', 
         './CssEditor', './JSEditor', './JSONEditor', './EditorTab',
         'dojo/dom-construct', 'dojo/dom-class', '../../gadget-spec-service', '../../url-util', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom' ], 
         function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Evented, topic, query, on, template, EditorToolbar, EditorTabs, GadgetEditor, 
             HtmlEditor, CssEditor, JSEditor, JSONEditor, EditorTab, domConstruct, domClass,
             gadgetSpecService, urlUtil) {
  return declare('EditorAreaWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Evented ], {
    templateString : template,

    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      var self = this;
      this.getGadgetSpecService().getDefaultGadgetSpec({
        success : function(data) {
          self.setTitle(data.title);
          self.addToUi.call(self, data);
        },
        error : function(data) {
          console.error("There was an error");
        }
      });

      on(this.editorToolbar, "renderGadgetClick", function() {
        self.postGadgetSpec(function(data) {
          self.emit('renderGadget', data.id);
        });
      });

      on(this.editorToolbar, "renderEEClick", function() {
        self.postGadgetSpec(function(data) {
          self.emit('renderEE', data.id);
        });
      });
      
      this.refreshEditorsHandle = topic.subscribe("refreshEditors", function() {
        self.getEditorTabs().refreshEditors();
      });
    },

    /**
     * Posts a spec to the servlet. This method is used when rerendering a spec.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     *
     * @param {Function} thenFunction - Callback function to execute if the POST to the servlet is successful.
     */
    postGadgetSpec : function(thenFunction) {
      var self = this;
      this.getGadgetSpecService().createNewGadgetSpec(this.getGadgetSpec(), {
        success : thenFunction,
        error : function(data) {
          console.error("There was an error");
        }
      });
    },

    /**
     * Displays the spec's code - resets the tabs and adds the necessary tabs and editors to the Ui.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     * @param {String} id - The ID of the spec to display
     */
    displaySpec : function(id) {
      var self = this;
      this.getGadgetSpecService().getGadgetSpec(id, {
        success : function(data) {
          self.editorTabs.removeAllTabs();
          self.addToUi(data);
        },
        error : function(data) {
          console.error("There was an error");
        }
      });
    },

    /**
     * Adds a spec's tabs to the Ui and adjusts the render button according to the type of spec.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     * @param {Object} data - Data of the spec.
     */
    addToUi : function(data) {
      if(!this.editorTabs) {
        this.editorTabs = new EditorTabs(data);
      }
      domConstruct.place(this.editorTabs.domNode, this.domNode);
      this.editorTabs.startup();
      this.createTabsAndEditors(data, this.editorTabs);
      if (data.eeResource) {
        this.editorToolbar.showRenderEEButton();
        this.editorToolbar.hideRenderGadgetButton();
        this.emit('renderEE', data.id);
      } else {
        this.editorToolbar.showRenderGadgetButton();
        this.editorToolbar.hideRenderEEButton();
        this.emit('renderGadget', data.id);
      }
    },

    /**
     * Creates the necessary EditorTabs and Editors for a spec.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     * @param {Object} data - Data of the spec.
     * @param {EditorTabs} editorTabs - Contains each EditorTab of the spec.
     */
    createTabsAndEditors : function(data, editorTabs) {
      var editor = new GadgetEditor({"resource" : data.gadgetResource});
      this.createTab(data.gadgetResource, editorTabs, true, editor);
      if(data.htmlResources) {
        for(var i = 0; i < data.htmlResources.length; i++) {
          editor = new HtmlEditor({"resource" : data.htmlResources[i]});
          this.createTab(data.htmlResources[i], editorTabs, false, editor);
        }
      }

      if(data.cssResources) {
        for(var j = 0; j < data.cssResources.length; j++) {
          editor = new CssEditor({"resource" : data.cssResources[j]});
          this.createTab(data.cssResources[j], editorTabs, false, editor);
        }
      }

      if(data.jsResources) {
        for(var k = 0; k < data.jsResources.length; k++) {
          editor = new JSEditor({"resource" : data.jsResources[k]});
          this.createTab(data.jsResources[k], editorTabs, false, editor);
        }
      }

      if(data.eeResource) {
        editor = new JSONEditor({"resource" : data.eeResource});
        this.createTab(data.eeResource, editorTabs, false, editor);
      }
      if(domClass.contains(this.domNode, 'topBottom')) {
        query('.CodeMirror-scroll').addClass('topBottom');
        editorTabs.refreshEditors();
      }
    },

    /**
     * Creates an EditorTab of a spec.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     * @param {Object} resource - An object that contains data about a spec's particular resource (e.g. jsResource).
     * @param {EditorTabs} editorTabs - Contains each EditorTab of the spec.
     * @param {Boolean} isActive - Whether or not the tab is the focused tab.
     * @param {GadgetEditor} editor - the Editor corresponding to the tab's resource (e.g. JSEditor).
     */
    createTab : function(resource, editorTabs, isActive, editor) {
      domConstruct.place(editor.domNode, this.domNode);
      editor.startup();
      var editorTab = new EditorTab({"resource" : resource, "isActive" : isActive, "editor" : editor});
      editorTabs.addTab(editorTab);
    },
    
    /**
     * Sets the title of a spec in the Ui.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     * @param {String} title - Title of the spec.
     */
    setTitle : function(title) {
        this.editorToolbar.setTitle(title);
    },

    /**
     * Gets the GadgetSpec object.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     * @returns {Object} The GadgetSpec object.
     */
    getGadgetSpec : function() {
      return this.editorTabs.getGadgetSpec();
    },
    
    /**
     * Gets the context root.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     * @returns {String} The context root.
     */
    getContextRoot : function() {
      return urlUtil.getContextRoot();
    },

    /**
     * Getter method for EditorTabs.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     * @returns {EditorTabs} The EditorTabs object.
     */
    getEditorTabs : function() {
      return this.editorTabs;
    },

    /**
     * Getter method for the GadgetSpecService module for testing purposes.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     * @returns {gadgetSpecService} The gadgetSpecService object.
     */
    getGadgetSpecService : function() {
      return gadgetSpecService;
    },

    /**
     * Destroys this instance of EditorArea.
     *
     * @memberof module:explorer/widgets/editorarea/EditorArea#
     */
    destroy : function() {
      this.inherited(arguments);
      this.refreshEditorsHandle.remove();
    }
  });
});