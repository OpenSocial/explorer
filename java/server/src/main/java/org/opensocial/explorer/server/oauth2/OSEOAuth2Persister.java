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

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.shindig.common.Nullable;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.common.util.ResourceLoader;
import org.apache.shindig.gadgets.oauth2.OAuth2Accessor;
import org.apache.shindig.gadgets.oauth2.OAuth2Message;
import org.apache.shindig.gadgets.oauth2.OAuth2Token;
import org.apache.shindig.gadgets.oauth2.OAuth2Token.Type;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Client;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Encrypter;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2EncryptionException;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2PersistenceException;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Persister;
import org.apache.shindig.gadgets.oauth2.persistence.sample.OAuth2GadgetBinding;
import org.apache.shindig.gadgets.oauth2.persistence.sample.OAuth2Provider;
import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;

import com.google.caja.util.Maps;
import com.google.inject.Inject;
import com.google.inject.name.Named;

/*
 * If you have questions about some of the methods in this class reference
 * org.apache.shindig.gadgets.oauth2.persistence.sample.JSONOAuth2Persister.
 */
/**
 * Persists OAuth 2.0 data from a JSON file.
 */
public class OSEOAuth2Persister implements OAuth2Persister {
  
  private static final String CLAZZ = OSEOAuth2Persister.class.getName();
  private static final Logger LOG = Logger.getLogger(CLAZZ);
  private static final String ALLOW_MODULE_OVERRIDE = "allowModuleOverride";
  private static final String AUTHORIZATION_HEADER = "usesAuthorizationHeader";
  private static final String AUTHORIZATION_URL = "authorizationUrl";
  private static final String CLIENT_AUTHENTICATION = "client_authentication";
  private static final String CLIENT_NAME = "clientName";
  private static final String CLIENTS = "clients";
  private static final String ENDPOINTS = "endpoints";
  private static final String GADGET_BINDGINGS = "gadgetBindings";
  private static final String NO_CLIENT_AUTHENTICATION = "NONE";
  private static final String PROVIDER_NAME = "providerName";
  private static final String PROVIDERS = "providers";
  private static final String TOKEN_URL = "tokenUrl";
  private static final String TYPE = "type";
  private static final String URL_PARAMETER = "usesUrlParameter";
  private static final String ALLOWED_DOMAINS = "allowedDomains";
  
  private OAuth2Encrypter encrypter;
  private Authority authority;
  private String globalRedirectUri;
  private String contextRoot;
  private JSONObject configFile;
  private String oauthConfig;
  
  @Inject
  public OSEOAuth2Persister(final OAuth2Encrypter encrypter, final Authority authority,
          final String globalRedirectUri, @Nullable
          @Named("shindig.contextroot") final String contextRoot, 
          final @Named("explorer.oauth20.config") String oauthConfig) {
    this.encrypter = encrypter;
    this.authority = authority;
    this.globalRedirectUri = globalRedirectUri;
    this.contextRoot = contextRoot;
    this.oauthConfig = oauthConfig;
    loadConfig();
  }
  
  protected void loadConfig() {
    final String method = "loadConfig";
    try {
      this.configFile = new JSONObject(ResourceLoader.getContent(oauthConfig));
    } catch (final Exception e) {
      LOG.logp(Level.WARNING, CLAZZ, method, "Error loading config from " + oauthConfig, e);
    }
  }

  public OAuth2Client findClient(String gadgetUri, String serviceName)
          throws OAuth2PersistenceException {
    return null;
  }

  public OAuth2Token findToken(String gadgetUri, String serviceName, String user, String scope,
          Type type) throws OAuth2PersistenceException {
    return null;
  }

  public void insertToken(OAuth2Token token) throws OAuth2PersistenceException {
  }

  //TODO Remove this once we have the proper visibility in JSONOAuth2Persister
  //This code came from org.apache.shindig.gadgets.oauth2.persistence.sample.JSONOAuth2Persister.loadClients
  //Needed to copy the entire method because we cannot override loadGadgetBindings in Shindig 2.5.0
  public Set<OAuth2Client> loadClients() throws OAuth2PersistenceException {
    final String method = "loadClients";
    final Map<String, OAuth2GadgetBinding> gadgetBindings = this.loadGadgetBindings();
    final Map<String, OAuth2Provider> providers = this.loadProviders();

    final Map<String, OAuth2Client> internalMap = Maps.newHashMap();

    try {
      final JSONObject clients = this.configFile.getJSONObject(CLIENTS);
      for (final Iterator<?> j = clients.keys(); j.hasNext();) {
        final String clientName = (String) j.next();
        final JSONObject settings = clients.getJSONObject(clientName);

        final OAuth2Client client = new OAuth2Client(this.encrypter);

        final String providerName = settings.getString(PROVIDER_NAME);
        final OAuth2Provider provider = providers.get(providerName);
        client.setAuthorizationUrl(provider.getAuthorizationUrl());
        client.setClientAuthenticationType(provider.getClientAuthenticationType());
        client.setAuthorizationHeader(provider.isAuthorizationHeader());
        client.setUrlParameter(provider.isUrlParameter());
        client.setTokenUrl(provider.getTokenUrl());

        String redirectUri = settings.optString(OAuth2Message.REDIRECT_URI, null);
        if (redirectUri == null) {
          redirectUri = this.globalRedirectUri;
        }
        final String secret = settings.optString(OAuth2Message.CLIENT_SECRET);
        final String clientId = settings.getString(OAuth2Message.CLIENT_ID);
        final String typeS = settings.optString(TYPE, null);
        String grantType = settings.optString(OAuth2Message.GRANT_TYPE, null);
        final String sharedToken = settings.optString(OAuth2Message.SHARED_TOKEN, "false");
        if ("true".equalsIgnoreCase(sharedToken)) {
          client.setSharedToken(true);
        }

        try {
          client.setEncryptedSecret(secret.getBytes("UTF-8"));
        } catch (final OAuth2EncryptionException e) {
          throw new OAuth2PersistenceException(e);
        }

        client.setClientId(clientId);

        if (this.authority != null) {
          redirectUri = redirectUri.replace("%authority%", this.authority.getAuthority());
          redirectUri = redirectUri.replace("%contextRoot%", this.contextRoot);
          redirectUri = redirectUri.replace("%origin%", this.authority.getOrigin());
          redirectUri = redirectUri.replace("%scheme", this.authority.getScheme());
        }
        client.setRedirectUri(redirectUri);

        if (grantType == null || grantType.length() == 0) {
          grantType = OAuth2Message.AUTHORIZATION;
        }

        client.setGrantType(grantType);

        OAuth2Accessor.Type type = OAuth2Accessor.Type.UNKNOWN;
        if (OAuth2Message.CONFIDENTIAL_CLIENT_TYPE.equals(typeS)) {
          type = OAuth2Accessor.Type.CONFIDENTIAL;
        } else if (OAuth2Message.PUBLIC_CLIENT_TYPE.equals(typeS)) {
          type = OAuth2Accessor.Type.PUBLIC;
        }
        client.setType(type);

        final JSONArray dArray = settings.optJSONArray(ALLOWED_DOMAINS);
        if (dArray != null) {
          final ArrayList<String> domains = new ArrayList<String>();
          for (int i = 0; i < dArray.length(); i++) {
            domains.add(dArray.optString(i));
          }
          client.setAllowedDomains(domains.toArray(new String[domains.size()]));
        }

        internalMap.put(clientName, client);
      }
    } catch (RuntimeException e) {
      throw e;  
    } catch (final Exception e) {
      LOG.logp(Level.WARNING, CLAZZ, method, "Exception loading clients.", e);
      throw new OAuth2PersistenceException(e);
    }
    
    final Set<OAuth2Client> ret = new HashSet<OAuth2Client>(gadgetBindings.size());
    for (final OAuth2GadgetBinding binding : gadgetBindings.values()) {
      final String clientName = binding.getClientName();
      final OAuth2Client cachedClient = internalMap.get(clientName);
      final OAuth2Client client = cachedClient.clone();
      client.setGadgetUri(binding.getGadgetUri());
      client.setServiceName(binding.getGadgetServiceName());
      client.setAllowModuleOverride(binding.isAllowOverride());
      ret.add(client);
    }

    return ret;
  }

  public Set<OAuth2Token> loadTokens() throws OAuth2PersistenceException {
    return Collections.emptySet();
  }

  public boolean removeToken(String gadgetUri, String serviceName, String user, String scope,
          Type type) throws OAuth2PersistenceException {
    return false;
  }

  public void updateToken(OAuth2Token token) throws OAuth2PersistenceException {
  }
  
  //TODO Override this once we have the proper visibility in JSONOAuth2Persister
  protected Map<String, OAuth2GadgetBinding> loadGadgetBindings() throws OAuth2PersistenceException {
    final String method = "loadGadgetBindings";
    final Map<String, OAuth2GadgetBinding> ret = Maps.newHashMap();

    try {
      final JSONObject bindings = this.configFile.getJSONObject(GADGET_BINDGINGS);
      for (final Iterator<?> i = bindings.keys(); i.hasNext();) {
        final String gadgetServiceName = (String) i.next();
        final JSONObject settings = bindings.getJSONObject(gadgetServiceName);
        final String clientName = settings.getString(CLIENT_NAME);
        final boolean allowOverride = settings
                .getBoolean(ALLOW_MODULE_OVERRIDE);
        final OAuth2GadgetBinding gadgetBinding = new OAuth2GadgetBinding(null,
                gadgetServiceName, clientName, allowOverride);

        ret.put(gadgetBinding.getGadgetServiceName(), gadgetBinding);
      }


    } catch (final JSONException e) {
      LOG.logp(Level.WARNING, CLAZZ, method, "Exception while loading gadget bindings.", e);
      throw new OAuth2PersistenceException(e);
    }

    return ret;
  }

  //TODO Remove this once we have the proper visibility in JSONOAuth2Persister
  //This code came from org.apache.shindig.gadgets.oauth2.persistence.sample.JSONOAuth2Persister.loadClients
  //Needed to copy the entire method because we cannot override loadGadgetBindings in Shindig 2.5.0
  private Map<String, OAuth2Provider> loadProviders() throws OAuth2PersistenceException {
    final String method = "loadProviders";
    final Map<String, OAuth2Provider> ret = Maps.newHashMap();

    try {
      final JSONObject providers = this.configFile.getJSONObject(PROVIDERS);
      for (final Iterator<?> i = providers.keys(); i.hasNext();) {
        final String providerName = (String) i.next();
        final JSONObject provider = providers.getJSONObject(providerName);
        final JSONObject endpoints = provider.getJSONObject(ENDPOINTS);

        final String clientAuthenticationType = provider.optString(CLIENT_AUTHENTICATION,
                NO_CLIENT_AUTHENTICATION);

        final boolean authorizationHeader = provider.optBoolean(AUTHORIZATION_HEADER, false);

        final boolean urlParameter = provider.optBoolean(URL_PARAMETER, false);

        String authorizationUrl = endpoints.optString(AUTHORIZATION_URL, null);

        if (this.authority != null && authorizationUrl != null) {
          authorizationUrl = authorizationUrl.replace("%authority%", this.authority.getAuthority());
          authorizationUrl = authorizationUrl.replace("%contextRoot%", this.contextRoot);
          authorizationUrl = authorizationUrl.replace("%origin%", this.authority.getOrigin());
          authorizationUrl = authorizationUrl.replace("%scheme%", this.authority.getScheme());
        }

        String tokenUrl = endpoints.optString(TOKEN_URL, null);
        if (this.authority != null && tokenUrl != null) {
          tokenUrl = tokenUrl.replace("%authority%", this.authority.getAuthority());
          tokenUrl = tokenUrl.replace("%contextRoot%", this.contextRoot);
          tokenUrl = tokenUrl.replace("%origin%", this.authority.getOrigin());
          tokenUrl = tokenUrl.replace("%scheme%", this.authority.getScheme());
        }

        final OAuth2Provider oauth2Provider = new OAuth2Provider();

        oauth2Provider.setName(providerName);
        oauth2Provider.setAuthorizationUrl(authorizationUrl);
        oauth2Provider.setTokenUrl(tokenUrl);
        oauth2Provider.setClientAuthenticationType(clientAuthenticationType);
        oauth2Provider.setAuthorizationHeader(authorizationHeader);
        oauth2Provider.setUrlParameter(urlParameter);

        ret.put(oauth2Provider.getName(), oauth2Provider);
      }
    } catch (final JSONException e) {
      LOG.logp(Level.WARNING, CLAZZ, method, "Exception parsing providers.", e);
      throw new OAuth2PersistenceException(e);
    }

    return ret;
  }
  
  public void setConfig(JSONObject config) {
    this.configFile = config;
  }

}

