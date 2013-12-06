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
define(['explorer/widgets/creation/CreationSpecModal', 'explorer/widgets/SidebarNav', 'explorer/gadget-spec-service',
        'dojo/query', 'dojo/Deferred', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'], 
    function(CreationSpecModal, SidebarNav, gadgetSpecService, query, Deferred){
  describe('A CreationSpecModal widget', function(){
    it("can be shown and hidden", function() {
      var dialog = new CreationSpecModal();
      dialog.show();
      expect(dialog.domNode.getAttribute('class')).toBe('modal fade in');
      dialog.hide();
      expect(dialog.domNode.getAttribute('class')).toBe('modal fade hide');
      dialog.destroy();
    });
    
    it("closes upon user toggle of the exit button", function() {
      var dialog = new CreationSpecModal();
      dialog.show();
      expect(dialog.domNode.getAttribute('class')).toBe('modal fade in');
      dialog.creationExit.click();
      expect(dialog.domNode.getAttribute('class')).toBe('modal fade hide');
    });
    
    it("has text fields that reset upon submission", function() {
      var dialog = new CreationSpecModal();
      spyOn(gadgetSpecService, 'createNewGadgetSpec').andCallFake(function() {
        var dfd = new Deferred();
        var data = {id: "12345"};
        dfd.resolve();
        return dfd;
      });
      spyOn(dialog, 'emit').andCallThrough();
     
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
      var dialog = new CreationSpecModal();
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
      spyOn(dialog, 'emit').andCallThrough();
      spyOn(gadgetSpecService, 'createNewGadgetSpec').andCallFake(function(fakeData) {
        var dfd = new Deferred();
        var data = {id: "12345"};
        dfd.resolve(data);
        return dfd;
      });
        
      dialog.creationSubmit.click();
      
      expect(dialog.onSubmit).toHaveBeenCalled();
      expect(dialog.postNewGadgetSpec).toHaveBeenCalled();
      expect(dialog.emit).toHaveBeenCalled();
      dialog.destroy();
    });
    
    it("can create a new embedded-experience", function() {
      var dialog = new CreationSpecModal();
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
      spyOn(dialog, 'emit').andCallThrough();
      spyOn(gadgetSpecService, 'createNewGadgetSpec').andCallFake(function(fakeData) {
        var dfd = new Deferred();
        var data = {id: "12345"};
        dfd.resolve(data);
        return dfd;
      });
       
      dialog.creationSubmit.click();
      
      expect(dialog.onSubmit).toHaveBeenCalled();
      expect(dialog.postNewEESpec).toHaveBeenCalled();
      expect(dialog.emit).toHaveBeenCalled();
      dialog.destroy();
    });
  });
});