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
define(['modules/widgets/sidebar/CreationModalDialog', 'modules/widgets/sidebar/SidebarNav',
        'dojo/query', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'], 
    function(CreationModalDialog, SidebarNav, query){
  describe('A CreationModalDialog widget', function(){
    it("can be shown and hidden", function() {
      var dialog = new CreationModalDialog();
      dialog.show();
      expect(dialog.domNode.getAttribute('class')).toBe('modal fade in');
      dialog.hide();
      expect(dialog.domNode.getAttribute('class')).toBe('modal fade hide');
    });
    
    it("has text fields that reset upon submission", function() {
      var dialog = new CreationModalDialog();
      spyOn(dialog, 'getGadgetSpecService').andReturn({
        createNewGadgetSpec : function(fakeData, callbacks) {
          var data = {id: "12345"};
          callbacks.success(data);
        }
      });
      spyOn(dialog, 'addToSidebar').andReturn(undefined);
     
      dialog.creationSelection.value = "Gadget";
      dialog.creationTitle.value = "Sample Gadget";
      dialog.creationAuthor.value = "Kevin Yang";
      dialog.creationDescription.value = "My first gadget";
      
      dialog.creationSubmit.click();
      
      expect(dialog.creationSelection.value).toBe('Gadget');
      expect(dialog.creationTitle.value).toBe('');
      expect(dialog.creationAuthor.value).toBe('');
      expect(dialog.creationDescription.value).toBe('');
      dialog.destroy();
    });
    
    it("can create a new gadget", function() {
      var dialog = new CreationModalDialog();
      var fakeData = {
          title:          "Sample Gadget",
          cssResources:   [{content: "", name: "samplegadget.css"}],
          jsResources:    [{content: "", name: "samplegadget.js"}],
          htmlResources:  [{content: "",
                            name: "samplegadget.html"}],
          gadgetResource: {content: "", 
                           name: "samplegadget.xml"}
      };
      dialog.creationSelection.value = "Gadget";
      spyOn(dialog, 'onSubmit').andCallThrough();
      spyOn(dialog, 'postNewGadgetSpec').andCallThrough();
      spyOn(dialog, 'addToSidebar').andReturn(undefined);
      spyOn(dialog, 'getGadgetSpecService').andReturn({
        createNewGadgetSpec : function(fakeData, callbacks) {
          var data = {id: "12345"};
          callbacks.success(data);
        }
      });
        
       
      dialog.creationSubmit.click();
      
      expect(dialog.onSubmit).toHaveBeenCalled();
      expect(dialog.postNewGadgetSpec).toHaveBeenCalled();
      expect(dialog.getGadgetSpecService).toHaveBeenCalled();
      expect(dialog.addToSidebar).toHaveBeenCalled();
      dialog.destroy();
    });
    
    it("can create a new embedded-experience", function() {
      var dialog = new CreationModalDialog();
      var fakeData = {
          title:          "Embedded Experience",
          cssResources:   [{content: "", name: "embeddedexperience.css"}],
          jsResources:    [{content: "", name: "embeddedexperience.js"}],
          htmlResources:  [{content: "",
                            name: "embeddedexperience.html"}],
          gadgetResource: {content: "", 
                           name: "embeddedexperience.xml"},
          eeResource: {content: "{\n}", name: "embeddedexperience.json"}
                           
      };
      dialog.creationSelection.value = "Embedded Experience";
      spyOn(dialog, 'onSubmit').andCallThrough();
      spyOn(dialog, 'postNewEESpec').andCallThrough();
      spyOn(dialog, 'addToSidebar').andReturn(undefined);
      spyOn(dialog, 'getGadgetSpecService').andReturn({
        createNewGadgetSpec : function(fakeData, callbacks) {
          var data = {id: "12345"};
          callbacks.success(data);
        }
      });  
       
      dialog.creationSubmit.click();
      
      expect(dialog.onSubmit).toHaveBeenCalled();
      expect(dialog.postNewEESpec).toHaveBeenCalled();
      expect(dialog.getGadgetSpecService).toHaveBeenCalled();
      expect(dialog.addToSidebar).toHaveBeenCalled();
      dialog.destroy();
    });  
  });
});