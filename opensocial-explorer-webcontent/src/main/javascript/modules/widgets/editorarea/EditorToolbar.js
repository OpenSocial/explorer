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
 * Toolbar for EditorArea that contains a spec's title and render buttons.
 *
 * @module modules/widgets/editorarea/EditorToolbar
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @augments dijit/_WidgetsInTemplateMixin
 * @augments dojo/Evented
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dojo/Evented.html|Evented Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
        'dojo/query', 'dojo/text!./../../templates/EditorToolbar.html', 'dojo/on', 'dojo/Evented',
        'dojo/dom-class', 'modules/gadget-spec-service', 
        'dojo/NodeList-manipulate', 'dojo/NodeList-dom', 'dojo/ready', 'dojo/domReady!'],
        function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, query, 
            template, on, Evented, domClass, gadgetSpecService) {
  return declare('EditorToolbarWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Evented ], {
    templateString : template,
    
    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:modules/widgets/editorarea/EditorToolbar#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate: function() {
      var self = this;
      on(this.renderGadgetButton, 'click', function() {
        self.emit("renderGadgetClick");
      });
      
      on(this.renderEEButton, 'click', function() {
        self.emit("renderEEClick");
      });
    
    /**
     * Sets the innerHTML of the EditorToolbar.
     *
     * @memberof module:modules/widgets/editorarea/EditorToolbar#
     * @param {String} title - The title to set.
     */
    setTitle: function(title) {
      query('.brand', this.domNode)[0].innerHTML = title;
    },

    /**
     * Shows the RenderEEButton in the dom.
     *
     * @memberof module:modules/widgets/editorarea/EditorToolbar#
     */
    showRenderEEButton: function() {
      domClass.remove(this.renderEEButton, "hide");
    },

    /**
     * Hides the RenderEEButton in the dom.
     *
     * @memberof module:modules/widgets/editorarea/EditorToolbar#
     */
    hideRenderEEButton: function() {
      domClass.add(this.renderEEButton, "hide");
    },

    /**
     * Shows the RenderGadgetButton in the dom.
     *
     * @memberof module:modules/widgets/editorarea/EditorToolbar#
     */
    showRenderGadgetButton: function() {
      domClass.remove(this.renderGadgetButton, "hide");
    },

    /**
     * Hides the RenderGadgetButton in the dom.
     *
     * @memberof module:modules/widgets/editorarea/EditorToolbar#
     */
    hideRenderGadgetButton: function() {
      domClass.add(this.renderGadgetButton, "hide");
    },
    
    /**
     * Getter method for the GadgetSpecService module for testing purposes.
     *
     * @memberof module:modules/widgets/editorarea/EditorToolbar#
     * @returns {gadgetSpecService} The gadgetSpecService object.
     */
    getGadgetSpecService : function() {
      return gadgetSpecService;
    }
  });
});