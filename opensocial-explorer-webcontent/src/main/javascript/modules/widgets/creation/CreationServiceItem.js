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
 * An individual item in the Services tab.
 *
 * @module explorer/widgets/creation/CreationServiceItem
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/text!./../../templates/CreationServiceItem.html', 'dojo/dom-construct', 'dojo/topic',
        'dojo/dom-class', 'dojo/on', 'explorer/services-service', 'explorer/ExplorerContainer'],
        function(declare, WidgetBase, TemplatedMixin, template, domConstruct, topic,
            domClass, on, servicesService, ExplorerContainer) {
  return declare('CreationServiceItemWidget', [ WidgetBase, TemplatedMixin ], {
    templateString : template,

    /**
     * Creates a new ExplorerContainer.
     * @constructor
     * 
     * @memberof module:explorer/widgets/MenuItemWidget#
     */
    constructor: function(obj) {
      this.name = obj.name;
      this.key = obj.key;
      this.secret = obj.secret;
      this.itemKey = obj.itemKey;
    },
    
    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/MenuItemWidget#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate : function() {
      var self = this;
      on(this.itemDelete, 'click', function(e) {
        self.deleteItem();
      });
    },
    
    /**
     * Deletes the CreationServiceItem that is clicked.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceItem#
     */
    deleteItem: function() {
      var self = this;
      var nameTokenPair = {
        name: this.name,
        st: this.getToken()
      };
      
      this.getServicesService().deleteService(nameTokenPair, {
        success: function(data) {
          topic.publish('itemDeleted', data);
        },
        error: function(data) {
          console.error("There was an error");
        }
      }); 
    },
    
    /**
     * Getter method for the security token in the ExplorerContainer module.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceItem#
     * @returns {String} The security token as a string.
     */
    getToken: function() {
      return ExplorerContainer.getInstance().containerToken;
    },
    
    /**
     * Getter method for the servicesService module for testing purposes.
     *
     * @memberof module:explorer/widgets/creation/CreationServiceItem#
     * @returns {servicesService} The servicesService object.
     */
    getServicesService : function() {
      return servicesService;
    }
  });
});