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
 * @module explorer/widgets/creation/CreationSpecModal
 * @augments module:explorer/widgets/ModalDialog
 * @augments dijit/_WidgetsInTemplateMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 */
define(['dojo/_base/declare', 'explorer/widgets/ModalDialog', 'dijit/_WidgetsInTemplateMixin', 'dojo/text!./../../templates/CreationServiceModal.html',
        'dojo/query', 'dojo/dom', 'dojo/on', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom', 'dojo/domReady!'],
        function(declare, ModalDialog, WidgetsInTemplateMixin, template, query, dom, on, domConstruct, domClass) {
  return declare('CreationServiceModalWidget', [ModalDialog, WidgetsInTemplateMixin], {
    templateString: template,
    dropdownValue: "OAuth",
    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/creation/CreationSpecModal#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate: function() {
      var self = this;
      query('.tab', this.domNode).on('click', function(e) {
        if(!domClass.contains(this, "active")) {
          domClass.toggle(self.newServiceTab, 'active');
          domClass.toggle(self.servicesTab, 'active');
          
          domClass.toggle(self.newServiceContent, 'active');
          domClass.toggle(self.servicesContent, 'active');
        }
      });
      
      query('.pill', this.domNode).on('click', function(e) {
        if(!domClass.contains(this, "active")) {
          domClass.toggle(self.advancedPill, 'active');
          domClass.toggle(self.generalPill, 'active');
          
          domClass.toggle(self.oAuth2AdvancedContent, 'active');
          domClass.toggle(self.oAuth2GeneralContent, 'active');
        }
      });
      
      query(this.serviceSelection, this.domNode).on('click', function(e) {
        var value = self.serviceSelection.value;
        if(value !== self.dropdownValue) {
          if(value == "OAuth") {
            query('.pill').addClass("hide");
            query(self.oAuthContent).addClass("active");
            query(self.oAuth2AdvancedContent).removeClass("active");
            query(self.oAuth2GeneralContent).removeClass("active");
          };
          
          if(value == "OAuth2") {
            query('.pill').removeClass("hide");
            query(self.generalPill).addClass("active");
            query(self.advancedPill).removeClass("active");
            query(self.oAuth2GeneralContent).addClass("active");
            query(self.oAuthContent).removeClass("active");
          }
          
          self.dropdownValue = value;
        };
      });
    }
  });
});