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
define(['explorer/widgets/SidebarNav', 'dojo/topic', 'dojo/Deferred', 'dojo/on', 
        'explorer/gadget-spec-service', 'dojo/Deferred'], 
    function(SidebarNav, topic, Deferred, on, gadgetSpecService) {
  describe('A SidebarNav widget', function() {
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
    });
  
    it("can be started", function() {
      var sidebar = new SidebarNav();
      
      spyOn(gadgetSpecService, 'getSpecTree').andCallFake(function() {
        var dfd = new Deferred();
        var data = [{"id":"109641752",
                     "hasChildren":true,
                     "isDefault":false,
                     "name":"Specs",
                     "parent":"root"},
                    {"id":"-1583082176",
                     "hasChildren":false,
                     "isDefault":true,
                     "name":"Welcome",
                     "parent":"109641752"}];
        dfd.resolve(data);
        return dfd;
      });
      
      document.getElementById('testDiv').appendChild(sidebar.domNode);
      sidebar.startup();
      
      expect(sidebar.specTree).not.toBe(null);
      sidebar.destroy();
    }); 

    it("can add a new spec", function() {
      var sidebar = new SidebarNav();
      
      spyOn(gadgetSpecService, 'getSpecTree').andCallFake(function() {
        var dfd = new Deferred();
        var data = [{"id":"109641752",
                     "hasChildren":true,
                     "isDefault":false,
                     "name":"Specs",
                     "parent":"root"},
                    {"id":"-1583082176",
                     "hasChildren":false,
                     "isDefault":true,
                     "name":"Welcome",
                     "parent":"109641752"}];
        dfd.resolve(data);
        return dfd;
      });
      
      document.getElementById('testDiv').appendChild(sidebar.domNode);
      sidebar.startup();
      expect(sidebar.specStore.data.length).toBe(3);
      
      var node;
      on(sidebar, 'show', function(newNode) {
        node = newNode;
      });
      runs(function() {
        var def = new Deferred();
        def.resolve('foo');
        spyOn(sidebar.specTree, 'set').andReturn(def);
        sidebar.addSpec("Sample Gadget", "123");
      });        
      waitsFor(function() {
        return node;
      }, "The node was not selected.", 750);        
      runs(function() {
        expect(node).toEqual({hasChildren : false, id : "123", isDefault : false, name : "Sample Gadget", parent : "myspecs"});
        expect(sidebar.specStore.data.length).toBe(5);
        expect(sidebar.specStore.query({name: "My Specs"}).length).toBe(1);
        expect(sidebar.specStore.query({name: "Sample Gadget"}).length).toBe(1);
        sidebar.destroy();
      });
    }); 
  });
});