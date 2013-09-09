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
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
        'dojo/query', 'dojo/text!./../../templates/EditorToolbar.html', 'dojo/on', 'dojo/Evented',
        'dojo/dom-class', 'modules/gadget-spec-service', 
        'dojo/NodeList-manipulate', 'dojo/NodeList-dom', 'dojo/ready', 'dojo/domReady!'],
        function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, query, 
            template, on, Evented, domClass, gadgetSpecService) {
  return declare('EditorToolbarWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Evented ], {
    templateString : template,
    onRenderGadgetClick: function() {
      this.emit("renderGadgetClick");
    },
    
    onRenderEEClick: function() {
      this.emit("renderEEClick");
    },
    
    setTitle: function(title) {
      query('.brand', this.domNode)[0].innerHTML = title;
    },

    getGadgetSpecService : function() {
      return gadgetSpecService;
    },

    showRenderEEButton: function() {
      domClass.remove("renderEEBtn", "hide");
    },

    hideRenderEEButton: function() {
      domClass.add("renderEEBtn", "hide");
    },

    showRenderGadgetButton: function() {
      domClass.remove("renderBtn", "hide");
    },

    hideRenderGadgetButton: function() {
      domClass.add("renderBtn", "hide");
    }
  });
});