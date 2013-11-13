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
package org.opensocial.explorer.server.login;

import static org.easymock.EasyMock.*;
import static org.junit.Assert.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shindig.auth.SecurityTokenCodec;
import org.apache.shindig.auth.SecurityTokenException;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.gadgets.GadgetException;
import org.apache.shindig.gadgets.http.HttpFetcher;
import org.apache.shindig.gadgets.http.HttpRequest;
import org.apache.shindig.gadgets.http.HttpResponse;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.easymock.PowerMock;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.json.jackson2.JacksonFactory;

@PrepareForTest({HttpResponse.class, GoogleIdToken.class, GoogleIdToken.Payload.class})
@RunWith(PowerMockRunner.class)
public class GoogleLoginServletTest {

  private GoogleLoginServlet servlet;
  private HttpServletRequest req;
  private HttpServletResponse resp;
  private HttpFetcher fetcher;
  private SecurityTokenCodec codec;
  private Authority authority;
  private ByteArrayOutputStream stream = new ByteArrayOutputStream();
  private PrintWriter writer = new PrintWriter(stream);
  
  @Before
  public void setUp() throws Exception {
    servlet = new GoogleLoginServlet();
    req = createMock(HttpServletRequest.class);
    resp = createMock(HttpServletResponse.class);
    fetcher = createMock(HttpFetcher.class);
    codec = createMock(SecurityTokenCodec.class);
    authority = createMock(Authority.class);
    
    servlet.injectDependencies(fetcher, codec, "contextRoot");
    
    expect(authority.getOrigin()).andReturn("");
    replay(authority);
    servlet.injectDependencies("clientId", "clientSecret", "redirectUri", authority);
    
  }

  @After
  public void tearDown() throws Exception {
    // Verify
    verify(req);
    verify(resp);
    verify(authority);
  }
  
  @Test
  public void testDoGetInvalid() throws Exception {
    expect(req.getPathInfo()).andReturn(null);
    resp.sendError(HttpServletResponse.SC_NOT_FOUND,
        "Path must be one of \"googleLogin/popup\" or \"googleLogin/token\"");
    expectLastCall();
    
    replay(req);
    replay(resp);
    
    servlet.doGet(req, resp);
  }
  
  @Test
  public void testDoGetRedirect() throws Exception {
    expect(req.getPathInfo()).andReturn("/popup");
    resp.sendRedirect("https://accounts.google.com/o/oauth2/auth?redirect_uri=redirectUri&client_id=clientId&response_type=code&scope=https://www.googleapis.com/auth/userinfo.profile&approval_prompt=force");
    expectLastCall();
    
    replay(req);
    replay(resp);
    
    servlet.doGet(req, resp);
  }
  
  @Test
  public void testDoGetCallBackDeclined() throws Exception {
    expect(req.getPathInfo()).andReturn("/token");
    expect(req.getParameter("error")).andReturn("user_declined");
    resp.setContentType("text/html"); expectLastCall();
    expect(resp.getWriter()).andReturn(writer);

    replay(req);
    replay(resp);
    
    servlet.doGet(req, resp);
    
    assertEquals("<html>" +
                   "<head>" +
                     "<script type='text/javascript'>window.close();</script>" +
                   "</head>" +
                   "<body></body>" +
                 "</html>", 
                 getWriterOutput());
  }
  
  @Test
  public void testDoGetCallBackAccepted() throws Exception {
    expect(req.getPathInfo()).andReturn("/token");
    expect(req.getParameter("error")).andReturn(null);
    expect(req.getParameter("code")).andReturn("abc123");
    resp.setContentType("text/html"); expectLastCall();
    expect(resp.getWriter()).andReturn(writer);
    
    HttpResponse googleResponse = PowerMock.createMock(HttpResponse.class);
    expect(fetcher.fetch(isA(HttpRequest.class))).andReturn(googleResponse);  
    expect(googleResponse.getResponse()).andReturn(new ByteArrayInputStream("{\"id_token\":\"mocktoken123\"}".getBytes("UTF-8")));
    
    PowerMock.mockStatic(GoogleIdToken.class);
    GoogleIdToken mockIdToken = createMock(GoogleIdToken.class);
    expect(GoogleIdToken.parse(isA(JacksonFactory.class), eq("mocktoken123"))).andReturn(mockIdToken);
    
    GoogleIdToken.Payload mockPayload = PowerMock.createMock(GoogleIdToken.Payload.class);
    expect(mockIdToken.getPayload()).andReturn(mockPayload);
    expect(mockPayload.getSubject()).andReturn("userId123");
    expect(mockPayload.getIssuer()).andReturn("accounts.google.com");
    expect(mockPayload.getAudience()).andReturn("clientId");
    
    expect(codec.encodeToken(isA(LoginSecurityToken.class))).andReturn("mockTokenString123");
    expect(codec.getTokenTimeToLive(isA(String.class))).andReturn(123);
    
    PowerMock.replay(googleResponse);
    replay(fetcher);
    replay(req);
    replay(resp);
    PowerMock.replay(GoogleIdToken.class);
    replay(mockIdToken);
    replay(mockPayload);
    replay(codec);
    
    servlet.doGet(req, resp);
    
    PowerMock.verify(googleResponse);
    verify(fetcher);
    PowerMock.verify(GoogleIdToken.class);
    verify(mockIdToken);
    verify(mockPayload);
    verify(codec);
    
    assertEquals("<html>" +
                   "<head>" +
                     "<script type='text/javascript'>" +
                       "var evt = document.createEvent('Event');" +
                       "evt.initEvent('returnSecurityToken', true, true);" +
                       "document.responseObj = {\"securityTokenTTL\":123,\"securityToken\":\"mockTokenString123\"};" +
                       "window.opener.document.dispatchEvent(evt);" +
                     "</script>" +
                   "</head>" +
                   "<body></body>" +
                 "</html>", getWriterOutput());
  }
  
  @Test
  public void testDoGetCallBackNullPointerException() throws Exception {
    expect(req.getPathInfo()).andReturn("/token");
    expect(req.getParameter("error")).andReturn(null);
    
    servlet.clientId = null;
    
    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Missing app client metadata.");
    expectLastCall();
    
    replay(req);
    replay(resp);
    
    servlet.doGet(req, resp);
  } 
  
  
  @Test
  public void testDoGetCallBackGadgetException() throws Exception {
    expect(req.getPathInfo()).andReturn("/token");
    expect(req.getParameter("error")).andReturn(null);
    expect(req.getParameter("code")).andReturn("abc123");

    expect(fetcher.fetch(isA(HttpRequest.class))).andThrow(new GadgetException(GadgetException.Code.INTERNAL_SERVER_ERROR,
        HttpServletResponse.SC_INTERNAL_SERVER_ERROR));  

    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error making POST request.");
    expectLastCall();
    
    replay(fetcher);
    replay(req);
    replay(resp);
    
    servlet.doGet(req, resp);
    
    verify(fetcher);
  } 
  
  
  @Test
  public void testDoGetCallBackJsonException() throws Exception {
    expect(req.getPathInfo()).andReturn("/token");
    expect(req.getParameter("error")).andReturn(null);
    expect(req.getParameter("code")).andReturn("abc123");
    
    HttpResponse googleResponse = createMock(HttpResponse.class);
    
    expect(fetcher.fetch(isA(HttpRequest.class))).andReturn(googleResponse);  
    expect(googleResponse.getResponse()).andReturn(new ByteArrayInputStream("lols_not_a_json".getBytes("UTF-8")));

    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing JSON response.");
    expectLastCall();
    
    replay(googleResponse);
    replay(fetcher);
    replay(req);
    replay(resp);
    
    servlet.doGet(req, resp);
    
    verify(googleResponse);
    verify(fetcher);
  }
  
  
  @Test
  public void testDoGetCallBackSecurityTokenException() throws Exception {
    expect(req.getPathInfo()).andReturn("/token");
    expect(req.getParameter("error")).andReturn(null);
    expect(req.getParameter("code")).andReturn("abc123");
    resp.setContentType("text/html"); expectLastCall();
    
    HttpResponse googleResponse = PowerMock.createMock(HttpResponse.class);
    expect(fetcher.fetch(isA(HttpRequest.class))).andReturn(googleResponse);  
    expect(googleResponse.getResponse()).andReturn(new ByteArrayInputStream("{\"id_token\":\"mocktoken123\"}".getBytes("UTF-8")));
    
    PowerMock.mockStatic(GoogleIdToken.class);
    GoogleIdToken mockIdToken = createMock(GoogleIdToken.class);
    expect(GoogleIdToken.parse(isA(JacksonFactory.class), eq("mocktoken123"))).andReturn(mockIdToken);
    
    GoogleIdToken.Payload mockPayload = PowerMock.createMock(GoogleIdToken.Payload.class);
    expect(mockIdToken.getPayload()).andReturn(mockPayload);
    expect(mockPayload.getSubject()).andReturn("userId123");
    expect(mockPayload.getIssuer()).andReturn("accounts.google.com");
    expect(mockPayload.getAudience()).andReturn("clientId");
    
    expect(codec.encodeToken(isA(LoginSecurityToken.class))).andThrow(new SecurityTokenException("Bad Security Token"));
    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error generating security token.");
    expectLastCall();
    
    PowerMock.replay(googleResponse);
    replay(fetcher);
    replay(req);
    replay(resp);
    PowerMock.replay(GoogleIdToken.class);
    replay(mockIdToken);
    replay(mockPayload);
    replay(codec);
    
    servlet.doGet(req, resp);
    
    PowerMock.verify(googleResponse);
    verify(fetcher);
    PowerMock.verify(GoogleIdToken.class);
    verify(mockIdToken);
    verify(mockPayload);
    verify(codec);
  }
  
  @Test
  public void testDoGetCallBackIllegalException() throws Exception {
    expect(req.getPathInfo()).andReturn("/token");
    expect(req.getParameter("error")).andReturn(null);
    expect(req.getParameter("code")).andReturn("abc123");
    
    HttpResponse googleResponse = createMock(HttpResponse.class);
    
    expect(fetcher.fetch(isA(HttpRequest.class))).andReturn(googleResponse);  
    expect(googleResponse.getResponse()).andReturn(new ByteArrayInputStream("{error: \"invalid_request\"}".getBytes("UTF-8")));

    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error making token request.");
    expectLastCall();
    
    replay(googleResponse);
    replay(fetcher);
    replay(req);
    replay(resp);
    
    servlet.doGet(req, resp);
    
    verify(googleResponse);
    verify(fetcher);
  } 
  
  private String getWriterOutput() throws UnsupportedEncodingException {
    writer.close();
    return stream.toString("UTF-8");
  }
}
