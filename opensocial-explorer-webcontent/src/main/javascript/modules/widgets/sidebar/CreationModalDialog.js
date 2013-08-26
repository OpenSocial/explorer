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
        'dojo/query', 'dojo/text!./../../templates/CreationModalDialog.html', 'dojo/text!./../../templates/StubXML.xml', 
        'dojo/text!./../../templates/StubEEXML.xml', 'dojo/text!./../../templates/StubHTML.html',
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
          _TITLE_: title,
          _FILENAME_: filename,
          _AUTHOR_: this.creationAuthor.value,
          _DESCRIPTION_: this.creationDescription.value
      };
      
      require(['modules/widgets/sidebar/SidebarNav'], function(SidebarNav) {
        if(option == "Gadget") {
          self.postNewGadgetSpec.call(self, userInput, function(data) {
            SidebarNav.getInstance().addSpec(title, data.id);
          });
        } else {
          self.postNewEESpec.call(self, userInput, function(data) {
            SidebarNav.getInstance().addSpec(title, data.id);
          });
        }
        self.hide();
        self.clear();
      }); 
    },
    
    postNewGadgetSpec : function(userInput, thenFunction) {
      var self = this;
      var postData = {
          title:          userInput._TITLE_,
          cssResources:   [{content: "", name: userInput._FILENAME_ + ".css"}],
          jsResources:    [{content: "", name: userInput._FILENAME_ + ".js"}],
          htmlResources:  [{content: self.replaceResourceStubs(stubhtml, userInput),
                            name: userInput._FILENAME_ + ".html"}],
          gadgetResource: {content: self.replaceResourceStubs(stubxml, userInput), 
                           name: userInput._FILENAME_ + ".xml"}
      };
      
      gadgetSpecService.createNewGadgetSpec(postData, {
        success : thenFunction,
        error : function(data) {
          console.error("There was an error");
        }
      });
    },
    
    postNewEESpec : function(userInput, thenFunction) {
      var self = this;
      var postData = {
          title:          userInput._TITLE_,
          cssResources:   [{content: "", name: userInput._FILENAME_ + ".css"}],
          jsResources:    [{content: "", name: userInput._FILENAME_ + ".js"}],
          htmlResources:  [{content: self.replaceResourceStubs(stubhtml, userInput),
                            name: userInput._FILENAME_ + ".html"}],
          gadgetResource: {content: self.replaceResourceStubs(stubeexml, userInput), 
                           name: userInput._FILENAME_ + ".xml"},
          eeResource:     {content: "{\n}", name: userInput._FILENAME_ + ".json"}  
      };
      
      gadgetSpecService.createNewGadgetSpec(postData, {
        success : thenFunction,
        error : function(data) {
          console.error("There was an error");
        }
      });
    },
    
    replaceResourceStubs : function(str, mapObj) {
      var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
      return str.replace(re, function(matched){
          return mapObj[matched];
      });
    },

    clear: function() {
      query(".creation", this.domNode).forEach(function(node) {
        node.value = "";
      });
    }
  });
});