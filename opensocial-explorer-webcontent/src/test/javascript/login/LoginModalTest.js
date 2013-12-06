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
define(['explorer/widgets/login/LoginModal', 'dojo/query', 'dojo/Deferred',
        'explorer/openid-service', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'], 
    function(LoginModal, query, Deferred, openIdService) {
  describe('A LoginModal widget', function() {
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
    });
  
    it("can load Google OpenID provider for login", function() {
      var loginModal = new LoginModal();
      loginModal.facebookOAuth = {};
      loginModal.googleOAuth = {};
      
      spyOn(openIdService, "getProviders").andCallFake(function() {
        var dfd = new Deferred();
        var data = {
            testPlatform: {
              imageUrl: "testImageUrl",
              name: "testName",
              url: "testUrl"
            }
        };
        dfd.resolve(data);
        return dfd;
      });
      
      loginModal.show();
      expect(loginModal.providers.testPlatform.imageUrl).toBe("testImageUrl");
      expect(loginModal.providers.testPlatform.name).toBe("testName");
      expect(loginModal.providers.testPlatform.url).toBe("testUrl");
      expect(query("a", loginModal.domNode).innerHTML()).toBe("testName");
      
      loginModal.destroy();
    }); 
    
    it("can load Google OAuth for login", function() {
      var loginModal = new LoginModal();
      loginModal.providers = {};
      loginModal.facebookOAuth = {};
      
      loginModal.show();
      
      expect(query("a", loginModal.domNode).innerHTML()).toBe("Google OAuth");
      
      loginModal.destroy();
    });
    
    it("can load Facebook OAuth for login", function() {
      var loginModal = new LoginModal();
      loginModal.providers = {};
      loginModal.googleOAuth = {};
      
      loginModal.show();
      
      expect(query("a", loginModal.domNode).innerHTML()).toBe("Facebook");
      
      loginModal.destroy();
    });
  });
});