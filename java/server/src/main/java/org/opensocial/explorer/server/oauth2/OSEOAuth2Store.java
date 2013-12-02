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

import com.google.inject.Inject;
import com.google.inject.name.Named;

import org.apache.shindig.common.crypto.BlobCrypter;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.gadgets.GadgetException;
import org.apache.shindig.gadgets.GadgetException.Code;
import org.apache.shindig.gadgets.oauth2.BasicOAuth2Accessor;
import org.apache.shindig.gadgets.oauth2.BasicOAuth2Store;
import org.apache.shindig.gadgets.oauth2.OAuth2Accessor;
import org.apache.shindig.gadgets.oauth2.OAuth2CallbackState;
import org.apache.shindig.gadgets.oauth2.OAuth2FetcherConfig;
import org.apache.shindig.gadgets.oauth2.OAuth2Store;
import org.apache.shindig.gadgets.oauth2.OAuth2Token;
import org.apache.shindig.gadgets.oauth2.logger.FilteredLogger;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Cache;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2CacheException;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Client;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Encrypter;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2PersistenceException;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Persister;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2TokenPersistence;
import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.server.oauth.NoSuchStoreException;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * see {@link OAuth2Store}
 *
 * Default OAuth2Store.  Handles a persistence scenario with a separate cache
 * and persistence layer.
 *
 * Uses 3 Guice bindings to achieve storage implementation.
 *
 * 1) {@link OAuth2Persister} 2) {@link OAuth2Cache} 3) {@link OAuth2Encrypter}
 *
 */
public class OSEOAuth2Store extends BasicOAuth2Store implements OAuth2Store {
  private static final String LOG_CLASS = OSEOAuth2Store.class.getName();
  private static final FilteredLogger LOG = FilteredLogger
          .getFilteredLogger(OSEOAuth2Store.LOG_CLASS);

  private final IOAuth2Cache cache;
  private final IOAuth2Persister persister;
  private final String globalRedirectUri;
  private final Authority authority;
  private final String contextRoot;
  private final BlobCrypter stateCrypter;

  @Inject
  public OSEOAuth2Store(final IOAuth2Cache cache, final IOAuth2Persister persister,
          final OAuth2Encrypter encrypter, final String globalRedirectUri,
          final Authority authority, final String contextRoot,
          @Named(OAuth2FetcherConfig.OAUTH2_STATE_CRYPTER) final BlobCrypter stateCrypter) {
    super(cache, persister, encrypter, globalRedirectUri, authority, contextRoot, stateCrypter);

    this.cache = cache;
    this.persister = persister;
    this.globalRedirectUri = globalRedirectUri;
    this.authority = authority;
    this.contextRoot = contextRoot;
    this.stateCrypter = stateCrypter;
  }

  /**
   * Gets all the services associated with the given userId. Returns an empty JSONArray
   * if user doesn't exist or user has no services. 
   * @param userId The user ID.
   * @throws UnsupportedEncodingException 
   */
  public JSONArray getUserServices(String userId) throws JSONException, UnsupportedEncodingException {
    return this.cache.getUserServices(userId);
  }
  
  /**
   * Adds a service with the given serviceName to the given userId.
   * Overwrites the service if the service already exists.
   * @param userId The user ID.
   * @param serviceName The name of the service.
   * @param kas The container class with all of the service's information.
   */
  public void addUserService(String userId, String serviceName, OAuth2Client client) {
    this.cache.addUserService(userId, serviceName, client);
  }
  
  /**
   * Deletes a service with the given serviceName associated with the given userId.
   * Throws an exception if the userId does not exist in the userStore.
   * @param userId The user ID.
   * @param serviceName The name of the service.
   */
  public void deleteUserService(String userId, String serviceName) throws NoSuchStoreException {
    this.cache.deleteUserService(userId, serviceName);
  }
  
  // Overloading getClient(String, String) from BasicOAuth2Store
  public OAuth2Client getClient(final String userId, final String gadgetUri, final String serviceName)
          throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    OAuth2Client client;
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "getClient", new Object[] {
              gadgetUri, serviceName });
    }
    
    // check in cache's user map
    if(this.cache.isUserExisting(userId)) {
      client = this.cache.getUserService(userId, serviceName);
    // else the client is in the cache's anon map
    } else {
      client = this.cache.getClient(gadgetUri, serviceName);
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.log("client from cache = {0}", client);
    }

    if (client == null) {
      try {
        client = this.persister.findClient(userId, gadgetUri, serviceName);
        if (client != null) {
          this.cache.storeClient(client);
        }
      } catch (final OAuth2PersistenceException e) {
        if (isLogging) {
          OSEOAuth2Store.LOG.log("Error loading OAuth2 client ", e);
        }
        throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error loading OAuth2 client "
                + serviceName, e);
      }
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "getClient", client);
    }

    return client;
  }
   
  public OAuth2Accessor getOAuth2Accessor(final String gadgetUri, final String serviceName,
      final String user, final String scope) throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "getOAuth2Accessor", new Object[] {
          gadgetUri, serviceName, user, scope });
    }

    final OAuth2CallbackState state = new OAuth2CallbackState(this.stateCrypter);
    state.setGadgetUri(gadgetUri);
    state.setServiceName(serviceName);
    state.setUser(user);
    state.setScope(scope);

    OAuth2Accessor ret = this.cache.getOAuth2Accessor(state);

    if (ret == null || !ret.isValid()) {
      final OAuth2Client client = this.getClient(user, gadgetUri, serviceName);

      if (client != null) {
        final OAuth2Token accessToken = this.getToken(gadgetUri, serviceName, user, scope,
            OAuth2Token.Type.ACCESS);
        final OAuth2Token refreshToken = this.getToken(gadgetUri, serviceName, user, scope,
            OAuth2Token.Type.REFRESH);

        final BasicOAuth2Accessor newAccessor = new BasicOAuth2Accessor(gadgetUri, serviceName,
            user, scope, client.isAllowModuleOverride(), this, this.globalRedirectUri,
            this.authority, this.contextRoot);
        newAccessor.setAccessToken(accessToken);
        newAccessor.setAuthorizationUrl(client.getAuthorizationUrl());
        newAccessor.setClientAuthenticationType(client.getClientAuthenticationType());
        newAccessor.setAuthorizationHeader(client.isAuthorizationHeader());
        newAccessor.setUrlParameter(client.isUrlParameter());
        newAccessor.setClientId(client.getClientId());
        newAccessor.setClientSecret(client.getClientSecret());
        newAccessor.setGrantType(client.getGrantType());
        newAccessor.setRedirectUri(client.getRedirectUri());
        newAccessor.setRefreshToken(refreshToken);
        newAccessor.setTokenUrl(client.getTokenUrl());
        newAccessor.setType(client.getType());
        newAccessor.setAllowedDomains(client.getAllowedDomains());
        ret = newAccessor;

        this.storeOAuth2Accessor(ret);
      }
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "getOAuth2Accessor", ret);
    }

    return ret;
  }
  
  public OAuth2Token getToken(final String gadgetUri, final String serviceName, final String user,
          final String scope, final OAuth2Token.Type type) throws GadgetException {

    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "getToken", new Object[] {
              gadgetUri, serviceName, user, scope, type });
    }

    final String processedGadgetUri = this.getGadgetUri(user, gadgetUri, serviceName);
    OAuth2Token token = this.cache.getToken(processedGadgetUri, serviceName, user, scope, type);
    if (token == null) {
      try {
        token = this.persister.findToken(processedGadgetUri, serviceName, user, scope, type);
        if (token != null) {
          synchronized (token) {
            try {
              token.setGadgetUri(processedGadgetUri);
              this.cache.storeToken(token);
            } finally {
              token.setGadgetUri(gadgetUri);
            }
          }
        }
      } catch (final OAuth2PersistenceException e) {
        throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error loading OAuth2 token", e);
      }
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "getToken", token);
    }

    return token;
  }

  public OAuth2Token removeToken(final OAuth2Token token) throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "removeToken", token);
    }

    if (token != null) {
      if (isLogging) {
        OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "removeToken", token);
      }

      try {
        synchronized (token) {
          final String origGadgetApi = token.getGadgetUri();
          final String processedGadgetUri = this.getGadgetUri(token.getUser(), token.getGadgetUri(), token.getServiceName());
          token.setGadgetUri(processedGadgetUri);
          try {
            // Remove token from the cache
            this.cache.removeToken(token);
            // Token is gone from the cache, also remove it from persistence
            this.persister.removeToken(processedGadgetUri, token.getServiceName(), token.getUser(), token.getScope(), token.getType());
          } finally {
            token.setGadgetUri(origGadgetApi);
          }
        }

        return token;
      } catch (final OAuth2PersistenceException e) {
        if (isLogging) {
          OSEOAuth2Store.LOG.log("Error removing OAuth2 token ", e);
        }
        throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error removing OAuth2 token "
                + token.getServiceName(), e);
      }
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "removeToken", null);
    }

    return null;
  }

  public static boolean runImport(final IOAuth2Persister source, final IOAuth2Persister target,
          final boolean clean) {
    if (OSEOAuth2Store.LOG.isLoggable()) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "runImport", new Object[] { source,
              target, clean });
    }

    // No import for default persistence
    return false;
  }

  public void setToken(final OAuth2Token token) throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "setToken", token);
    }

    if (token != null) {
      final String gadgetUri = token.getGadgetUri();
      final String serviceName = token.getServiceName();

      final String processedGadgetUri = this.getGadgetUri(token.getUser(), gadgetUri, serviceName);
      synchronized (token) {
        token.setGadgetUri(processedGadgetUri);
        try {
          final OAuth2Token existingToken = this.getToken(gadgetUri, token.getServiceName(),
                  token.getUser(), token.getScope(), token.getType());
          try {
            if (existingToken == null) {
              this.persister.insertToken(token);
            } else {
              synchronized (existingToken) {
                try {
                  existingToken.setGadgetUri(processedGadgetUri);
                  this.cache.removeToken(existingToken);
                  this.persister.updateToken(token);
                } finally {
                  existingToken.setGadgetUri(gadgetUri);
                }
              }
            }
            this.cache.storeToken(token);
          } catch (final OAuth2CacheException e) {
            if (isLogging) {
              OSEOAuth2Store.LOG.log("Error storing OAuth2 token", e);
            }
            throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error storing OAuth2 token", e);
          } catch (final OAuth2PersistenceException e) {
            if (isLogging) {
              OSEOAuth2Store.LOG.log("Error storing OAuth2 token", e);
            }
            throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error storing OAuth2 token", e);
          }
        } finally {
          token.setGadgetUri(gadgetUri);
        }
      }
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "setToken");
    }
  }

  protected String getGadgetUri(final String userId, final String gadgetUri, final String serviceName)
          throws GadgetException {
    String ret = gadgetUri;
    final OAuth2Client client = this.getClient(ret, serviceName);
    if (client != null) {
      if (client.isSharedToken()) {
        ret = client.getClientId() + ':' + client.getServiceName();
      }
    }

    return ret;
  }
}
