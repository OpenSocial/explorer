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
package org.opensocial.explorer.server.oauth2;

import java.io.UnsupportedEncodingException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret;
import org.apache.shindig.gadgets.oauth2.OAuth2Accessor;
import org.apache.shindig.gadgets.oauth2.OAuth2CallbackState;
import org.apache.shindig.gadgets.oauth2.OAuth2Token;
import org.apache.shindig.gadgets.oauth2.OAuth2Token.Type;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2CacheException;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Client;
import org.apache.shindig.gadgets.oauth2.persistence.sample.InMemoryCache;
import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.server.oauth.NoSuchStoreException;

import com.google.common.collect.Maps;
import com.google.inject.Inject;

/**
 * An in-memory cache for OAuth 2.0.  In the cache we do not use the gadget URLs in the keys.
 * This allows us to reuse OAuth 2.0 accessors, tokens, and client info for multiple
 * gadgets.  Not something you would want to do for production containers but is suitable for
 * development containers like the OpenSocial Explorer. 
 */
public class OSEInMemoryCache extends InMemoryCache implements IOAuth2Cache{
  private final Map<String, OAuth2Accessor> accessors;
  private final Map<String, OAuth2Client> clients;
  private final Map<String, OAuth2Token> tokens;

  private Map<String, Map<String, OAuth2Client>> userClientStore;
  
  @Inject
  public OSEInMemoryCache() {
    final Map<String, OAuth2Token> tMap = Maps.newHashMap();
    this.tokens = Collections.synchronizedMap(tMap);
    final Map<String, OAuth2Client> cMap = Maps.newHashMap();
    this.clients = Collections.synchronizedMap(cMap);
    final Map<String, OAuth2Accessor> aMap = Maps.newHashMap();
    this.accessors = Collections.synchronizedMap(aMap);
    final Map<String, Map<String, OAuth2Client>> uMap = Maps.newHashMap();
    this.userClientStore = Collections.synchronizedMap(uMap);
  }
  
  /**
   * Gets all the services associated with the given userId. Returns an empty JSONArray
   * if user doesn't exist or user has no services. 
   * @param userId The user ID.
   * @throws JSONException 
   * @throws UnsupportedEncodingException 
   */
  public JSONArray getUserServices(String userId) throws JSONException, UnsupportedEncodingException {
    JSONArray array = new JSONArray();
    if(this.userClientStore.containsKey(userId)) {
      Map<String, OAuth2Client> userMap = this.userClientStore.get(userId);
      for (String key : userMap.keySet()) {
        OAuth2Client client = userMap.get(key);
        JSONObject service = new JSONObject();
        service.put("name", client.getServiceName());
        service.put("clientId", client.getClientId());
        service.put("clientSecret", new String(client.getClientSecret(), "UTF-8"));
        service.put("authUrl", client.getAuthorizationUrl());
        service.put("tokenUrl", client.getTokenUrl());
        service.put("type", client.getType().toString());
        service.put("grantType", client.getGrantType());
        service.put("authentication", client.getClientAuthenticationType());
        service.put("override", client.isAllowModuleOverride());
        service.put("authHeader", client.isAuthorizationHeader());
        service.put("urlParam", client.isUrlParameter());
        service.put("redirectUrl", client.getRedirectUri());
        array.add(service);
      }
    }
    return array;
  }
  
  /**
   * Gets the services associated with the given userId and serviceName.
   * @param userId The user ID.
   */
  public OAuth2Client getUserService(String userId, String serviceName) {
      Map<String, OAuth2Client> userMap = this.userClientStore.get(userId);
      return userMap.get(serviceName);
  }
  
  /**
   * Adds a service with the given serviceName to the given userId.
   * Overwrites the service if the service already exists.
   * @param userId The user ID.
   * @param serviceName The name of the service.
   * @param client The container class with all of the service's information.
   */
  public void addUserService(String userId, String serviceName, OAuth2Client client) {
    if(this.userClientStore.containsKey(userId)) {
      this.userClientStore.get(userId).put(serviceName, client);
    } else {
      this.userClientStore.put(userId, new HashMap<String, OAuth2Client>());
      this.userClientStore.get(userId).put(serviceName, client);
    }
  }
  
  /**
   * Deletes a service with the given serviceName associated with the given userId.
   * Throws an exception if the userId does not exist in the userStore.
   * @param userId The user ID.
   * @param serviceName The name of the service.
   */
  public void deleteUserService(String userId, String serviceName) throws NoSuchStoreException {
    if(this.userClientStore.containsKey(userId)) {
      this.userClientStore.get(userId).remove(serviceName);
    } else {
      throw new NoSuchStoreException("Couldn't find the given userId in userStore!");
    }
  }
  
  /**
   * Checks to see if the user already exists in the userStore.
   * @param userId The user ID.
   */
  public boolean isUserExisting(String userId) {
    return this.userClientStore.containsKey(userId);
  }

  /**
   * Find an {@link OAuth2Client}. Overrides the 2 parameter getClient.
   * This method is used to extract a client with the matching userId
   * that is stored in the userStore. 
   *
   * @param userId
   * @param gadgetUri
   * @param serviceName
   * @return OAuth2Client
   */
  public OAuth2Client getClient(String userId, String gadgetUri, String serviceName) {
    OAuth2Client ret = null;
    final String clientKey = this.getClientKey(gadgetUri, serviceName);
    if (clientKey != null) {
      ret = this.getClientMap().get(clientKey);
    }

    return ret;
  }
  
  @Override
  protected String getClientKey(String gadgetUri, String serviceName) {
    //By default the key consists of the gadget URI and the service name
    return serviceName;
  }

  @Override
  protected String getTokenKey(String gadgetUri, String serviceName, String user, String scope,
          Type type) {
    if(serviceName == null || user == null) {
      return null;
    }
    String s = scope == null ? "" : scope;
    String t = type.name();
    return serviceName + ":" + user + ":" + s + ":" + t;
  }

  //TODO Remove this once we get the proper visibility in MapCache
  @Override
  protected String getAccessorKey(OAuth2CallbackState state) {
    return this.getAccessorKey(state.getGadgetUri(), state.getServiceName(), state.getUser(),
            state.getScope());
  }

  //TODO Remove this once we get the proper visibility in MapCache
  @Override
  protected String getAccessorKey(OAuth2Accessor accessor) {
    return this.getAccessorKey(accessor.getGadgetUri(), accessor.getServiceName(),
            accessor.getUser(), accessor.getScope());
  }
  
  protected String getAccessorKey(final String gadgetUri, final String serviceName,
          final String user, final String scope) {
    if (serviceName == null || user == null) {
      return null;
    }
    final String s = scope == null ? "" : scope;
    return serviceName + ":" + user + ":" + s;
  }
}

