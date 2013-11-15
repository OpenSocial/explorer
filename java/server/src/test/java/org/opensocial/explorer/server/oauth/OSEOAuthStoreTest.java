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
package org.opensocial.explorer.server.oauth;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;
import net.oauth.OAuth;
import net.oauth.OAuthServiceProvider;
import net.oauth.signature.RSA_SHA1;

import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.gadgets.GadgetException;
import org.apache.shindig.gadgets.oauth.OAuthStore.ConsumerInfo;
import org.apache.shindig.gadgets.oauth.OAuthStore.TokenInfo;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class OSEOAuthStoreTest {
  
  private OSEOAuthStore store;

  private JSONObject createService(String consumerKey, String consumerSecret, String keyType, String callbackUrl) throws JSONException {
    JSONObject service = new JSONObject();
    service.put("consumer_key", consumerKey);
    service.put("consumer_secret", consumerSecret);
    service.put("key_type", keyType);
    service.put("callback_url", callbackUrl);
    return service;
  }
  
  private JSONObject createSampleServiceOne() throws JSONException {
    return createService("key1", "secret1", "HMAC_SYMMETRIC", "http://example.com/callback1");
  }
  
  private JSONObject createSampleServiceTwo() throws JSONException {
    return createService("key2", "secret2", "RSA_PRIVATE", "http://example.com/callback2");
  }
  
  private JSONObject createSampleServiceThree() throws JSONException {
    return createService("key3", "secret3", "PLAINTEXT", "http://example.com/callback3");
  }
  
  private JSONObject createSampleServiceDefault() throws JSONException {
    return createService("keydefault", "secretdefault", "HMAC_SYMMETRIC", null);
  }
  
  private JSONObject createSampleServiceAuthority() throws JSONException {
    return createService("keyauthority", "secretauthority", "HMAC_SYMMETRIC", "%authority%/callback");
  }
  
  private SecurityToken createSecurityTokenMock(String viewerId) {
    SecurityToken st = createMock(SecurityToken.class);
    expect(st.getViewerId()).andReturn(viewerId).anyTimes();
    replay(st);
    return st;
  }
  
  private JSONObject createConfig() throws JSONException {
    JSONObject config = new JSONObject();
    config.put("service1", createSampleServiceOne());
    config.put("service2", createSampleServiceTwo());
    config.put("service3", createSampleServiceThree());
    config.put("servicedefault", createSampleServiceDefault());
    config.put("serviceauthority", createSampleServiceAuthority());
    return config;
    
  }
  
  private Authority createAuthorityMock() {
    Authority mockAuthority = createMock(Authority.class);
    expect(mockAuthority.getAuthority()).andReturn("http://example.com").anyTimes();
    expect(mockAuthority.getOrigin()).andReturn("mockOrigin").anyTimes();
    replay(mockAuthority);
    return mockAuthority;
  }

  @Before
  public void setUp() throws Exception {
    this.store = new OSEOAuthStore();
    this.store.setDefaultCallbackUrl("http://example.com/default");
    this.store.setAuthority(createAuthorityMock());
    
  }

  @After
  public void tearDown() throws Exception {
    this.store = null;
  }

  @Test
  public void testInit() throws Exception {
    store.init(createConfig().toString());
    ConsumerInfo info = store.getConsumerKeyAndSecret(createMock(SecurityToken.class), "service1", createMock(OAuthServiceProvider.class));
    assertEquals("http://example.com/callback1", info.getCallbackUrl());
    info = store.getConsumerKeyAndSecret(createMock(SecurityToken.class), "service2", createMock(OAuthServiceProvider.class));
    assertEquals("http://example.com/callback2", info.getCallbackUrl());
  }

  @Test
  public void testGetConsumerKeyAndSecret() throws Exception {
    store.init(createConfig().toString());
    ConsumerInfo info = store.getConsumerKeyAndSecret(createMock(SecurityToken.class), "service1", createMock(OAuthServiceProvider.class));
    assertEquals("http://example.com/callback1", info.getCallbackUrl());
    assertEquals(OAuth.HMAC_SHA1, info.getConsumer().getProperty(OAuth.OAUTH_SIGNATURE_METHOD));
    info = store.getConsumerKeyAndSecret(createMock(SecurityToken.class), "service2", createMock(OAuthServiceProvider.class));
    assertEquals("http://example.com/callback2", info.getCallbackUrl());
    assertEquals(OAuth.RSA_SHA1, info.getConsumer().getProperty(OAuth.OAUTH_SIGNATURE_METHOD));
    assertEquals("secret2", info.getConsumer().getProperty(RSA_SHA1.PRIVATE_KEY));
    info = store.getConsumerKeyAndSecret(createMock(SecurityToken.class), "service3", createMock(OAuthServiceProvider.class));
    assertEquals("http://example.com/callback3", info.getCallbackUrl());
    assertEquals("PLAINTEXT", info.getConsumer().getProperty(OAuth.OAUTH_SIGNATURE_METHOD));
  }
  
  @Test(expected = GadgetException.class)
  public void testNoKeyAndSecret() throws Exception {
    store.init(createConfig().toString());
    store.getConsumerKeyAndSecret(createMock(SecurityToken.class), "service4", createMock(OAuthServiceProvider.class));
  }

  @Test
  public void testGetAndSetTokenInfo() throws Exception {
    TokenInfo info = new TokenInfo("accessToken1", "tokenSecret1", "sessionHandle1", 1000L);
    SecurityToken st = createSecurityTokenMock("viewer1");
    store.setTokenInfo(st, createMock(ConsumerInfo.class), "service1", "token1", info);
    assertEquals(info, store.getTokenInfo(st, createMock(ConsumerInfo.class), "service1", "token1"));
    assertNull(store.getTokenInfo(st, createMock(ConsumerInfo.class), "service2", "token2"));
  }

  @Test
  public void testRemoveToken() throws Exception {
    TokenInfo info = new TokenInfo("accessToken1", "tokenSecret1", "sessionHandle1", 1000L);
    SecurityToken st = createSecurityTokenMock("viewer1");
    store.setTokenInfo(st, createMock(ConsumerInfo.class), "service1", "token1", info);
    assertEquals(info, store.getTokenInfo(st, createMock(ConsumerInfo.class), "service1", "token1"));
    store.removeToken(st, createMock(ConsumerInfo.class), "service1", "token1");
    assertNull(store.getTokenInfo(st, createMock(ConsumerInfo.class), "service1", "token1"));
  }

  @Test
  public void testSetDefaultCallbackUrl() throws Exception {
    store.init(createConfig().toString());
    ConsumerInfo info = store.getConsumerKeyAndSecret(createMock(SecurityToken.class), "servicedefault", createMock(OAuthServiceProvider.class));
    assertEquals("http://example.com/default", info.getCallbackUrl());
  }

  @Test
  public void testSetAuthority() throws Exception {
    store.init(createConfig().toString());
    ConsumerInfo info = store.getConsumerKeyAndSecret(createMock(SecurityToken.class), "serviceauthority", createMock(OAuthServiceProvider.class));
    assertEquals("http://example.com/callback", info.getCallbackUrl());
  }

}

