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
 * The modal template widget.
 *
 * @module explorer/widgets/ModalDialog
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/query', 'dojo/text!./../templates/ModalDialog.html',
        'dojo/dom-class', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, WidgetBase, TemplatedMixin,
            query, template, domClass) {
  return declare('ModalDialogWidget', [ WidgetBase, TemplatedMixin ], {
    templateString : template,
    
    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/ModalDialog#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      var self = this;
      query('.modal-header .close', this.domNode).on('click', function(e) {
        self.hide();
      });
    },

    /**
     * Shows the ModalDialog in the dom.
     *
     * @memberof module:explorer/widgets/ModalDialog#
     */
    show : function() {
      domClass.remove(this.domNode, 'hide');
      domClass.add(this.domNode, 'in');
      query('body').append('<div class="modal-backdrop fade in"></div>');
    },

    /**
     * Hides the ModalDialog in the dom.
     *
     * @memberof module:explorer/widgets/ModalDialog#
     */
    hide : function() {
      domClass.add(this.domNode, 'hide');
      domClass.remove(this.domNode, 'in');
      query('div.modal-backdrop').remove();
    },

    /**
     * Sets the header title in the ModalDialog.
     *
     * @memberof module:explorer/widgets/ModalDialog#
     * @param {String} title - The title to be set.
     */
    setHeaderTitle : function(title) {
      query('div.modal-header h3', this.domNode).innerHTML(title);
    }
  });
});