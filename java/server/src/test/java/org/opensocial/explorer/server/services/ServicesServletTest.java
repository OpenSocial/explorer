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

import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.auth.UrlParameterAuthenticationHandler;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret;
import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret.KeyType;
import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.opensocial.explorer.server.oauth.NoSuchStoreException;
import org.opensocial.explorer.server.oauth.OSEOAuthStore;
import org.opensocial.explorer.server.oauth.OSEOAuthStoreProvider;

public class ServicesServletTest {

  private ServicesServlet servlet;
  private HttpServletRequest req;
  private HttpServletResponse resp;
  private UrlParameterAuthenticationHandler handler;
  private Authority authority;
  private OSEOAuthStoreProvider storeProvider;
  private SecurityToken st;
  private OSEOAuthStore store;
  private ByteArrayOutputStream stream = new ByteArrayOutputStream();
  private PrintWriter writer = new PrintWriter(stream);
  
  @Before
  public void setUp() throws Exception {
    servlet = new ServicesServlet();
    store = new OSEOAuthStore();
    req = createMock(HttpServletRequest.class);
    resp = createNiceMock(HttpServletResponse.class);
    authority = createMock(Authority.class);
    handler = createMock(UrlParameterAuthenticationHandler.class);
    storeProvider = createMock(OSEOAuthStoreProvider.class);
    st = createMock(SecurityToken.class);
    
    expect(handler.getSecurityTokenFromRequest(req)).andReturn(st);
    expect(st.getOwnerId()).andReturn("testID");
    
    expect(storeProvider.get()).andReturn(store);
    replay(storeProvider);
    servlet.injectDependencies(handler, storeProvider, authority, "testContextRoot/");
  }

  @After
  public void tearDown() throws Exception {
    // Verify
    verify(req);
    verify(resp);
    verify(storeProvider);
    verify(handler);
    verify(authority);
    verify(storeProvider);
    verify(st);
  }
  
  @Test
  public void testDoGetEmpty() throws Exception {
    expect(resp.getWriter()).andReturn(writer);
    
    replay(req);
    replay(resp);
    replay(handler);
    replay(authority);
    replay(st);
    
    servlet.doGet(req, resp);
    
    JSONArray testReturn = new JSONArray();
    assertEquals(testReturn, new JSONArray(getWriterOutput()));
  } 
  
  @Test
  public void testDoGetExisting() throws Exception {
    BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret("testKey", "testSecret", KeyType.HMAC_SYMMETRIC, "testName", "testCallbackUrl");
    HashMap<String, BasicOAuthStoreConsumerKeyAndSecret> userEntry = new HashMap<String, BasicOAuthStoreConsumerKeyAndSecret>();
    userEntry.put("testService", kas);
    servlet.getServiceStore().getUserStore().put("testID", userEntry);

    expect(resp.getWriter()).andReturn(writer);
    
    replay(req);
    replay(resp);
    replay(handler);
    replay(authority);
    replay(st);
    
    servlet.doGet(req, resp);
    
    JSONArray testReturn = new JSONArray();
    JSONObject testService = new JSONObject();
      testService.put("key", "testKey");
      testService.put("secret", "testSecret");
      testService.put("name", "testName");
      testService.put("callbackUrl", "testCallbackUrl");
      testService.put("keyType", "HMAC_SYMMETRIC");
    testReturn.add(testService);
    
    assertEquals(testReturn, new JSONArray(getWriterOutput()));
  } 
  
  @Test
  public void testDoPostEmpty() throws Exception {
    expect(resp.getWriter()).andReturn(writer);
    expect(authority.getOrigin()).andReturn("testOrigin/");
    expect(req.getParameter("key")).andReturn("testKey");
    expect(req.getParameter("secret")).andReturn("testSecret");
    expect(req.getParameter("name")).andReturn("testName");
    expect(req.getParameter("callbackUrl")).andReturn("%origin%%contextRoot%testCallbackUrl");
    expect(req.getParameter("keyType")).andReturn("HMAC_SYMMETRIC");
    
    replay(req);
    replay(resp);
    replay(handler);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
    
    JSONArray testReturn = new JSONArray();
    JSONObject testService = new JSONObject();
      testService.put("key", "testKey");
      testService.put("secret", "testSecret");
      testService.put("name", "testName");
      testService.put("callbackUrl", "testOrigin/testContextRoot/testCallbackUrl");
      testService.put("keyType", "HMAC_SYMMETRIC");
    testReturn.add(testService);
    
    assertEquals(testReturn, new JSONArray(getWriterOutput()));
  }
  
  @Test
  public void testDoPostOverwrite() throws Exception {
    BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret("testKey2", "testSecret2", KeyType.HMAC_SYMMETRIC, "testName2", "testCallbackUrl2");
    HashMap<String, BasicOAuthStoreConsumerKeyAndSecret> userEntry = new HashMap<String, BasicOAuthStoreConsumerKeyAndSecret>();
    userEntry.put("testName", kas);
    servlet.getServiceStore().getUserStore().put("testID", userEntry);

    expect(resp.getWriter()).andReturn(writer);
    expect(authority.getOrigin()).andReturn("testOrigin/");
    expect(req.getParameter("key")).andReturn("testKey");
    expect(req.getParameter("secret")).andReturn("testSecret");
    expect(req.getParameter("name")).andReturn("testName");
    expect(req.getParameter("callbackUrl")).andReturn("%origin%%contextRoot%testCallbackUrl");
    expect(req.getParameter("keyType")).andReturn("HMAC_SYMMETRIC");
    
    replay(req);
    replay(resp);
    replay(handler);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
    
    JSONArray testReturn = new JSONArray();
    JSONObject testService = new JSONObject();
      testService.put("key", "testKey");
      testService.put("secret", "testSecret");
      testService.put("name", "testName");
      testService.put("callbackUrl", "testOrigin/testContextRoot/testCallbackUrl");
      testService.put("keyType", "HMAC_SYMMETRIC");
    testReturn.add(testService);
    
    assertEquals(testReturn, new JSONArray(getWriterOutput()));
  }
  
  @Test
  public void testDoPostAdd() throws Exception {
    BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret("testKey2", "testSecret2", KeyType.HMAC_SYMMETRIC, "testName2", "testCallbackUrl2");
    HashMap<String, BasicOAuthStoreConsumerKeyAndSecret> userEntry = new HashMap<String, BasicOAuthStoreConsumerKeyAndSecret>();
    userEntry.put("testName2", kas);
    servlet.getServiceStore().getUserStore().put("testID", userEntry);

    expect(resp.getWriter()).andReturn(writer);
    expect(authority.getOrigin()).andReturn("testOrigin/");
    expect(req.getParameter("key")).andReturn("testKey");
    expect(req.getParameter("secret")).andReturn("testSecret");
    expect(req.getParameter("name")).andReturn("testName");
    expect(req.getParameter("callbackUrl")).andReturn("%origin%%contextRoot%testCallbackUrl");
    expect(req.getParameter("keyType")).andReturn("HMAC_SYMMETRIC");
    
    replay(req);
    replay(resp);
    replay(handler);
    replay(authority);
    replay(st);
    
    servlet.doPost(req, resp);
    
    JSONArray testReturn = new JSONArray();
    JSONObject testService = new JSONObject();
      testService.put("key", "testKey");
      testService.put("secret", "testSecret");
      testService.put("name", "testName");
      testService.put("callbackUrl", "testOrigin/testContextRoot/testCallbackUrl");
      testService.put("keyType", "HMAC_SYMMETRIC");
    JSONObject testService2 = new JSONObject();
      testService2.put("key", "testKey2");
      testService2.put("secret", "testSecret2");
      testService2.put("name", "testName2");
      testService2.put("callbackUrl", "testCallbackUrl2");
      testService2.put("keyType", "HMAC_SYMMETRIC");
    testReturn.add(testService);
    testReturn.add(testService2);
    
    assertEquals(testReturn, new JSONArray(getWriterOutput()));
  }
  
  @Test
  public void testDoDeleteEmpty() throws Exception {
    expect(req.getParameter("name")).andReturn("testName");
    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "The store corresponding to the user's data we are trying to get doesn't exist!");
    expectLastCall();
    
    replay(req);
    replay(resp);
    replay(handler);
    replay(authority);
    replay(st);
    
    servlet.doDelete(req, resp);
  }
  
  
  @Test
  public void testDoDelete() throws Exception {
    BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret("testKey", "testSecret", KeyType.HMAC_SYMMETRIC, "testName", "testCallbackUrl");
    HashMap<String, BasicOAuthStoreConsumerKeyAndSecret> userEntry = new HashMap<String, BasicOAuthStoreConsumerKeyAndSecret>();
    userEntry.put("testName", kas);
    servlet.getServiceStore().getUserStore().put("testID", userEntry);

    expect(resp.getWriter()).andReturn(writer);
    expect(req.getParameter("name")).andReturn("testName");
    
    replay(req);
    replay(resp);
    replay(handler);
    replay(authority);
    replay(st);
    
    servlet.doDelete(req, resp);
    
    JSONArray testReturn = new JSONArray();
    
    assertEquals(testReturn, new JSONArray(getWriterOutput()));
  }
  
  private String getWriterOutput() throws UnsupportedEncodingException {
    writer.close();
    return stream.toString("UTF-8");
  }
  
}
