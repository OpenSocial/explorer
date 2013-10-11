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
 * A modal window that allows users to create a new spec along with information about the spec.
 *
 * @module explorer/widgets/sidebar/CreationModalDialog
 * @requires module:explorer/gadget-spec-service
 * @augments module:explorer/widgets/ModalDialog
 * @augments dijit/_WidgetsInTemplateMixin
 * @augments dojo/Evented
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dojo/Evented.html|Evented Documentation}
 */
define(['dojo/_base/declare', 'explorer/widgets/ModalDialog', 
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 'dojo/Evented',
        'dojo/query', 'dojo/text!./../../templates/CreationModalDialog.html', 'dojo/text!./../../stubs/StubXML.xml', 
        'dojo/text!./../../stubs/StubEEXML.xml', 'dojo/text!./../../stubs/StubHTML.html',
        'dojo/dom', '../../gadget-spec-service', 'dojo/on',
        'dojo/dom-class', 'dojo/dom-style','dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ModalDialog, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Evented,
            query, template, stubxml, stubeexml, stubhtml, dom, gadgetSpecService, on, domClass, domStyle) {
  return declare('CreationModalDialogWidget', [ModalDialog, WidgetsInTemplateMixin, Evented], {
    templateString : template,
    
    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/sidebar/CreationModalDialog#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate: function() {
      var self = this;
      on(this.creationSubmit, 'click', function() {
        self.onSubmit();
      });
      
      on(this.creationExit, 'click', function() {
        self.hide();
      });
    },
    
    /**
     * Sends the data of user-submitted spec to the servlet and hides and clears the modal.
     *
     * @memberof module:explorer/widgets/sidebar/CreationModalDialog#
     */
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
      var callback = function(data) {
        self.emit('newSpec', title, data);
      };
      
      if(option == "Gadget") {
        this.postNewGadgetSpec(userInput, callback);
      } else {
        this.postNewEESpec(userInput, callback);
      }
      self.hide();
      self.clear(); 
    },
    
    /**
     * Posts a new GadgetSpec to the servlet.
     *
     * @memberof module:explorer/widgets/sidebar/CreationModalDialog#
     *
     * @param {Object} userInput - User input information in the form of { title: ..., filename: ..., author: ..., description: ... }
     * @param {Function} thenFunction - Callback function to execute if the POST to the servlet is successful.
     */
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
    
    /**
     * Posts a new EESpec to the servlet.
     *
     * @memberof module:explorer/widgets/sidebar/CreationModalDialog#
     *
     * @param {Object} userInput - User input information in the form of { title: ..., filename: ..., author: ..., description: ... }
     * @param {Function} thenFunction - Callback function to execute if the POST to the servlet is successful.
     */
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
    
    /**
     * Replaces all instances of ${...} in a html code stub string with user input.
     * This method makes sure that the stubs generated for a new spec have the user's 
     * information in it (title, description, author).
     *
     * @memberof module:explorer/widgets/sidebar/CreationModalDialog#
     *
     * @param {String} str - The html string that has instances of ${...} to replace.
     * @param {Object} mapObj - The object containing user data.
     */
    replaceResourceStubs : function(str, mapObj) {
      return str.replace(/[$]{([^{}]+)}/g, function(match, key){
          return mapObj[key];
      });
    },

    /**
     * Clears the input boxes after a new spec is added.
     *
     * @memberof module:explorer/widgets/sidebar/CreationModalDialog#
     */
    clear: function() {
      var self = this;
      query(".creation", self.domNode).forEach(function(node) {
        node.value = "";
      });
    },
    
    /**
     * Getter method for the GadgetSpecService module for testing purposes.
     *
     * @memberof module:explorer/widgets/sidebar/CreationModalDialog#
     * @returns {gadgetSpecService} The gadgetSpecService object.
     */
    getGadgetSpecService : function() {
      return gadgetSpecService;
    }
  });
});