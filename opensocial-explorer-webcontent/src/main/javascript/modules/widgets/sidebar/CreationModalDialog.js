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
define(['dojo/_base/declare', 'modules/widgets/ModalDialog', 
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'modules/widgets/editorarea/EditorArea',
        'dojo/query', 'dojo/text!./../../templates/CreationModalDialog.html', 'dojo/text!./../../stubs/StubXML.xml', 
        'dojo/text!./../../stubs/StubEEXML.xml', 'dojo/text!./../../stubs/StubHTML.html',
        'dojo/dom', 'modules/gadget-spec-service',
        'dojo/dom-class', 'dojo/dom-style','dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ModalDialog, WidgetBase, TemplatedMixin, EditorArea,
            query, template, stubxml, stubeexml, stubhtml, dom, gadgetSpecService, domClass, domStyle) {
  return declare('CreationModalDialogWidget', [ModalDialog], {
    templateString : template,
    
    onSubmit : function() {
      var self = this;
      var title = this.creationTitle.value;
      var option = this.creationSelection.value;
      var filename = title.replace(/\s/g, '').toLowerCase();
      var userInput = {
          title: title,
          filename: filename,
          author: this.creationAuthor.value,
          description: this.creationDescription.value
      };
      
      if(option == "Gadget") {
        this.postNewGadgetSpec(userInput, function(data) {
          self.addToSidebar(data, title);
        });
      } else {
        this.postNewEESpec(userInput, function(data) {
          self.addToSidebar(data, title);
        });
      } 
      
      self.hide();
      self.clear(); 
    },
    
    postNewGadgetSpec : function(userInput, thenFunction) {
      var self = this;
      var postData = {
          title:          userInput.title,
          cssResources:   [{content: "", name: userInput.filename + ".css"}],
          jsResources:    [{content: "", name: userInput.filename + ".js"}],
          htmlResources:  [{content: self.replaceResourceStubs(stubhtml, userInput),
                            name: userInput.filename + ".html"}],
          gadgetResource: {content: self.replaceResourceStubs(stubxml, userInput), 
                           name: userInput.filename + ".xml"}
      };
      
      this.getGadgetSpecService().createNewGadgetSpec(postData, {
        success : thenFunction,
        error : function(data) {
          console.error("There was an error");
        }
      });
    },
    
    postNewEESpec : function(userInput, thenFunction) {
      var self = this;
      var postData = {
          title:          userInput.title,
          cssResources:   [{content: "", name: userInput.filename + ".css"}],
          jsResources:    [{content: "", name: userInput.filename + ".js"}],
          htmlResources:  [{content: self.replaceResourceStubs(stubhtml, userInput),
                            name: userInput.filename + ".html"}],
          gadgetResource: {content: self.replaceResourceStubs(stubeexml, userInput), 
                           name: userInput.filename + ".xml"},
          eeResource:     {content: "{\n}", name: userInput.filename + ".json"}  
      };
      
      this.getGadgetSpecService().createNewGadgetSpec(postData, {
        success : thenFunction,
        error : function(data) {
          console.error("There was an error");
        }
      });
    },
    
    addToSidebar: function(data, title) {
      var self = this;
      require(['modules/widgets/sidebar/SidebarNav'], function(SidebarNav) {
        SidebarNav.getInstance().addSpec(title, data.id);
      });
    },
    
    replaceResourceStubs : function(str, mapObj) {
      return str.replace(/[$]{([^{}]+)}/g, function(match, key){
          return mapObj[key];
      });
    },

    clear: function() {
      var self = this;
      query(".creation", self.domNode).forEach(function(node) {
        node.value = "";
      });
    },
    
    getGadgetSpecService : function() {
      return gadgetSpecService;
    }
  });
});