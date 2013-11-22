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
define(['explorer/widgets/creation/CreationMenu', 'dojo/dom-class', 'dojo/topic', 'dojo/dom-style'], 
        function(CreationMenu, domClass, topic, domStyle){
  describe('An CreationMenu widget', function() {
  
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
    });
    
    it("is visible only when the user is logged in", function() {
      var creationMenu = new CreationMenu();
      document.getElementById('testDiv').appendChild(creationMenu.domNode);
      expect(domClass.contains(creationMenu.domNode, "hide")).toBe(true);
      
      topic.publish("updateToken");
      expect(domClass.contains(creationMenu.domNode, "hide")).toBe(false);
      
      creationMenu.destroy();
    }); 
     
    it("opens the new spec modal when the new spec button is toggled", function() {
      var creationMenu = new CreationMenu();
      var subscriptionReceived = false;
      var subscription = topic.subscribe("toggleCreationSpecModal", function() {
        subscriptionReceived = true;
      });
      document.getElementById('testDiv').appendChild(creationMenu.domNode);
      
      runs(function() {
        creationMenu.addGadgetButton.click();
      });

      waitsFor(function() {
        return subscriptionReceived;
      }, "The subscription should have been received", 750);
      
      runs(function() {
        expect(subscriptionReceived).toBe(true);
        subscription.remove();
        creationMenu.destroy();
      });
    }); 
    
    it("opens the services modal when the service button is toggled", function() {
      var creationMenu = new CreationMenu();
      document.getElementById('testDiv').appendChild(creationMenu.domNode);
      
      creationMenu.addServiceButton.click();
      
      expect(domClass.contains(creationMenu.serviceModal, "hide")).toBe(false);
      creationMenu.destroy();
    });   
  });
});