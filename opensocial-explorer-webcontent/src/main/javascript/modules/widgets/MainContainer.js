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
 * Container widget to delegate cross module method calls.
 *
 * @module explorer/widgets/MainContainer
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @augments dijit/_WidgetsInTemplateMixin
 * @requires module:explorer/widgets/creation/CreationMenu
 * @requires module:explorer/widgets/login/LoginDialog
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 'explorer/widgets/creation/CreationMenu',
        'explorer/widgets/login/LoginDialog', 'dojo/query', 'dojo/on', 'dojo/text!./../templates/MainContainer.html'], 
         function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, CreationMenu, LoginDialog, query, on, template) {
  return declare('MainContainerWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin ], {
    templateString : template,

    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/MainContainer#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate: function() {
      var self = this;
      
      on(this.sidebarNav, 'show', function(node) {
        self.editorArea.displaySpec(node.id);
        self.editorArea.setTitle(node.name); 
      }); 
      
      on(this.editorArea, 'renderGadget', function(id) {
        self.gadgetArea.renderGadget(document.location.protocol + '//' + document.location.host + self.editorArea.getContextRoot() + '/gadgetspec/' + id + '/' + self.editorArea.getGadgetSpec().gadgetResource.name);
        self.sidebarNav.setNewId(id);
      });
      
      on(this.editorArea, 'renderEE', function(id) {
        self.gadgetArea.renderEmbeddedExperience(document.location.protocol + '//' + document.location.host + self.editorArea.getContextRoot() + '/gadgetspec/' + id + '/' + self.editorArea.getGadgetSpec().gadgetResource.name, self.editorArea.getGadgetSpec().eeResource.content);
        self.sidebarNav.setNewId(id);
      });
      
      query('#login').on('click', function(e) {
        self.loginModal.show();
      });
    }
  });
});