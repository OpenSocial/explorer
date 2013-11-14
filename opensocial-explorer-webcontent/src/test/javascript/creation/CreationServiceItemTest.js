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
define(['explorer/widgets/creation/CreationServiceItem', 'dojo/topic'], 
        function(CreationServiceItem, topic){
  describe('An CreationServiceItem widget', function() {
    var creationJSON = {
        version: "oauth1",
        st: "testSt",
        name: "testName",
        key: "testKey",
        secret: "testSecret",
        keyType: "testKeyType",
        callbackUrl : "testCallbackUrl"
    };
    
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
    });
    
    it("can be created and can display the correct information", function() {
      var creationItem = new CreationServiceItem(creationJSON);
      document.getElementById('testDiv').appendChild(creationItem.domNode);
      
      expect(creationItem.name).toBe("testName");
      expect(creationItem.key).toBe("testKey");
      expect(creationItem.secret).toBe("testSecret");
      expect(creationItem.keyType).toBe("testKeyType");
      
      creationItem.destroy();
    }); 
    
    it("can delete itself", function() {
      var creationItem = new CreationServiceItem(creationJSON);
      document.getElementById('testDiv').appendChild(creationItem.domNode);
      
      spyOn(creationItem, "publishUpdatedData");
      spyOn(creationItem, "getServicesService").andReturn({
        deleteService: function(nameTokenPair, callbacks) {
          var data = [];
          callbacks.success(data);
        }
      })
      
      creationItem.itemDelete.click();
      
      expect(creationItem.publishUpdatedData).toHaveBeenCalledWith([]);
      
      creationItem.destroy();
    }); 
  });
});