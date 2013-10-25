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
package org.opensocial.explorer.server.openid;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.eq;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.verify;
import static org.easymock.EasyMock.replay;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.shindig.common.servlet.Authority;
import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openid4java.association.AssociationException;
import org.openid4java.consumer.ConsumerException;
import org.openid4java.consumer.ConsumerManager;
import org.openid4java.consumer.VerificationResult;
import org.openid4java.discovery.DiscoveryException;
import org.openid4java.discovery.DiscoveryInformation;
import org.openid4java.discovery.Identifier;
import org.openid4java.message.AuthRequest;
import org.openid4java.message.AuthSuccess;
import org.openid4java.message.MessageException;
import org.openid4java.message.ParameterList;
import org.openid4java.message.ax.AxMessage;
import org.openid4java.message.ax.FetchRequest;
import org.openid4java.message.ax.FetchResponse;
import org.openid4java.message.sreg.SRegMessage;
import org.openid4java.message.sreg.SRegRequest;
import org.openid4java.message.sreg.SRegResponse;

import com.google.caja.util.Lists;
import com.google.caja.util.Maps;

public class OpenIDConsumerTest {
  
  private OpenIDConsumer consumer;
  private ConsumerManager mockManager;
  private Authority mockAuthority;

  @Before
  public void setUp() throws Exception {
    mockManager = EasyMock.createMock(ConsumerManager.class);
    mockAuthority = EasyMock.createMock(Authority.class);
    EasyMock.expect(mockAuthority.getOrigin()).andReturn("http://example.com:80");
    EasyMock.expect(mockAuthority.getAuthority()).andReturn("example.com:80");
    EasyMock.expect(mockAuthority.getScheme()).andReturn("http");
    EasyMock.replay(mockAuthority);
  }

  @After
  public void tearDown() throws Exception {
    mockManager = null;
    mockAuthority = null;
    consumer = null;
  }
  
  
  private HttpSession createMockSession(DiscoveryInformation info, boolean emailFromFetch, boolean emailFromSReg,
          boolean openIdDisc) {
    HttpSession session = createMock(HttpSession.class);
    if(openIdDisc) {
      session.setAttribute(eq("openid-disc"), anyObject(DiscoveryInformation.class));
    }
    session.setAttribute(eq("openid_identifier"), eq("id"));
    expect(session.getAttribute("openid-disc")).andReturn(info);
    if(emailFromFetch) {
      session.setAttribute(eq("emailFromFetch"), eq("john@example.com"));
    }
    if(emailFromSReg) {
      session.setAttribute(eq("emailFromSReg"), eq("john@example.com"));
    }
    replay(session);
    return session;
  }
  
  private HttpServletRequest createMockRequest(HttpSession session) {
    HttpServletRequest req = createMock(HttpServletRequest.class);
    expect(req.getSession()).andReturn(session);
    expect(req.getSession(eq(true))).andReturn(session);
    expect(req.getParameterMap()).andReturn(Maps.newHashMap());
    expect(req.getRequestURL()).andReturn(new StringBuffer("http://example.com/request"));
    expect(req.getQueryString()).andReturn("query");
    replay(req);
    return req;
  }
  
  private HttpServletResponse createMockResponse() throws IOException {
    HttpServletResponse resp = createMock(HttpServletResponse.class);
    resp.sendRedirect("http://example.com/redirect");
    replay(resp);
    return resp;
  }
  
  private DiscoveryInformation createMockInfo() {
    DiscoveryInformation info = createMock(DiscoveryInformation.class);
    replay(info);
    return info;
  }
  
  private AuthRequest createMockAuthRequest() throws MessageException {
    AuthRequest authRequest = createMock(AuthRequest.class);
    authRequest.addExtension(anyObject(FetchRequest.class));
    authRequest.addExtension(anyObject(SRegRequest.class));
    expect(authRequest.getDestinationUrl(true)).andReturn("http://example.com/redirect");
    replay(authRequest);
    return authRequest;
  }
  
  private FetchResponse createMockFetchResponse() {
    FetchResponse response = createMock(FetchResponse.class);
    expect(response.getAttributeValues("email")).andReturn(Lists.newArrayList("john@example.com"));
    replay(response);
    return response;
  }
  
  private SRegResponse createRegResponse() {
    SRegResponse response = createMock(SRegResponse.class);
    expect(response.getAttributeValue("email")).andReturn("john@example.com");
    replay(response);
    return response;
  }
  
  private VerificationResult createMockVerificationResult(Identifier id, AuthSuccess authSuccess) {
    VerificationResult result = createMock(VerificationResult.class);
    expect(result.getVerifiedId()).andReturn(id);
    expect(result.getAuthResponse()).andReturn(authSuccess);
    replay(result);
    return result;
  }
  
  private AuthSuccess createMockAuthSuccess(FetchResponse fetchResponse, SRegResponse regResponse,
          boolean hasAXMessage, boolean hasSReg) throws MessageException {
    AuthSuccess authSuccess = createMock(AuthSuccess.class);
    expect(authSuccess.getIdentity()).andReturn("id");
    expect(authSuccess.hasExtension(eq(AxMessage.OPENID_NS_AX))).andReturn(hasAXMessage);
    expect(authSuccess.hasExtension(eq(SRegMessage.OPENID_NS_SREG))).andReturn(hasSReg);
    if(hasAXMessage) {
      expect(authSuccess.getExtension(eq(AxMessage.OPENID_NS_AX))).andReturn(fetchResponse);
    }
    if(hasSReg) {
      expect(authSuccess.getExtension(eq(SRegMessage.OPENID_NS_SREG))).andReturn(regResponse);
    }
    replay(authSuccess);
    return authSuccess;
  }
  
  private Identifier createMockIdentifier() {
    Identifier id = createMock(Identifier.class);
    replay(id);
    return id;
  }

  @Test
  public void testAuthRequest() throws IOException, MessageException, DiscoveryException, ConsumerException {
    DiscoveryInformation info = createMockInfo();
    HttpSession session = createMockSession(info, false, false, true);
    HttpServletRequest req = createMockRequest(session);
    HttpServletResponse resp = createMockResponse();

    AuthRequest authRequest = createMockAuthRequest();
    //TODO this should return a list of what?
    expect(mockManager.discover(eq("discover"))).andReturn(Lists.newArrayList());
    expect(mockManager.associate(anyObject(List.class))).andReturn(info);
    expect(mockManager.authenticate(eq(info), eq("http://example.com:80/openid/openidcallback"))).andReturn(authRequest);
    replay(mockManager);
    consumer = new OpenIDConsumer("%origin%/openid/openidcallback", mockManager, "mockContextRoot", mockAuthority);
    assertFalse(consumer.authRequest("discover", req, resp));
  }
  
  @Test(expected = RuntimeException.class)
  public void testAuthRequestIOException() throws IOException, MessageException, DiscoveryException, ConsumerException {
    DiscoveryInformation info = createMockInfo();
    HttpSession session = createMockSession(info, false, false, true);
    HttpServletRequest req = createMockRequest(session);
    HttpServletResponse resp = createMockResponse();

    AuthRequest authRequest = createMockAuthRequest();
    //TODO this should return a list of what?
    expect(mockManager.discover(eq("discover"))).andThrow(new IOException());
    expect(mockManager.associate(anyObject(List.class))).andReturn(info);
    expect(mockManager.authenticate(eq(info), eq("http://example.com:80/openid/openidcallback"))).andReturn(authRequest);
    replay(mockManager);
    consumer = new OpenIDConsumer("%origin%/openid/openidcallback", mockManager, "mockContextRoot", mockAuthority);
    assertFalse(consumer.authRequest("discover", req, resp));
  }

  @Test
  public void testVerifyResponse() throws IOException, MessageException, DiscoveryException, ConsumerException, AssociationException {
    DiscoveryInformation info = createMockInfo();
    HttpSession session = createMockSession(info, true, true, true);
    HttpServletRequest req = createMockRequest(session);

    AuthRequest authRequest = createMockAuthRequest();
    AuthSuccess authSuccess = createMockAuthSuccess(createMockFetchResponse(), createRegResponse(),
            true, true);
    Identifier id = createMockIdentifier();
    VerificationResult result = createMockVerificationResult(id, authSuccess);
    //TODO this should return a list of what?
    expect(mockManager.discover(eq("discover"))).andReturn(Lists.newArrayList());
    expect(mockManager.associate(anyObject(List.class))).andReturn(info);
    expect(mockManager.authenticate(eq(info), eq("http://example.com:80/openid/openidcallback"))).andReturn(authRequest);
    expect(mockManager.verify(eq("http://example.com/request?query"), anyObject(ParameterList.class), anyObject(DiscoveryInformation.class))).andReturn(result);
    replay(mockManager);
    consumer = new OpenIDConsumer("%origin%/openid/openidcallback", mockManager, "mockContextRoot", mockAuthority);
    assertEquals(id, consumer.verifyResponse(req));
  }
  
  @Test
  public void testVerifyResponseNullIdentifier() throws IOException, MessageException, DiscoveryException, ConsumerException, AssociationException {
    DiscoveryInformation info = createMockInfo();
    HttpSession session = createMockSession(info, false, false, true);
    HttpServletRequest req = createMockRequest(session);

    AuthRequest authRequest = createMockAuthRequest();
    AuthSuccess authSuccess = createMockAuthSuccess(createMockFetchResponse(), createRegResponse(),
            true, true);
    VerificationResult result = createMockVerificationResult(null, authSuccess);
    //TODO this should return a list of what?
    expect(mockManager.discover(eq("discover"))).andReturn(Lists.newArrayList());
    expect(mockManager.associate(anyObject(List.class))).andReturn(info);
    expect(mockManager.authenticate(eq(info), eq("http://example.com:80/openid/openidcallback"))).andReturn(authRequest);
    expect(mockManager.verify(eq("http://example.com/request?query"), anyObject(ParameterList.class), anyObject(DiscoveryInformation.class))).andReturn(result);
    replay(mockManager);
    consumer = new OpenIDConsumer("%origin%/openid/openidcallback", mockManager, "mockContextRoot", mockAuthority);
    assertNull(consumer.verifyResponse(req));
  }
  
  @Test
  public void testVerifyResponseNoEmail() throws IOException, MessageException, DiscoveryException, ConsumerException, AssociationException {
    DiscoveryInformation info = createMockInfo();
    HttpSession session = createMockSession(info, false, false, false);
    HttpServletRequest req = createMockRequest(session);

    AuthRequest authRequest = createMockAuthRequest();
    AuthSuccess authSuccess = createMockAuthSuccess(createMockFetchResponse(), createRegResponse(),
            false, false);
    Identifier id = createMockIdentifier();
    VerificationResult result = createMockVerificationResult(id, authSuccess);
    //TODO this should return a list of what?
    expect(mockManager.discover(eq("discover"))).andReturn(Lists.newArrayList());
    expect(mockManager.associate(anyObject(List.class))).andReturn(info);
    expect(mockManager.authenticate(eq(info), eq("http://example.com:80/openid/openidcallback"))).andReturn(authRequest);
    expect(mockManager.verify(eq("http://example.com/request?query"), anyObject(ParameterList.class), anyObject(DiscoveryInformation.class))).andReturn(result);
    replay(mockManager);
    consumer = new OpenIDConsumer("%origin%/openid/openidcallback", mockManager, "mockContextRoot", mockAuthority);
    assertEquals(id, consumer.verifyResponse(req));
    verify(authSuccess);
    verify(session);
  }

}

