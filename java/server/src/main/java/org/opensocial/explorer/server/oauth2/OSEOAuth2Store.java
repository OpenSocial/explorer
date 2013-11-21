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
public class OSEOAuth2Store implements IOAuth2Store {
  private static final String LOG_CLASS = OSEOAuth2Store.class.getName();
  private static final FilteredLogger LOG = FilteredLogger
          .getFilteredLogger(OSEOAuth2Store.LOG_CLASS);

  private final IOAuth2Cache cache;
  private final IOAuth2Persister persister;
  private final OAuth2Encrypter encrypter;
  private final BlobCrypter stateCrypter;
  private final String globalRedirectUri;
  private final Authority authority;
  private final String contextRoot;

  @Inject
  public OSEOAuth2Store(final IOAuth2Cache cache, final IOAuth2Persister persister,
          final OAuth2Encrypter encrypter, final String globalRedirectUri,
          final Authority authority, final String contextRoot,
          @Named(OAuth2FetcherConfig.OAUTH2_STATE_CRYPTER)
          final BlobCrypter stateCrypter) {
    this.cache = cache;
    this.persister = persister;
    this.globalRedirectUri = globalRedirectUri;
    this.authority = authority;
    this.contextRoot = contextRoot;
    this.encrypter = encrypter;
    this.stateCrypter = stateCrypter;
    if (OSEOAuth2Store.LOG.isLoggable()) {
      OSEOAuth2Store.LOG.log("this.cache = {0}", this.cache);
      OSEOAuth2Store.LOG.log("this.persister = {0}", this.persister);
      OSEOAuth2Store.LOG.log("this.globalRedirectUri = {0}", this.globalRedirectUri);
      OSEOAuth2Store.LOG.log("this.encrypter = {0}", this.encrypter);
      OSEOAuth2Store.LOG.log("this.stateCrypter = {0}", this.stateCrypter);
    }
  }

  public boolean clearCache() throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "clearCache");
    }

    try {
      this.cache.clearClients();
      this.cache.clearTokens();
      this.cache.clearAccessors();
    } catch (final OAuth2PersistenceException e) {
      if (isLogging) {
        OSEOAuth2Store.LOG.log("Error clearing OAuth2 cache", e);
      }
      throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error clearing OAuth2 cache", e);
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "clearCache", true);
    }

    return true;
  }

  public OAuth2Token createToken() {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "createToken");
    }

    final OAuth2Token ret = this.internalCreateToken();

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "clearCache", ret);
    }

    return ret;
  }

  public OAuth2Client getClient(String userId, String gadgetUri, String serviceName)
          throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "getClient", new Object[] {
              gadgetUri, serviceName });
    }

    OAuth2Client client = this.cache.getClient(null, gadgetUri, serviceName);

    if (isLogging) {
      OSEOAuth2Store.LOG.log("client from cache = {0}", client);
    }

    if (client == null) {
      try {
        client = this.persister.findClient(null, gadgetUri, serviceName);
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

  public OAuth2Accessor getOAuth2Accessor(final OAuth2CallbackState state) {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "getOAuth2Accessor", state);
    }

    final OAuth2Accessor ret = this.cache.getOAuth2Accessor(state);

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "getOAuth2Accessor", ret);
    }

    return ret;
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

        final OSEOAuth2Accessor newAccessor = new OSEOAuth2Accessor(gadgetUri, serviceName,
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

  public boolean init() throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "init");
    }

    if (this.cache.isPrimed()) {
      if (isLogging) {
        OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "init", false);
      }
      return false;
    }

    this.clearCache();

    try {
      final Set<OAuth2Client> clients = this.persister.loadClients();
      if (isLogging) {
        OSEOAuth2Store.LOG.log("clients = {0}", clients);
      }
      this.cache.storeClients(clients);
    } catch (final OAuth2PersistenceException e) {
      throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error loading OAuth2 clients", e);
    }

    try {
      final Set<OAuth2Token> tokens = this.persister.loadTokens();
      if (isLogging) {
        OSEOAuth2Store.LOG.log("tokens = {0}", tokens);
      }
      this.cache.storeTokens(tokens);
    } catch (final OAuth2PersistenceException e) {
      throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error loading OAuth2 tokens", e);
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "init", true);
    }

    return true;
  }

  public OAuth2Accessor removeOAuth2Accessor(final OAuth2Accessor accessor) {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "removeOAuth2Accessor", accessor);
    }

    final OAuth2Accessor ret = null;

    if (accessor != null) {
      return this.cache.removeOAuth2Accessor(accessor);
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "removeOAuth2Accessor", ret);
    }

    return ret;
  }

  public OAuth2Token removeToken(String userId, OAuth2Token token) throws GadgetException {
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
          final String processedGadgetUri = this.getGadgetUri(userId, token.getGadgetUri(), token.getServiceName());
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

  public void setToken(String userId, OAuth2Token token) throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "setToken", token);
    }

    if (token != null) {
      final String gadgetUri = token.getGadgetUri();
      final String serviceName = token.getServiceName();

      final String processedGadgetUri = this.getGadgetUri(userId, gadgetUri, serviceName);
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

  public void storeOAuth2Accessor(final OAuth2Accessor accessor) {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "storeOAuth2Accessor", accessor);
    }

    this.cache.storeOAuth2Accessor(accessor);

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "storeOAuth2Accessor");
    }
  }

  protected String getGadgetUri(String userId, String gadgetUri, String serviceName)
          throws GadgetException {
    String ret = gadgetUri;
    final OAuth2Client client = this.getClient(userId, ret, serviceName);
    if (client != null) {
      if (client.isSharedToken()) {
        ret = client.getClientId() + ':' + client.getServiceName();
      }
    }

    return ret;
  }

  protected OAuth2Token internalCreateToken() {
    return new OAuth2TokenPersistence(this.encrypter);
  }

  public BlobCrypter getStateCrypter() {
    return this.stateCrypter;
  }

  public OAuth2Client invalidateClient(final OAuth2Client client) {
    return this.cache.removeClient(client);
  }

  public OAuth2Token invalidateToken(final OAuth2Token token) {
    return this.cache.removeToken(token);
  }

  public void clearAccessorCache() throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "clearAccessorCache");
    }

    try {
      this.cache.clearAccessors();
    } catch (final OAuth2CacheException e) {
      if (isLogging) {
        OSEOAuth2Store.LOG.log("Error clearing OAuth2 Accessor cache", e);
      }
      throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error clearing OAuth2Accessor cache", e);
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "clearAccessorCache");
    }
  }

  public void clearTokenCache() throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "clearTokenCache");
    }

    try {
      this.cache.clearTokens();
    } catch (final OAuth2CacheException e) {
      if (isLogging) {
        OSEOAuth2Store.LOG.log("Error clearing OAuth2 Token cache", e);
      }
      throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error clearing OAuth2Token cache", e);
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "clearTokenCache");
    }
  }

  public void clearClientCache() throws GadgetException {
    final boolean isLogging = OSEOAuth2Store.LOG.isLoggable();
    if (isLogging) {
      OSEOAuth2Store.LOG.entering(OSEOAuth2Store.LOG_CLASS, "clearClientCache");
    }

    try {
      this.cache.clearClients();
    } catch (final OAuth2CacheException e) {
      if (isLogging) {
        OSEOAuth2Store.LOG.log("Error clearing OAuth2 Client cache", e);
      }
      throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "Error clearing OAuth2Client cache", e);
    }

    if (isLogging) {
      OSEOAuth2Store.LOG.exiting(OSEOAuth2Store.LOG_CLASS, "clearClientCache");
    }
  }
}

