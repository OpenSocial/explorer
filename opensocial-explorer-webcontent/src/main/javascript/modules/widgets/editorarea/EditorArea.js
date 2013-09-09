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
define([ 'dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 'dojo/Evented', 'dojo/topic',
         'dojo/query', 'dojo/on', 'dojo/text!./../../templates/EditorArea.html', 'modules/widgets/editorarea/EditorToolbar',
         'modules/widgets/editorarea/EditorTabs', 'modules/widgets/editorarea/GadgetEditor', 'modules/widgets/editorarea/HtmlEditor', 
         'modules/widgets/editorarea/CssEditor', 'modules/widgets/editorarea/JSEditor', 'modules/widgets/editorarea/JSONEditor', 'modules/widgets/editorarea/EditorTab',
         'dojo/dom-construct', 'dojo/dom-class', 'modules/gadget-spec-service', 'modules/url-util', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom' ], 
         function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Evented, topic, query, on, template, EditorToolbar, EditorTabs, GadgetEditor, 
             HtmlEditor, CssEditor, JSEditor, JSONEditor, EditorTab, domConstruct, domClass,
             gadgetSpecService, urlUtil) {
  return declare('EditorAreaWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Evented ], {
    templateString : template,

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
      
      topic.subscribe("refreshEditors", function() {
        self.getEditorTabs().refreshEditors();
      });
    },

    postGadgetSpec : function(thenFunction) {
      var self = this;
      this.getGadgetSpecService().createNewGadgetSpec(this.getGadgetSpec(), {
        success : thenFunction,
        error : function(data) {
          console.error("There was an error");
        }
      });
    },

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
        for(var i = 0; i < data.cssResources.length; i++) {
          editor = new CssEditor({"resource" : data.cssResources[i]});
          this.createTab(data.cssResources[i], editorTabs, false, editor);
        }
      }

      if(data.jsResources) {
        for(var i = 0; i < data.jsResources.length; i++) {
          editor = new JSEditor({"resource" : data.jsResources[i]});
          this.createTab(data.jsResources[i], editorTabs, false, editor);
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

    createTab : function(resource, editorTabs, isActive, editor) {
      domConstruct.place(editor.domNode, this.domNode);
      editor.startup();
      var editorTab = new EditorTab({"resource" : resource, "isActive" : isActive, "editor" : editor});
      editorTabs.addTab(editorTab);
    },

    setTitle : function(title) {
        this.editorToolbar.setTitle(title);
    },

    getGadgetSpec : function() {
      return this.editorTabs.getGadgetSpec();
    },
    
    getContextRoot : function() {
      return urlUtil.getContextRoot();
    },

    getEditorTabs : function() {
      return this.editorTabs;
    },

    getGadgetSpecService : function() {
      return gadgetSpecService;
    },

    destroy : function() {
      this.inherited(arguments);
      instance = undefined;
    }
  });
});