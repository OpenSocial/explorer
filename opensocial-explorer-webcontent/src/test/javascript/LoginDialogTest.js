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
define(['modules/widgets/login/LoginDialog', 'dojo/query',
        'dojo/NodeList-manipulate', 'dojo/NodeList-dom'], 
    function(LoginDialog, query) {
  describe('A LoginDialog widget', function() {
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
      var loginDialog = new LoginDialog();
      loginDialog.facebookOAuth = {};
      loginDialog.googleOAuth = {};
      
      spyOn(loginDialog, 'getOpenIdServiceProviders').andReturn({
        getProviders : function(callbacks) {
          var data = {
              testPlatform: {
                imageUrl: "testImageUrl",
                name: "testName",
                url: "testUrl"
              }
          };
          callbacks.success(data);
        }
      });
      
      loginDialog.show();
      expect(loginDialog.providers.testPlatform.imageUrl).toBe("testImageUrl");
      expect(loginDialog.providers.testPlatform.name).toBe("testName");
      expect(loginDialog.providers.testPlatform.url).toBe("testUrl");
      expect(query("a", loginDialog.domNode).innerHTML()).toBe("testName");
      
      loginDialog.destroy();
    }); 
    
    it("can load Google OAuth for login", function() {
      var loginDialog = new LoginDialog();
      loginDialog.providers = {};
      loginDialog.facebookOAuth = {};
      
      loginDialog.show();
      
      expect(query("a", loginDialog.domNode).innerHTML()).toBe("Google OAuth");
      
      loginDialog.destroy();
    });
    
    it("can load Facebook OAuth for login", function() {
      var loginDialog = new LoginDialog();
      loginDialog.providers = {};
      loginDialog.googleOAuth = {};
      
      loginDialog.show();
      
      expect(query("a", loginDialog.domNode).innerHTML()).toBe("Facebook");
      
      loginDialog.destroy();
    });
  });
});