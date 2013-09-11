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
* Container Widget to delegate cross module method calls.
*
* @module modules/widgets/MainContainer
*/
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
         'dojo/query', 'dojo/on', 'dojo/text!./../templates/MainContainer.html'], 
         function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, query, on, template) {
  return declare('MainContainerWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin ], {
    templateString : template,

    postCreate: function() {
      var self = this;
      on(this.sidebarNav, 'show', function(node) {
        self.editorArea.displaySpec(node.id);
        self.editorArea.setTitle(node.name); 
      }); 
      
      on(this.editorArea, 'renderGadget', function(id) {
        self.gadgetArea.loadGadget(document.location.protocol + '//' + document.location.host + self.editorArea.getContextRoot() + '/gadgetspec/' + id + '/' + self.editorArea.getGadgetSpec().gadgetResource.name);
        self.sidebarNav.setNewId(id);
      });
      
      on(this.editorArea, 'renderEE', function(id) {
        self.gadgetArea.renderEmbeddedExperience(document.location.protocol + '//' + document.location.host + self.editorArea.getContextRoot() + '/gadgetspec/' + id + '/' + self.editorArea.getGadgetSpec().gadgetResource.name, self.editorArea.getGadgetSpec().eeResource.content);
        self.sidebarNav.setNewId(id);
      });
    }
  });
});