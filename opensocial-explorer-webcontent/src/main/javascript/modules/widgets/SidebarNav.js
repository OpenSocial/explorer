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
 * Contains the Dojo Tree Control for specs and the CreationModal Module.
 *
 * @module explorer/widgets/SidebarNav
 * @requires module:explorer/widgets/creation/CreationSpecModal
 * @requires module:explorer/gadget-spec-service
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @augments dijit/_WidgetsInTemplateMixin
 * @augments dojo/Evented
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dojo/Evented.html|Evented Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 
        'dijit/_WidgetsInTemplateMixin', 'dojo/text!./../templates/SidebarNav.html', 'dojo/on', 
        'dojo/dom-construct', 'dojo/Evented', 'explorer/widgets/creation/CreationSpecModal',
        'explorer/gadget-spec-service', 'dojo/store/Memory', 'dojo/store/Observable', 'dojo/topic',
        'dijit/tree/ObjectStoreModel', 'dijit/Tree', 'dojo/dom', 'dojo/dom-class', 'dojo/query', 'dojo/domReady!'],
        function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, template, on, domConstruct, Evented,
            CreationSpecModal, gadgetSpecService, Memory, Observable, topic, ObjectStoreModel, Tree, dom, domClass, query) {
  return declare('SidebarNavWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Evented ], {
    templateString : template,
    specStore : null,
    specModel : null,
    specTree: null,
    
    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/SidebarNav#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      var self = this;
      gadgetSpecService.getSpecTree().then(
        function(json) {
          json.unshift({name: "Root", id: "root"});
          
          self.specStore = new Memory({
            data: json,
            getChildren: function(object){
              return this.query({parent: object.id});
            }
          });
          
          self.specStore = new Observable(self.specStore);
          
          self.specModel = new ObjectStoreModel({
            store: self.specStore,
            query: {id:"root"},
            mayHaveChildren: function(item){
              return item.hasChildren;
            } 
          });
          
          self.specTree = new Tree({
            model: self.specModel,
            openOnClick: true,
            showRoot: false,
            persist: false,
            onClick: function(node) {
              self.emit('show', node);
            }
          });
          
          self.specTree.startup();
          self.specTree.set("path", self.getPath([], self.getDefaultId()));
          self.specTree.placeAt(self.domNode);
        },
        function(data) {
          console.error("There was an error");
        }
      );
      
      on(this.creationSpecModal, 'newSpec', function(title, data) {
        self.addSpec(title, data.id);
      });
      
      self.subscription = topic.subscribe('toggleCreationSpecModal', function() {   
        self.creationSpecModal.show();    
      });
    },
    
    /**
    * Adds a new spec to the Tree Control. If a user-created spec doesn't exist yet, a folder called "My Specs" is also added.
    *
    * @memberof module:explorer/widgets/SidebarNav#
    *
    * @param {String} title - Title of the spec to be added.
    * @param {String} specId - Id of the spec to be added.
    */
    addSpec : function(title, specId) {
      if(this.specStore.query({name: "My Specs"}).length === 0) {
        this.specStore.put({id: "myspecs", isDefault: false, name:"My Specs", parent :"root", hasChildren: true});
      }
      this.specStore.put({id: specId, isDefault: false, name: title, parent: "myspecs", hasChildren: false});
      
      var path = this.getPath([], specId);
      var newNode = this.specStore.query({id: specId})[0];
      var self = this;
      this.specTree.set('path', path).then(function() {
        self.emit('show', newNode);
      }, function(e) {
        console.error('There was an error selecting the node with the id ' + specId);
      });
    },
    
    /**
     * Gets the ID path of the spec in the tree control. Used to set the specTree focus to the particular spec.
     *
     * @memberof module:explorer/widgets/SidebarNav#
     *
     * @param {String} path - Accumulator parameter, starts as an empty array and is built up and eventually returned.
     * @param {String} startId - Id of the current object in the path.
     *
     * @returns {String} The path of the spec.
     */
    getPath : function(path, startId) {
      var object = this.specStore.query({id: startId})[0];
      if(object.id == "root") {
        path.unshift(object.id);
        return path;
      } else {
        path.unshift(object.id);
        return this.getPath(path, object.parent);
      }
    },
    
    /**
     * Gets the ID of the default spec in the specTree (The spec that is initally displayed).
     *
     * @memberof module:explorer/widgets/SidebarNav#
     *
     * @returns {String} The default spec's ID.
     */
    getDefaultId : function() {
      var object = this.specStore.query({isDefault: true})[0];
      return object.id;
    }, 
    
    /**
     * Gets the name of the default spec in the specTree (The spec that is initally displayed).
     *
     * @memberof module:explorer/widgets/SidebarNav#
     *
     * @returns {String} The default spec's name.
     */
    getDefaultName : function() {
      var object = this.specStore.query({isDefault: true})[0];
      return object.name;
    },
    
    /**
     * Sets the ID of the focused spec in the specTree to the ID provided by the xhr POST. 
     * When a spec is added or rerendered, the servlet assigns a new ID to the updated spec. 
     * We use this method so that the spec's ID in the Dojo Tree is representative of its updated counterpart server-side.
     *
     * @memberof module:explorer/widgets/SidebarNav#
     *
     * @param {String} The default spec's ID.
     */
    setNewId: function(id) {
      var focusedNode = this.specTree.get('selectedItems')[0];
      focusedNode.id = id;
    },
    
    /**
     * Unsubscribes and deletes the Widget. Used for testing purposes.
     *
     * @memberof module:explorer/widgets/SidebarNav#
     */
    destroy: function() {
      this.subscription.remove();
      this.inherited(arguments);
    }
  });
});