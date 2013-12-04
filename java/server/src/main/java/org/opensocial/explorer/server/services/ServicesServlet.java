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
import java.io.UnsupportedEncodingException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.shindig.auth.AuthInfoUtil;
import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret;
import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret.KeyType;
import org.apache.shindig.gadgets.oauth2.OAuth2Accessor.Type;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Client;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2EncryptionException;
import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.server.oauth.NoSuchStoreException;
import org.opensocial.explorer.server.oauth.OSEOAuthStore;
import org.opensocial.explorer.server.oauth.OSEOAuthStoreProvider;
import org.opensocial.explorer.server.oauth2.OSEOAuth2Store;
import org.opensocial.explorer.server.oauth2.OSEOAuth2StoreProvider;
import org.opensocial.explorer.specserver.servlet.ExplorerInjectedServlet;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * A servlet that handles requests for user-stored services.
 * 
 * Services are information used by an OAuth gadget for authorization. 
 * They are stored in this servlet as a BasicOAuthStoreConsumerKeyAndSecret for OAuth 1.0, and
 * as a OAuth2Client for OAuth 2.0.
 * 
 * <pre>
 * GET /services
 * - Takes the ID from the SecurityToken string sent in the request and 
 * returns a stringified JSONObject of all the services that belong to the matching ID.
 * The format of the response json is:
 * 
 * { 
 *   oauth: [...],
 *   oauth2: [...]
 * }
 * The oauth and oauth2 arrays can be empty.
 * 
 * POST /services/oauth or /services/oauth2
 * - Creates a BasicOAuthStoreConsumerKeyAndSecret or OAuth2Client from the request parameters, 
 * - Stores it in the map of the appropriate store under the ID taken from the SecurityToken.
 * - Returns in the response an updated stringified array of all the services that belong to the matching ID.
 * 
 * DELETE /services/oauth or /services/oauth2
 * - Deletes the service that matches the ID from the SecurityToken and the service name. If there
 * is no matching user, we throw a NoSuchStoreException.
 * - Returns in the response an updated stringified array of all the services that belong to the matching ID.
 * 
 * TODO: Add PUT option for editing an existing OAuth service.
 * 
 * The services returned in the array are stringified JSONObjects and contain the same fields as in the servlet request.
 * </pre>
 */
public class ServicesServlet extends ExplorerInjectedServlet {
  private static final long serialVersionUID = -5185591095912083066L;
  private static final String CLASS = ServicesServlet.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  private OSEOAuthStore oAuthServiceStore;
  private OSEOAuth2Store oAuth2ServiceStore;
  private Authority authority;
  private String contextRoot;
  
  
  @Inject
  public void injectDependencies(OSEOAuthStoreProvider oAuthStoreProvider,
                                 OSEOAuth2StoreProvider oAuth2StoreProvider,
                                 Authority authority,
                                 @Named("shindig.contextroot") String contextRoot) {
    this.oAuthServiceStore = oAuthStoreProvider.get();
    this.oAuth2ServiceStore = oAuth2StoreProvider.get();
    this.authority = authority;
    this.contextRoot = contextRoot;
  }
  
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    final String method = "doGet";
    try {
      SecurityToken token = AuthInfoUtil.getSecurityTokenFromRequest(req);
      String userId = token.getOwnerId();
      
      JSONObject responseData = constructResponseJSON(userId);
      resp.setContentType(JSON_CONTENT_TYPE);
      PrintWriter writer = resp.getWriter();
      writer.print(responseData.toString());
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
      // Oauth1 or Oauth2?
      String[] paths = getPaths(req);
      if (paths.length == 0) {
        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "The request must specify a service version.");
        return;
      }
      
      String serviceVersion = paths[0];
      SecurityToken token = AuthInfoUtil.getSecurityTokenFromRequest(req);
      String userId = token.getOwnerId();
      
      // /services/oauth
      if ("oauth".equalsIgnoreCase(serviceVersion)) {
        addOAuthClient(userId, req, resp);
      }
      
      // /services/oauth2
      if ("oauth2".equalsIgnoreCase(serviceVersion)) {
        addOAuth2Client(userId, req, resp);
      }
      
      JSONObject responseData = constructResponseJSON(userId);
      
      resp.setContentType(JSON_CONTENT_TYPE);
      PrintWriter writer = resp.getWriter();
      writer.print(responseData.toString());
      resp.setStatus(HttpServletResponse.SC_OK);
    } catch (JSONException e) {
      LOG.logp(Level.SEVERE, CLASS, method, "Error parsing JSON!", e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing JSON!");
    } catch (OAuth2EncryptionException e) {
      LOG.logp(Level.SEVERE, CLASS, method, "Error encrypting service secret!", e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error encrypting service secret!");
    } catch (IllegalArgumentException e) {
      LOG.logp(Level.SEVERE, CLASS, method, e.getMessage(), e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
    }
  }
  
  @Override
  protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    final String method = "doDelete";
    try {
      
      // Oauth1 or Oauth2?
      String[] paths = getPaths(req);
      if (paths.length == 0) {
        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "The request must specify a service version.");
        return;
      }
      
      String serviceVersion = paths[0];
      SecurityToken token = AuthInfoUtil.getSecurityTokenFromRequest(req);
      String userId = token.getOwnerId();
      String serviceName = req.getParameter("name");
      
      if (serviceName.equals("")) {
        resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Name parameter on DELETE request cannot be empty.");
        return;
      }
      
      // /services/oauth
      if ("oauth".equalsIgnoreCase(serviceVersion)) {
        this.oAuthServiceStore.deleteUserService(userId, serviceName);
      }
      
      // /services/oauth2
      if ("oauth2".equalsIgnoreCase(serviceVersion)) {
        this.oAuth2ServiceStore.deleteUserClient(userId, serviceName);
      }
      
      JSONObject responseData = constructResponseJSON(userId);
      resp.setContentType(JSON_CONTENT_TYPE);
      PrintWriter writer = resp.getWriter();
      writer.print(responseData.toString());
      resp.setStatus(HttpServletResponse.SC_OK);
    } catch (NoSuchStoreException e) {
      LOG.logp(Level.SEVERE, CLASS, method, "The store corresponding to the user's data we are trying to get doesn't exist!", e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "The store corresponding to the user's data we are trying to get doesn't exist!");
    } catch (JSONException e) {
      LOG.logp(Level.SEVERE, CLASS, method, "Error parsing JSON!", e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing JSON!");
    }
  }

  private void addOAuthClient(String userId, HttpServletRequest req, HttpServletResponse resp) throws IOException, IllegalArgumentException {
    String key = req.getParameter("key");
    String secret = req.getParameter("secret");
    String serviceName = req.getParameter("name");
    
    if (key.equals("") || secret.equals("") || serviceName.equals("")) {
      throw new IllegalArgumentException("Name, Key and Secret parameters on POST request cannot be empty.");
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
    this.oAuthServiceStore.addUserService(userId, serviceName, kas);
  }
  
  private void addOAuth2Client(String userId, HttpServletRequest req, HttpServletResponse resp) throws IOException, OAuth2EncryptionException, IllegalArgumentException {
    String clientId = req.getParameter("clientId");
    String clientSecret = req.getParameter("clientSecret");
    String serviceName = req.getParameter("name");
    String authUrl = req.getParameter("authUrl");
    String tokenUrl = req.getParameter("tokenUrl");
    
    if (clientId.equals("") || clientSecret.equals("") || serviceName.equals("") || authUrl.equals("") || tokenUrl.equals("")) {
      throw new IllegalArgumentException("Name, Id, Secret, AuthUrl, and TokenUrl parameters on POST request cannot be empty.");
    }
    
    String grantType = req.getParameter("grantType");
    String authentication = req.getParameter("authentication");
    String override = req.getParameter("override");
    String authHeader = req.getParameter("authHeader");
    String urlParam = req.getParameter("urlParam");
    String redirectUrl = req.getParameter("redirectUrl")
        .replaceAll("%origin%", authority.getOrigin())
        .replaceAll("%contextRoot%", this.contextRoot);
    String typeStr = req.getParameter("type");
    Type type;

    if(typeStr.equals("public")) {
      type = Type.PUBLIC;
    } else if (typeStr.equals("unknown")) {
      type = Type.UNKNOWN;
    } else {
      type = Type.CONFIDENTIAL;
    }
    
    OAuth2Client client = new OAuth2Client();
    client.setServiceName(serviceName);
    client.setClientId(clientId);
    client.setClientSecret(clientSecret.getBytes());
    client.setAuthorizationUrl(authUrl);
    client.setTokenUrl(tokenUrl);
    client.setType(type);
    client.setGrantType(grantType);
    client.setClientAuthenticationType(authentication);
    client.setAllowModuleOverride(Boolean.parseBoolean(override));
    client.setAuthorizationHeader(Boolean.parseBoolean(authHeader));
    client.setUrlParameter(Boolean.parseBoolean(urlParam));
    client.setRedirectUri(redirectUrl);
    
    this.oAuth2ServiceStore.addUserClient(userId, serviceName, client);
  }
  
  private JSONObject constructResponseJSON(String userId) throws JSONException, UnsupportedEncodingException {
    JSONArray oAuthData = this.oAuthServiceStore.getUserServices(userId);
    JSONArray oAuth2Data = this.oAuth2ServiceStore.getUserClients(userId);
    
    JSONObject responseData = new JSONObject();
    responseData.put("oauth", oAuthData);
    responseData.put("oauth2", oAuth2Data);
    
    return responseData;
  }
  
  public OSEOAuthStore getOAuthStore() {
    return this.oAuthServiceStore;
  }
  
  public OSEOAuth2Store getOAuth2Store() {
    return this.oAuth2ServiceStore;
  }
}
