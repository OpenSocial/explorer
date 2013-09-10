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
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 
        'dijit/_WidgetsInTemplateMixin', 'dojo/text!./../../templates/SidebarNav.html', 
        'dojo/dom-construct', 'dojo/Evented', 'modules/widgets/sidebar/CreationModalDialog',
        'modules/gadget-spec-service', 'dojo/store/Memory', 'dojo/store/Observable', 'dojo/on',
        'dijit/tree/ObjectStoreModel', 'dijit/Tree', 'dojo/dom', 'dojo/dom-class', 'dojo/query', 'dojo/domReady!'],
        function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, template, domConstruct, Evented,
            CreationModalDialog, gadgetSpecService, Memory, Observable, on, ObjectStoreModel, Tree, dom, domClass, query) {
  return declare('SidebarNavWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Evented ], {
    templateString : template,
    specStore : null,
    specModel : null,
    specTree: null,
    startup : function() {
      var self = this;
      this.getGadgetSpecService().getSpecTree({
        success : function(json) {
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
        error : function(data) {
          console.error("There was an error");
        }
      });
      
      on(this.creationModal, 'newSpec', function(title, data) {
        self.addSpec(title, data.id);
      });
    },
    
    addSpec : function(title, specId) {
      if(this.specStore.query({name: "My Specs"}).length === 0) {
        this.specStore.put({id: "myspecs", isDefault: false, name:"My Specs", parent :"root", hasChildren: true});
      }
      this.specStore.put({id: specId, isDefault: false, name: title, parent: "myspecs", hasChildren: false});
      
      var path = this.getPath([], specId);
      var newNode = this.specStore.query({id: specId})[0];
      this.specTree.set("path", path);
      this.emit('show', newNode);
    },
    
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
    
    getDefaultId : function() {
      var object = this.specStore.query({isDefault: true})[0];
      return object.id;
    }, 
    
    getDefaultName : function() {
      var object = this.specStore.query({isDefault: true})[0];
      return object.name;
    },
    
    setNewId: function(id) {
      var focusedNode = this.specTree.get('selectedItems')[0];
      focusedNode.id = id;
    },
    
    toggleModal: function() {
      domClass.remove(this.creationModal.domNode, 'hide');
      domClass.add(this.creationModal.domNode, 'in');
      query('body').append('<div class="modal-backdrop fade in"></div>');
    },
    
    getGadgetSpecService : function() {
      return gadgetSpecService;
    }
  });
});