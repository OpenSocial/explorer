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
define(['modules/widgets/sidebar/SidebarNav'], function(SidebarNav){
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
      
      spyOn(sidebar, 'getGadgetSpecService').andReturn({
        getSpecTree : function(callbacks) {
          var data = [
            {"id":"109641752",
              "hasChildren":true,
              "isDefault":false,
              "name":"Specs",
              "parent":"root"},
            {"id":"-1583082176",
              "hasChildren":false,
              "isDefault":true,
              "name":"Welcome",
              "parent":"109641752"}];
          callbacks.success(data);
        }
      }); 
      
      document.getElementById('testDiv').appendChild(sidebar.domNode);
      sidebar.startup();
      
      expect(sidebar.getGadgetSpecService).toHaveBeenCalled();
      expect(sidebar.specTree).not.toBe(null);
      sidebar.destroy;
    }); 
    
    it("shows the creation modal when the add button is toggled", function() {
      var sidebar = new SidebarNav();
      
      spyOn(sidebar, 'getGadgetSpecService').andReturn({
        getSpecTree : function(callbacks) {
          var data = [
            {"id":"109641752",
              "hasChildren":true,
              "isDefault":false,
              "name":"Specs",
              "parent":"root"},
            {"id":"-1583082176",
              "hasChildren":false,
              "isDefault":true,
              "name":"Welcome",
              "parent":"109641752"}];
          callbacks.success(data);
        }
      }); 
      
      document.getElementById('testDiv').appendChild(sidebar.domNode);
      sidebar.startup();
      expect(sidebar.creationModal.domNode.getAttribute('class')).toBe('modal hide fade');
      sidebar.addGadgetBtn.click();
      expect(sidebar.creationModal.domNode.getAttribute('class')).toBe('modal fade in');
      sidebar.destroy;
    });
    
    it("can add a new spec", function() {
      var sidebar = new SidebarNav();
      
      spyOn(sidebar, 'getGadgetSpecService').andReturn({
        getSpecTree : function(callbacks) {
          var data = [
            {"id":"109641752",
              "hasChildren":true,
              "isDefault":false,
              "name":"Specs",
              "parent":"root"},
            {"id":"-1583082176",
              "hasChildren":false,
              "isDefault":true,
              "name":"Welcome",
              "parent":"109641752"}];
          callbacks.success(data);
        }
      }); 
      
      document.getElementById('testDiv').appendChild(sidebar.domNode);
      sidebar.startup();
      expect(sidebar.specStore.data.length).toBe(3);
      sidebar.addSpec("Sample Gadget", "123");
      expect(sidebar.specStore.data.length).toBe(5);
      expect(sidebar.specStore.query({name: "My Specs"}).length).toBe(1);
      expect(sidebar.specStore.query({name: "Sample Gadget"}).length).toBe(1);
      sidebar.destroy();
    });
  });
});