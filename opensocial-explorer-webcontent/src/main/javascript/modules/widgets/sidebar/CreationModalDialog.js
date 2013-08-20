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
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/query', 'dojo/text!./../../templates/CreationModalDialog.html','dojo/dom',
        'dojo/dom-class', 'dojo/dom-style','dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ModalDialog, WidgetBase, TemplatedMixin, 
            query, template, dom, domClass, domStyle) {
  return declare('ModalDialogWidget', [ ModalDialog, WidgetBase, TemplatedMixin ], {
    templateString : template,
    startup : function() {
      var self = this;

      query('.modal-header .close', this.domNode).on('click', function(e) {
        self.hide();
      });

      query('#creation-submit', this.domNode).on('click', function(e) {
        require(['modules/widgets/sidebar/SidebarNav'], function(SidebarNav) {
          SidebarNav.getInstance().addSpec(dom.byId("creation-title").value);
          self.hide();
          self.clear();
        }); 
      });
    },

    clear: function() {
      dom.byId("creation-title").value = "";
      dom.byId("creation-author").value = "";
      dom.byId("creation-description").value = "";
      dom.byId("creation-selection").selectedIndex = 0;
    }
  });
});