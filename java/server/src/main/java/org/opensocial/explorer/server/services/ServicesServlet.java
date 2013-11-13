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

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.shindig.auth.AuthenticationHandler;
import org.apache.shindig.auth.AuthenticationHandler.InvalidAuthenticationException;
import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.auth.UrlParameterAuthenticationHandler;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret;
import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret.KeyType;
import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.server.oauth.OSEOAuthStore;
import org.opensocial.explorer.server.oauth.OSEOAuthStoreProvider;
import org.opensocial.explorer.server.openid.OpenIDServlet;
import org.opensocial.explorer.specserver.servlet.ExplorerInjectedServlet;

import com.google.caja.util.Maps;
import com.google.inject.Inject;
import com.google.inject.name.Named;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * A servlet that handles requests for services
 */
public class ServicesServlet extends ExplorerInjectedServlet {
  private static final long serialVersionUID = -5185591095912083066L;
  private static final String CLASS = OpenIDServlet.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  private AuthenticationHandler handler;
  private OSEOAuthStore serviceStore;
  private Authority authority;
  private String contextRoot;
  
  
  @Inject
  public void injectDependencies(UrlParameterAuthenticationHandler handler, 
                                 OSEOAuthStoreProvider storeProvider,
                                 Authority authority,
                                 @Named("shindig.contextroot") String contextRoot) {
    this.handler = handler;
    this.serviceStore = storeProvider.get();
    this.authority = authority;
    this.contextRoot = contextRoot;
  }
  
  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    final String method = "doPost";
    try {
      SecurityToken token = this.handler.getSecurityTokenFromRequest(req);
      String id = token.getOwnerId();
      String key = req.getParameter("key");
      String secret = req.getParameter("secret");
      String name = req.getParameter("name");
      String callbackUrl = req.getParameter("callbackUrl")
          .replaceAll("%origin%", authority.getOrigin())
          .replaceAll("%contextRoot%", this.contextRoot);
      String keyTypeStr = req.getParameter("keyType");
      KeyType keyType;

      if(keyTypeStr.equals("HMAC_SYMMETRIC")) {
        keyType = KeyType.HMAC_SYMMETRIC;
      } else if (keyTypeStr.equals("RSA_PRIVATE")) {
        keyType = KeyType.RSA_PRIVATE;
      } else {
        keyType = KeyType.PLAINTEXT;
      }

      BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret(key, secret, keyType, name, callbackUrl);
      Map<String, Map<String, BasicOAuthStoreConsumerKeyAndSecret>> userStore = this.serviceStore.getUserStore();

      if(userStore.containsKey(id)) {
        this.serviceStore.getNameStore(id).put(name, kas);
      } else {
        userStore.put(id, new HashMap<String, BasicOAuthStoreConsumerKeyAndSecret>());
        userStore.get(id).put(name, kas);
      }

      doGet(req, resp);
      resp.setStatus(HttpServletResponse.SC_OK);
    } catch (InvalidAuthenticationException e) {
      LOG.logp(Level.WARNING, CLASS, method, e.getMessage(), e);
    }
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    final String method = "doGet";
    try {
      SecurityToken token = this.handler.getSecurityTokenFromRequest(req);
      String id = token.getOwnerId();
      JSONArray array = new JSONArray();

      if(this.serviceStore.getUserStore().containsKey(id)) {
        Map<String, BasicOAuthStoreConsumerKeyAndSecret> userMap = this.serviceStore.getNameStore(id);
        for (String key : userMap.keySet()) {
          BasicOAuthStoreConsumerKeyAndSecret kas = userMap.get(key);
          JSONObject service = new JSONObject();
          service.put("key", kas.getConsumerKey());
          service.put("secret", kas.getConsumerSecret());
          service.put("name", kas.getKeyName());
          service.put("keyType", kas.getKeyType().toString());
          service.put("callbackUrl", kas.getCallbackUrl());
          array.add(service);
        }
      }
      resp.setContentType(JSON_CONTENT_TYPE);
      PrintWriter writer = resp.getWriter();
      writer.print(array.toString());
    } catch (InvalidAuthenticationException e) {
      LOG.logp(Level.WARNING, CLASS, method, e.getMessage(), e);
    } catch (JSONException e) {
      LOG.logp(Level.WARNING, CLASS, method, e.getMessage(), e);
    }
  }
  
  @Override
  protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    final String method = "doDelete";
    try {
      SecurityToken token = this.handler.getSecurityTokenFromRequest(req);
      String id = token.getOwnerId();
      String name = req.getParameter("name");
      Map<String, BasicOAuthStoreConsumerKeyAndSecret> userMap = this.serviceStore.getNameStore(id);
      
      userMap.remove(name);
      doGet(req, resp);
      
      resp.setStatus(HttpServletResponse.SC_OK);
    } catch (InvalidAuthenticationException e) {
      LOG.logp(Level.WARNING, CLASS, method, e.getMessage(), e);
    }
  }
}
