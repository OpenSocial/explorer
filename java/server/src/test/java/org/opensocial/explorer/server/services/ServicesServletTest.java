/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.opensocial.explorer.server.services;

import static org.easymock.EasyMock.*;
import static org.junit.Assert.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shindig.auth.AuthInfoUtil;
import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.auth.UrlParameterAuthenticationHandler;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.gadgets.http.HttpResponse;
import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret;
import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret.KeyType;
import org.apache.shindig.gadgets.oauth2.OAuth2Accessor.Type;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Client;
import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.opensocial.explorer.server.oauth.NoSuchStoreException;
import org.opensocial.explorer.server.oauth.OSEOAuthStore;
import org.opensocial.explorer.server.oauth.OSEOAuthStoreProvider;
import org.opensocial.explorer.server.oauth2.OSEInMemoryCache;
import org.opensocial.explorer.server.oauth2.OSEOAuth2Store;
import org.opensocial.explorer.server.oauth2.OSEOAuth2StoreProvider;
import org.powermock.api.easymock.PowerMock;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

@PrepareForTest({AuthInfoUtil.class})
@RunWith(PowerMockRunner.class)
public class ServicesServletTest {

  private ServicesServlet servlet;
  private HttpServletRequest req;
  private HttpServletResponse resp;
  private Authority authority;
  private OSEOAuthStoreProvider oAuthProvider;
  private OSEOAuth2StoreProvider oAuth2Provider;
  private SecurityToken st;
  private OSEOAuthStore oAuthStore;
  private OSEOAuth2Store oAuth2Store;
  private OSEInMemoryCache cache;
  private ByteArrayOutputStream stream = new ByteArrayOutputStream();
  private PrintWriter writer = new PrintWriter(stream);
  
  @Before
  public void setUp() throws Exception {
    servlet = new ServicesServlet();
    cache = new OSEInMemoryCache();
    oAuthStore = new OSEOAuthStore();
    oAuth2Store = new OSEOAuth2Store(cache, null, null, null, authority, null, null);
    req = createMock(HttpServletRequest.class);
    resp = createNiceMock(HttpServletResponse.class);
    authority = createMock(Authority.class);
    oAuthProvider = createMock(OSEOAuthStoreProvider.class);
    oAuth2Provider = createMock(OSEOAuth2StoreProvider.class);
    st = createMock(SecurityToken.class);
    PowerMock.mockStatic(GoogleIdToken.class);
    
    expect(st.getOwnerId()).andReturn("testID");
    expect(oAuthProvider.get()).andReturn(oAuthStore);
    expect(oAuth2Provider.get()).andReturn(oAuth2Store);
    expect(AuthInfoUtil.getSecurityTokenFromRequest(req)).andReturn(st);
    
    PowerMock.replay(AuthInfoUtil.class);
    replay(oAuthProvider);
    replay(oAuth2Provider);
    servlet.injectDependencies(oAuthProvider, oAuth2Provider, authority, "testContextRoot/");
  }

  @After
  public void tearDown() throws Exception {
    // Verify
    verify(req);
    verify(resp);
    verify(oAuthProvider);
    verify(oAuth2Provider);
    verify(authority);
    verify(st);
    PowerMock.verify(AuthInfoUtil.class);
  }
  
  @Test
  public void testDoGetEmpty() throws Exception {
    expect(resp.getWriter()).andReturn(writer);
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doGet(req, resp);
    
    JSONObject testReturn = new JSONObject();
    testReturn.put("oauth", new JSONArray());
    testReturn.put("oauth2", new JSONArray());
    
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  } 
  
  @Test
  public void testDoGetExisting() throws Exception {
    BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret("testKey", "testSecret", KeyType.HMAC_SYMMETRIC, "testName", "testCallbackUrl");
    servlet.getOAuthStore().addUserService("testID", "testName", kas);

    expect(resp.getWriter()).andReturn(writer);
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doGet(req, resp);
    
    JSONObject testOAuthObject = new JSONObject();
      testOAuthObject.put("key", "testKey");
      testOAuthObject.put("secret", "testSecret");
      testOAuthObject.put("name", "testName");
      testOAuthObject.put("callbackUrl", "testCallbackUrl");
      testOAuthObject.put("keyType", "HMAC_SYMMETRIC");
    JSONArray testOAuthArray = new JSONArray();
      testOAuthArray.add(testOAuthObject);
    JSONObject testReturn = new JSONObject();
      testReturn.put("oauth", testOAuthArray);
      testReturn.put("oauth2", new JSONArray());
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  } 
  
  @Test
  public void testDoGetExistingOAuth2() throws Exception {
    OAuth2Client client = new OAuth2Client();
    client.setServiceName("testName");
    client.setClientId("testClientId");
    client.setClientSecret("testClientSecret".getBytes());
    client.setAuthorizationUrl("testAuthUrl");
    client.setTokenUrl("testTokenUrl");
    client.setType(Type.CONFIDENTIAL);
    client.setGrantType("testGrantType");
    client.setClientAuthenticationType("testAuthentication");
    client.setAllowModuleOverride(true);
    client.setAuthorizationHeader(false);
    client.setUrlParameter(true);
    client.setRedirectUri("testRedirectUrl");
    servlet.getOAuth2Store().addUserService("testID", "testName", client);

    expect(resp.getWriter()).andReturn(writer);
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doGet(req, resp);
    
    JSONObject service = new JSONObject();
      service.put("name", "testName");
      service.put("clientId", "testClientId");
      service.put("clientSecret", "testClientSecret");
      service.put("authUrl", "testAuthUrl");
      service.put("tokenUrl", "testTokenUrl");
      service.put("type", "CONFIDENTIAL");
      service.put("grantType", "testGrantType");
      service.put("authentication", "testAuthentication");
      service.put("override", true);
      service.put("authHeader", false);
      service.put("urlParam", true);
      service.put("redirectUrl", "testRedirectUrl");
    JSONArray testOAuthArray = new JSONArray();
      testOAuthArray.add(service);
    JSONObject testReturn = new JSONObject();
      testReturn.put("oauth", new JSONArray());
      testReturn.put("oauth2", testOAuthArray);
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  } 
  
  @Test
  public void testDoGetExistingBoth() throws Exception {
    BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret("testKey", "testSecret", KeyType.HMAC_SYMMETRIC, "testName", "testCallbackUrl");
    servlet.getOAuthStore().addUserService("testID", "testName", kas);
    
    OAuth2Client client = new OAuth2Client();
    client.setServiceName("testName");
    client.setClientId("testClientId");
    client.setClientSecret("testClientSecret".getBytes());
    client.setAuthorizationUrl("testAuthUrl");
    client.setTokenUrl("testTokenUrl");
    client.setType(Type.CONFIDENTIAL);
    client.setGrantType("testGrantType");
    client.setClientAuthenticationType("testAuthentication");
    client.setAllowModuleOverride(true);
    client.setAuthorizationHeader(false);
    client.setUrlParameter(true);
    client.setRedirectUri("testRedirectUrl");
    servlet.getOAuth2Store().addUserService("testID", "testName", client);

    expect(resp.getWriter()).andReturn(writer);
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doGet(req, resp);
    
    JSONObject testOAuthObject = new JSONObject();
      testOAuthObject.put("key", "testKey");
      testOAuthObject.put("secret", "testSecret");
      testOAuthObject.put("name", "testName");
      testOAuthObject.put("callbackUrl", "testCallbackUrl");
      testOAuthObject.put("keyType", "HMAC_SYMMETRIC");
    JSONObject testOAuth2Object = new JSONObject();
      testOAuth2Object.put("name", "testName");
      testOAuth2Object.put("clientId", "testClientId");
      testOAuth2Object.put("clientSecret", "testClientSecret");
      testOAuth2Object.put("authUrl", "testAuthUrl");
      testOAuth2Object.put("tokenUrl", "testTokenUrl");
      testOAuth2Object.put("type", "CONFIDENTIAL");
      testOAuth2Object.put("grantType", "testGrantType");
      testOAuth2Object.put("authentication", "testAuthentication");
      testOAuth2Object.put("override", true);
      testOAuth2Object.put("authHeader", false);
      testOAuth2Object.put("urlParam", true);
      testOAuth2Object.put("redirectUrl", "testRedirectUrl");
    JSONArray testOAuth1Array = new JSONArray();
      testOAuth1Array.add(testOAuthObject);
    JSONArray testOAuth2Array = new JSONArray();
      testOAuth2Array.add(testOAuth2Object);
    JSONObject testReturn = new JSONObject();
      testReturn.put("oauth", testOAuth1Array);
      testReturn.put("oauth2", testOAuth2Array);
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  }
  
  @Test
  public void testDoPostEmpty() throws Exception {
    expect(resp.getWriter()).andReturn(writer);
    expect(authority.getOrigin()).andReturn("testOrigin/");
    expect(req.getPathInfo()).andReturn("/oauth");
    expect(req.getParameter("key")).andReturn("testKey");
    expect(req.getParameter("secret")).andReturn("testSecret");
    expect(req.getParameter("name")).andReturn("testName");
    expect(req.getParameter("callbackUrl")).andReturn("%origin%%contextRoot%testCallbackUrl");
    expect(req.getParameter("keyType")).andReturn("HMAC_SYMMETRIC");
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
    
    JSONObject testOAuthObject = new JSONObject();
      testOAuthObject.put("key", "testKey");
      testOAuthObject.put("secret", "testSecret");
      testOAuthObject.put("name", "testName");
      testOAuthObject.put("callbackUrl", "testOrigin/testContextRoot/testCallbackUrl");
      testOAuthObject.put("keyType", "HMAC_SYMMETRIC");
    JSONArray testOAuthArray = new JSONArray();
      testOAuthArray.add(testOAuthObject);
    JSONObject testReturn = new JSONObject();
      testReturn.put("oauth", testOAuthArray);
      testReturn.put("oauth2", new JSONArray());
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  }
  
  @Test
  public void testDoPostEmptyOAuth2() throws Exception {
    expect(resp.getWriter()).andReturn(writer);
    expect(authority.getOrigin()).andReturn("testOrigin/");
    expect(req.getPathInfo()).andReturn("/oauth2");
    expect(req.getParameter("name")).andReturn("testName");
    expect(req.getParameter("clientId")).andReturn("testClientId");
    expect(req.getParameter("clientSecret")).andReturn("testClientSecret");
    expect(req.getParameter("authUrl")).andReturn("testAuthUrl");
    expect(req.getParameter("tokenUrl")).andReturn("testTokenUrl");
    expect(req.getParameter("type")).andReturn("CONFIDENTIAL");
    expect(req.getParameter("grantType")).andReturn("testGrantType");
    expect(req.getParameter("authentication")).andReturn("testAuthentication");
    expect(req.getParameter("override")).andReturn("true");
    expect(req.getParameter("authHeader")).andReturn("false");
    expect(req.getParameter("urlParam")).andReturn("true");
    expect(req.getParameter("redirectUrl")).andReturn("%origin%%contextRoot%testRedirectUrl");
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
    
    JSONObject service = new JSONObject();
      service.put("name", "testName");
      service.put("clientId", "testClientId");
      service.put("clientSecret", "testClientSecret");
      service.put("authUrl", "testAuthUrl");
      service.put("tokenUrl", "testTokenUrl");
      service.put("type", "CONFIDENTIAL");
      service.put("grantType", "testGrantType");
      service.put("authentication", "testAuthentication");
      service.put("override", true);
      service.put("authHeader", false);
      service.put("urlParam", true);
      service.put("redirectUrl", "testOrigin/testContextRoot/testRedirectUrl");
    JSONArray testOAuthArray = new JSONArray();
      testOAuthArray.add(service);
    JSONObject testReturn = new JSONObject();
      testReturn.put("oauth", new JSONArray());
      testReturn.put("oauth2", testOAuthArray);
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  }
  
  
  @Test
  public void testDoPostOverwrite() throws Exception {
    BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret("testKey2", "testSecret2", KeyType.HMAC_SYMMETRIC, "testName2", "testCallbackUrl2");
    servlet.getOAuthStore().addUserService("testID", "testName", kas);

    expect(resp.getWriter()).andReturn(writer);
    expect(authority.getOrigin()).andReturn("testOrigin/");
    expect(req.getPathInfo()).andReturn("/oauth");
    expect(req.getParameter("key")).andReturn("testKey");
    expect(req.getParameter("secret")).andReturn("testSecret");
    expect(req.getParameter("name")).andReturn("testName");
    expect(req.getParameter("callbackUrl")).andReturn("%origin%%contextRoot%testCallbackUrl");
    expect(req.getParameter("keyType")).andReturn("HMAC_SYMMETRIC");
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
    
    JSONObject testOAuthObject = new JSONObject();
      testOAuthObject.put("key", "testKey");
      testOAuthObject.put("secret", "testSecret");
      testOAuthObject.put("name", "testName");
      testOAuthObject.put("callbackUrl", "testOrigin/testContextRoot/testCallbackUrl");
      testOAuthObject.put("keyType", "HMAC_SYMMETRIC");
    JSONArray testOAuthArray = new JSONArray();
      testOAuthArray.add(testOAuthObject);
    JSONObject testReturn = new JSONObject();
      testReturn.put("oauth", testOAuthArray);
      testReturn.put("oauth2", new JSONArray());
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  }
  
  @Test
  public void testDoPostOverwriteOAuth2() throws Exception {
    OAuth2Client client = new OAuth2Client();
    client.setServiceName("testName123");
    client.setClientId("testClientId123");
    client.setClientSecret("testClientSecret123".getBytes());
    client.setAuthorizationUrl("testAuthUrl123");
    client.setTokenUrl("testTokenUrl123");
    client.setType(Type.UNKNOWN);
    client.setGrantType("testGrantType123");
    client.setClientAuthenticationType("testAuthentication123");
    client.setAllowModuleOverride(false);
    client.setAuthorizationHeader(true);
    client.setUrlParameter(false);
    client.setRedirectUri("testRedirectUrl123");
    servlet.getOAuth2Store().addUserService("testID", "testName", client);
    
    expect(resp.getWriter()).andReturn(writer);
    expect(authority.getOrigin()).andReturn("testOrigin/");
    expect(req.getPathInfo()).andReturn("/oauth2");
    expect(req.getParameter("name")).andReturn("testName");
    expect(req.getParameter("clientId")).andReturn("testClientId");
    expect(req.getParameter("clientSecret")).andReturn("testClientSecret");
    expect(req.getParameter("authUrl")).andReturn("testAuthUrl");
    expect(req.getParameter("tokenUrl")).andReturn("testTokenUrl");
    expect(req.getParameter("type")).andReturn("CONFIDENTIAL");
    expect(req.getParameter("grantType")).andReturn("testGrantType");
    expect(req.getParameter("authentication")).andReturn("testAuthentication");
    expect(req.getParameter("override")).andReturn("true");
    expect(req.getParameter("authHeader")).andReturn("false");
    expect(req.getParameter("urlParam")).andReturn("true");
    expect(req.getParameter("redirectUrl")).andReturn("%origin%%contextRoot%testRedirectUrl");
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
    
    JSONObject service = new JSONObject();
      service.put("name", "testName");
      service.put("clientId", "testClientId");
      service.put("clientSecret", "testClientSecret");
      service.put("authUrl", "testAuthUrl");
      service.put("tokenUrl", "testTokenUrl");
      service.put("type", "CONFIDENTIAL");
      service.put("grantType", "testGrantType");
      service.put("authentication", "testAuthentication");
      service.put("override", true);
      service.put("authHeader", false);
      service.put("urlParam", true);
      service.put("redirectUrl", "testOrigin/testContextRoot/testRedirectUrl");
    JSONArray testOAuthArray = new JSONArray();
      testOAuthArray.add(service);
    JSONObject testReturn = new JSONObject();
      testReturn.put("oauth", new JSONArray());
      testReturn.put("oauth2", testOAuthArray);
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  }
  
  @Test
  public void testDoPostAdd() throws Exception {
    BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret("testKey2", "testSecret2", KeyType.HMAC_SYMMETRIC, "testName2", "testCallbackUrl2");
    servlet.getOAuthStore().addUserService("testID", "testName2", kas);

    expect(resp.getWriter()).andReturn(writer);
    expect(authority.getOrigin()).andReturn("testOrigin/");
    expect(req.getPathInfo()).andReturn("/oauth");
    expect(req.getParameter("key")).andReturn("testKey");
    expect(req.getParameter("secret")).andReturn("testSecret");
    expect(req.getParameter("name")).andReturn("testName");
    expect(req.getParameter("callbackUrl")).andReturn("%origin%%contextRoot%testCallbackUrl");
    expect(req.getParameter("keyType")).andReturn("HMAC_SYMMETRIC");
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
    
    JSONObject testOAuthObject = new JSONObject();
      testOAuthObject.put("key", "testKey");
      testOAuthObject.put("secret", "testSecret");
      testOAuthObject.put("name", "testName");
      testOAuthObject.put("callbackUrl", "testOrigin/testContextRoot/testCallbackUrl");
      testOAuthObject.put("keyType", "HMAC_SYMMETRIC");
    JSONObject testOAuthObject2 = new JSONObject();
      testOAuthObject2.put("key", "testKey2");
      testOAuthObject2.put("secret", "testSecret2");
      testOAuthObject2.put("name", "testName2");
      testOAuthObject2.put("callbackUrl", "testCallbackUrl2");
      testOAuthObject2.put("keyType", "HMAC_SYMMETRIC");
    JSONArray testOAuthArray = new JSONArray();
      testOAuthArray.add(testOAuthObject);
      testOAuthArray.add(testOAuthObject2);
    JSONObject testReturn = new JSONObject();
      testReturn.put("oauth", testOAuthArray);
      testReturn.put("oauth2", new JSONArray());
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  }
  
  @Test
  public void testDoPostAddOAuth2() throws Exception {
    OAuth2Client client = new OAuth2Client();
    client.setServiceName("testName123");
    client.setClientId("testClientId123");
    client.setClientSecret("testClientSecret123".getBytes());
    client.setAuthorizationUrl("testAuthUrl123");
    client.setTokenUrl("testTokenUrl123");
    client.setType(Type.UNKNOWN);
    client.setGrantType("testGrantType123");
    client.setClientAuthenticationType("testAuthentication123");
    client.setAllowModuleOverride(false);
    client.setAuthorizationHeader(true);
    client.setUrlParameter(false);
    client.setRedirectUri("testRedirectUrl123");
    servlet.getOAuth2Store().addUserService("testID", "testName123", client);
    
    expect(resp.getWriter()).andReturn(writer);
    expect(authority.getOrigin()).andReturn("testOrigin/");
    expect(req.getPathInfo()).andReturn("/oauth2");
    expect(req.getParameter("name")).andReturn("testName");
    expect(req.getParameter("clientId")).andReturn("testClientId");
    expect(req.getParameter("clientSecret")).andReturn("testClientSecret");
    expect(req.getParameter("authUrl")).andReturn("testAuthUrl");
    expect(req.getParameter("tokenUrl")).andReturn("testTokenUrl");
    expect(req.getParameter("type")).andReturn("CONFIDENTIAL");
    expect(req.getParameter("grantType")).andReturn("testGrantType");
    expect(req.getParameter("authentication")).andReturn("testAuthentication");
    expect(req.getParameter("override")).andReturn("true");
    expect(req.getParameter("authHeader")).andReturn("false");
    expect(req.getParameter("urlParam")).andReturn("true");
    expect(req.getParameter("redirectUrl")).andReturn("%origin%%contextRoot%testRedirectUrl");
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
    JSONObject service1 = new JSONObject();
      service1.put("name", "testName123");
      service1.put("clientId", "testClientId123");
      service1.put("clientSecret", "testClientSecret123");
      service1.put("authUrl", "testAuthUrl123");
      service1.put("tokenUrl", "testTokenUrl123");
      service1.put("type", "UNKNOWN");
      service1.put("grantType", "testGrantType123");
      service1.put("authentication", "testAuthentication123");
      service1.put("override", false);
      service1.put("authHeader", true);
      service1.put("urlParam", false);
      service1.put("redirectUrl", "testRedirectUrl123");
    JSONObject service2 = new JSONObject();
      service2.put("name", "testName");
      service2.put("clientId", "testClientId");
      service2.put("clientSecret", "testClientSecret");
      service2.put("authUrl", "testAuthUrl");
      service2.put("tokenUrl", "testTokenUrl");
      service2.put("type", "CONFIDENTIAL");
      service2.put("grantType", "testGrantType");
      service2.put("authentication", "testAuthentication");
      service2.put("override", true);
      service2.put("authHeader", false);
      service2.put("urlParam", true);
      service2.put("redirectUrl", "testOrigin/testContextRoot/testRedirectUrl");
      
    JSONArray testOAuthArray = new JSONArray();
      testOAuthArray.add(service2);
      testOAuthArray.add(service1);
    JSONObject testReturn = new JSONObject();
      testReturn.put("oauth", new JSONArray());
      testReturn.put("oauth2", testOAuthArray);
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  }
  
  @Test
  public void testDoPostEmptyParameter() throws Exception {
    expect(req.getPathInfo()).andReturn("/oauth");
    expect(req.getParameter("key")).andReturn("");
    expect(req.getParameter("secret")).andReturn("testSecret");
    expect(req.getParameter("name")).andReturn("testName");
    
    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Name, Key and Secret parameters on POST request cannot be empty.");
    expectLastCall();
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
  }
  
  @Test
  public void testDoPostEmptyParameterOAuth2() throws Exception {
    expect(req.getPathInfo()).andReturn("/oauth2");
    expect(req.getParameter("name")).andReturn("");
    expect(req.getParameter("clientId")).andReturn("testClientId");
    expect(req.getParameter("clientSecret")).andReturn("testClientSecret");
    expect(req.getParameter("authUrl")).andReturn("testAuthUrl");
    expect(req.getParameter("tokenUrl")).andReturn("testTokenUrl");
    
    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Name, Id, Secret, AuthUrl, and TokenUrl parameters on POST request cannot be empty.");
    expectLastCall();
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
  }
  
  @Test
  public void testDoDeleteEmpty() throws Exception {
    expect(req.getPathInfo()).andReturn("/oauth");
    expect(req.getParameter("name")).andReturn("testName");
    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "The store corresponding to the user's data we are trying to get doesn't exist!");
    expectLastCall();
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doDelete(req, resp);
  }
  
  @Test
  public void testDoDeleteEmptyOAuth2() throws Exception {
    expect(req.getPathInfo()).andReturn("/oauth2");
    expect(req.getParameter("name")).andReturn("testName");
    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "The store corresponding to the user's data we are trying to get doesn't exist!");
    expectLastCall();
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doDelete(req, resp);
  }
  
  @Test
  public void testDoDeleteEmptyParameter() throws Exception {
    expect(req.getPathInfo()).andReturn("/oauth");
    expect(req.getParameter("name")).andReturn("");
    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Name parameter on DELETE request cannot be empty.");
    expectLastCall();
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doDelete(req, resp);
  }
  
  @Test
  public void testDoDeleteEmptyParameterOAuth2() throws Exception {
    expect(req.getPathInfo()).andReturn("/oauth2");
    expect(req.getParameter("name")).andReturn("");
    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Name parameter on DELETE request cannot be empty.");
    expectLastCall();
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doDelete(req, resp);
  }
  
  @Test
  public void testDoDelete() throws Exception {
    BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret("testKey", "testSecret", KeyType.HMAC_SYMMETRIC, "testName", "testCallbackUrl");
    servlet.getOAuthStore().addUserService("testID", "testName", kas);

    expect(req.getPathInfo()).andReturn("/oauth");
    expect(resp.getWriter()).andReturn(writer);
    expect(req.getParameter("name")).andReturn("testName");
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doDelete(req, resp);
    
    JSONObject testReturn = new JSONObject();
    testReturn.put("oauth", new JSONArray());
    testReturn.put("oauth2", new JSONArray());
    
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  }
  
  @Test
  public void testDoDeleteOAuth2() throws Exception {
    OAuth2Client client = new OAuth2Client();
    client.setServiceName("testName123");
    client.setClientId("testClientId123");
    client.setClientSecret("testClientSecret123".getBytes());
    client.setAuthorizationUrl("testAuthUrl123");
    client.setTokenUrl("testTokenUrl123");
    client.setType(Type.UNKNOWN);
    client.setGrantType("testGrantType123");
    client.setClientAuthenticationType("testAuthentication123");
    client.setAllowModuleOverride(false);
    client.setAuthorizationHeader(true);
    client.setUrlParameter(false);
    client.setRedirectUri("testRedirectUrl123");
    servlet.getOAuth2Store().addUserService("testID", "testName123", client);
    
    expect(req.getPathInfo()).andReturn("/oauth2");
    expect(resp.getWriter()).andReturn(writer);
    expect(req.getParameter("name")).andReturn("testName123");
    
    replay(req);
    replay(resp);
    replay(authority);
    replay(st);
    
    servlet.doDelete(req, resp);
    JSONObject testReturn = new JSONObject();
    testReturn.put("oauth", new JSONArray());
    testReturn.put("oauth2", new JSONArray());
    
    assertEquals(testReturn, new JSONObject(getWriterOutput()));
  }
  
  private String getWriterOutput() throws UnsupportedEncodingException {
    writer.close();
    return stream.toString("UTF-8");
  }
}
