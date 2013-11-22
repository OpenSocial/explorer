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

import org.apache.shindig.auth.AuthInfoUtil;
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
import org.opensocial.explorer.server.oauth.NoSuchStoreException;
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
 * A servlet that handles requests for services.
 * 
 * Services are information used by an OAuth gadget for authorization. A service has the following information:
 * Key, Secret, Name, Callback Url, and KeyType.
 * 
 * Services are stored in this servlet as a BasicOAuthStoreConsumerKeyAndSecret, which is in turn
 * stored in a nested Map data structure.
 * 
 * The first Map maps the userID to another map. This second map maps the name of the service to the
 * BasicOAuthStoreConsumerKeyAndSecret.
 * 
 * <pre>
 * GET /services
 * - Takes the ID from the SecurityToken string sent in the request and 
 * returns a stringified array of all the services that belong to the matching ID.
 * 
 * POST /services
 * - Creates a BasicOAuthStoreConsumerKeyAndSecret from the request parameters, which include:
 * Key, Secret, Name, Callback Url, and KeyType.
 * - Stores it in the Map under the ID taken from the SecurityToken.
 * - Returns an updated stringified array of all the services that belong to the matching ID.
 * 
 * DELETE /services
 * - Returns a list of OpenID providers supported by the server from which users can choose in order to login with OpenID
 * - Deletes the service that matches the ID from the SecurityToken and the service name. If there
 * is no matching user, we throw a NoSuchStoreException.
 * - Returns an updated stringified array of all the services that belong to the matching ID.
 * 
 * TODO: Add PUT option for editing an existing OAuth service.
 * 
 * The services returned in the array are stringified JSONObjects and have the same keys as the servlet request: 
 * Key, Secret, Name, Callback Url, and KeyType.
 * </pre>
 */
public class ServicesServlet extends ExplorerInjectedServlet {
  private static final long serialVersionUID = -5185591095912083066L;
  private static final String CLASS = ServicesServlet.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  private OSEOAuthStore serviceStore;
  private Authority authority;
  private String contextRoot;
  
  
  @Inject
  public void injectDependencies(OSEOAuthStoreProvider storeProvider,
                                 Authority authority,
                                 @Named("shindig.contextroot") String contextRoot) {
    this.serviceStore = storeProvider.get();
    this.authority = authority;
    this.contextRoot = contextRoot;
  }
  
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    final String method = "doGet";
    try {
      SecurityToken token = AuthInfoUtil.getSecurityTokenFromRequest(req);
      String userId = token.getOwnerId();
      JSONArray userData = this.serviceStore.getUserServices(userId);
      
      resp.setContentType(JSON_CONTENT_TYPE);
      PrintWriter writer = resp.getWriter();
      writer.print(userData.toString());
      resp.setStatus(HttpServletResponse.SC_OK);
    } catch (JSONException e) {
      LOG.logp(Level.SEVERE, CLASS, method, "Error parsing JSON!", e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing JSON!");
    } 
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    final String method = "doPost";
    try {
      SecurityToken token = AuthInfoUtil.getSecurityTokenFromRequest(req);
      String userId = token.getOwnerId();
      String key = req.getParameter("key");
      String secret = req.getParameter("secret");
      String serviceName = req.getParameter("name");
      
      if (key.equals("") || secret.equals("") || serviceName.equals("")) {
        resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Name, Key and Secret parameters on POST request cannot be empty.");
        return;
      }
      
      String callbackUrl = req.getParameter("callbackUrl")
          .replaceAll("%origin%", authority.getOrigin())
          .replaceAll("%contextRoot%", this.contextRoot);
      String keyTypeStr = req.getParameter("keyType");
      KeyType keyType;

      if(keyTypeStr.equals("PLAINTEXT")) {
        keyType = KeyType.PLAINTEXT;
      } else if (keyTypeStr.equals("RSA_PRIVATE")) {
        keyType = KeyType.RSA_PRIVATE;
      } else {
        keyType = KeyType.HMAC_SYMMETRIC;
      }

      BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret(key, secret, keyType, serviceName, callbackUrl);
      this.serviceStore.addToUserStore(userId, serviceName, kas);
      JSONArray userData = this.serviceStore.getUserServices(userId);
      
      resp.setContentType(JSON_CONTENT_TYPE);
      PrintWriter writer = resp.getWriter();
      writer.print(userData.toString());
      resp.setStatus(HttpServletResponse.SC_OK);
    } catch (JSONException e) {
      LOG.logp(Level.SEVERE, CLASS, method, "Error parsing JSON!", e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing JSON!");
    }
  }
  
  @Override
  protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    final String method = "doDelete";
    try {
      SecurityToken token = AuthInfoUtil.getSecurityTokenFromRequest(req);
      String userId = token.getOwnerId();
      String serviceName = req.getParameter("name");
      
      if (serviceName.equals("")) {
        resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Name parameter on DELETE request cannot be empty.");
        return;
      }
      
      this.serviceStore.deleteFromUserStore(userId, serviceName);
      
      JSONArray userData = this.serviceStore.getUserServices(userId);
      resp.setContentType(JSON_CONTENT_TYPE);
      PrintWriter writer = resp.getWriter();
      writer.print(userData.toString());
      resp.setStatus(HttpServletResponse.SC_OK);
    } catch (NoSuchStoreException e) {
      LOG.logp(Level.SEVERE, CLASS, method, "The store corresponding to the user's data we are trying to get doesn't exist!", e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "The store corresponding to the user's data we are trying to get doesn't exist!");
    } catch (JSONException e) {
      LOG.logp(Level.SEVERE, CLASS, method, "Error parsing JSON!", e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing JSON!");
    }
  }

  public OSEOAuthStore getServiceStore() {
    return this.serviceStore;
  }
}
