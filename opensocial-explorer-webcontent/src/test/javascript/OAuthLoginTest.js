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
define(['modules/widgets/login/OAuthLogin', 'dojo/query', 'dojo/topic',
        'dojo/NodeList-manipulate', 'dojo/NodeList-dom'], 
    function(OAuthLogin, query, topic){
  describe('An OAuthLogin widget', function(){
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'login';
      document.body.appendChild(div);
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('login'));
    });
    
    it("can toggle a popup", function() {
      
      var oAuthLogin = new OAuthLogin({
        imageUrl: "testImageUrl",
        name: "testName",
        endpoint: "testEndpoint"
      }); 
      
      var calledFunction = jasmine.createSpy('calledFunction');
      var popup = {};
      var oauth = {};
      
      window.gadgets.oauth = oauth;
      oauth.Popup = jasmine.createSpy('Popup').andReturn(popup);
      popup.createOpenerOnClick = jasmine.createSpy('createOpenerOnClick').andReturn(calledFunction);

      oAuthLogin.togglePopup();
      
      expect(oauth.Popup).toHaveBeenCalled();
      expect(popup.createOpenerOnClick).toHaveBeenCalled();
      expect(calledFunction).toHaveBeenCalled();
      
      oAuthLogin.destroy();
    });
    
    
    it("listens for the security token from the server", function() {
      var oAuthLogin = new OAuthLogin({
        imageUrl: "testImageUrl",
        name: "testName",
        endpoint: "testEndpoint"
      });
      
      var calledFunction = jasmine.createSpy('calledFunction');
      var popup = {};
      var oauth = {};
      var win_ = {};
      var document = {};
      
      window.gadgets.oauth = oauth;
      oauth.Popup = jasmine.createSpy('Popup').andReturn(popup);
      popup.createOpenerOnClick = jasmine.createSpy('createOpenerOnClick').andReturn(calledFunction);
      popup.win_ = win_;
      win_.document = document;
      document.responseObj = {securityToken: "abc123", securityTokenTTL: 456};
      
      win_.close = jasmine.createSpy('close');

      oAuthLogin.togglePopup();
      oAuthLogin.onPopupOpen();
      
      var evt = window.document.createEvent('Event');
      evt.initEvent('returnSecurityToken', true, true);
      window.document.dispatchEvent(evt);
      
      expect(oAuthLogin.securityToken).toBe("abc123");
      expect(oAuthLogin.securityTokenTTL).toBe(456);
      expect(win_.close).toHaveBeenCalled();
      oAuthLogin.destroy();
    });
    
    it("can close a popup, hide the login modal, and update the welcome text", function() {
      var oAuthLogin = new OAuthLogin({
        imageUrl: "testImageUrl",
        name: "testName",
        endpoint: "testEndpoint"
      });
      
      oAuthLogin.securityToken = "abc123";
      oAuthLogin.securityTokenTTL = 456;
      
      var testSecurityToken, testSecurityTokenTTL;
      topic.subscribe('updateToken', function(securityToken, securityTokenTTL) {
        testSecurityToken = securityToken;
        testSecurityTokenTTL = securityTokenTTL;
      });
      
      oAuthLogin.onPopupClose();
      
      expect(testSecurityToken).toBe('abc123');
      expect(testSecurityTokenTTL).toBe(456);
      expect(document.getElementById('login').innerHTML).toBe("Welcome!");
      
      oAuthLogin.destroy();
    }); 
  });
});