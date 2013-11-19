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
 * A menu that has buttons for creating a new gadget or service.
 *
 * @module explorer/widgets/creation/CreationMenu
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @augments dijit/_WidgetsInTemplateMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 
        'explorer/widgets/creation/CreationServiceModal', 'dojo/text!./../../templates/CreationMenu.html', 
        'dojo/dom-class', 'dojo/dom-style', 'dojo/on', 'dojo/topic'],
        function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, CreationServiceModal, template, domClass, domStyle, on, topic) {
  return declare('CreationMenuWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
    templateString : template,
    
    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/creation/CreationMenu#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate : function() {
      var self = this;
      domStyle.set(this.domNode, "display", "none");
      
      on(this.addGadgetButton, 'click', function() {
        topic.publish("toggleCreationSpecModal");
      });
      
      on(this.addServiceButton, 'click', function() {
        self.serviceModal.show();
      });

      this.subscription = topic.subscribe("updateToken", function() {
        domStyle.set(self.domNode, "display", "block");
      }); 
    },
    
    /**
     * Unsubscribes and deletes the Widget. Used for testing purposes.
     *
     * @memberof module:explorer/widgets/creation/CreationMenu#
     */
    destroy: function() {
      this.subscription.remove();
      this.inherited(arguments);
    }
  });
});