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
 * @module modules/widgets/creation/CreationSpecModal
 * @augments module:modules/widgets/ModalDialog
 * @augments dijit/_WidgetsInTemplateMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 */
define(['dojo/_base/declare', 'modules/widgets/ModalDialog', 'dijit/_WidgetsInTemplateMixin',
        'dojo/query', 'dojo/dom', 'dojo/on', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ModalDialog, WidgetsInTemplateMixin, query, dom, on, domConstruct, domClass) {
  return declare('CreationServiceModalWidget', [ModalDialog, WidgetsInTemplateMixin], {
    
    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:modules/widgets/creation/CreationSpecModal#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup: function() {
      var self = this;
      var modalBody = query('.modal-body', this.domNode);
      var modalHeader = query('.modal-header', this.domNode);
      var modalFooter = query('.modal-footer', this.domNode);
      
      var services = domConstruct.create('div', {id: 'existingServices'});
      var title = domConstruct.create('h3', {innerHTML: 'Add Service'});
      var name = domConstruct.create('input', {type: 'text', placeholder: 'Name'});
      var key = domConstruct.create('input', {type: 'text', placeholder: 'Key'});
      var secret = domConstruct.create('input', {type: 'text', placeholder: 'Secret'}); 
      var button = domConstruct.create('button', {'class': 'btn btn-success', innerHTML: 'Create!', id: 'serviceButton'});
      
      modalHeader.addClass('center');
      modalBody.addClass('center');
      modalFooter.addClass('center');
      this.setHeaderTitle('Services');
      modalBody.append(services);
      modalBody.append(title);
      modalBody.append(name);
      modalBody.append(key);
      modalBody.append(secret);
      modalFooter.append(button);
      query('input', this.domNode).addClass('creation');
      
      this.inherited(arguments);
      
      query('#serviceButton').on('click', function() {
        alert('weeeeeeeee');
      });
      /*
      on(this.creationExit, 'click', function() {
        self.hide();
      }); */
    }
  });
});