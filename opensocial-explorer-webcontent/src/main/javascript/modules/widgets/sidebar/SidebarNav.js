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
        'dojo/text!./../../templates/SidebarNav.html', 'dojo/dom-construct',
        'modules/widgets/editorarea/EditorArea', 
        'modules/gadget-spec-service', 
        "dojo/store/Memory",
        "dijit/tree/ObjectStoreModel","dijit/Tree"],
        function(declare, WidgetBase, TemplatedMixin, template, domConstruct, EditorArea,
            gadgetSpecService, 
            Memory, ObjectStoreModel, Tree) {
  var SidebarNav = declare('SidebarNavWidget', [ WidgetBase, TemplatedMixin ], {
    templateString : template,
    postCreate : function() {
      var self = this;
      gadgetSpecService.getSpecTree({
        success : function(data) {
          var tempArray = [];
          var rootId = "0";
          var temp = {
            name: "root",
            id: rootId,
            children: data.tree
          };
          tempArray.push(temp);
          
          var specStore = new Memory({
            data: tempArray,
            getChildren: function(object){
              return object.children;
            }
          });
          var specModel = new ObjectStoreModel({
            store: specStore,
            query: {name:"root"},
            mayHaveChildren: function(item){
              return item.children.length > 0;
            }
          });
          var specTree = new Tree({
            model: specModel,
            openOnClick: true,
            showRoot: false,
            persist: false,
            onClick: function(item) {
              EditorArea.getInstance().displaySpec(item.id);
              EditorArea.getInstance().setTitle(item.name);
            }
          });
          
          data.defaultPath.unshift(rootId);
          specTree.startup();
          specTree.set("path", data.defaultPath);
          specTree.placeAt(self.domNode);
          EditorArea.getInstance().setTitle(data.defaultTitle);
        },
        error : function(data) {
          console.error("There was an error");
        }
      });
    }
  });

  var instance;

  return {
    getInstance : function() {
      if(!instance) {
        instance = new SidebarNav();
      }
      return instance;
    }
  };
});