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

import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import net.oauth.OAuth;
import net.oauth.OAuthConsumer;
import net.oauth.OAuthServiceProvider;
import net.oauth.signature.RSA_SHA1;

import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.auth.SecurityTokenCodec;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.gadgets.GadgetException;
import org.apache.shindig.gadgets.GadgetException.Code;
import org.apache.shindig.gadgets.http.HttpFetcher;
import org.apache.shindig.gadgets.oauth.BasicOAuthStore;
import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret;
import org.apache.shindig.gadgets.oauth.BasicOAuthStoreConsumerKeyAndSecret.KeyType;
import org.apache.shindig.gadgets.oauth.OAuthStore;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;

import com.google.caja.util.Maps;
import com.google.common.base.Objects;
import com.google.inject.Inject;
import com.google.inject.name.Named;

/**
 * Basic OAuth store for OAuth 1.0a keys and secrets and tokens.
 * The current implementation reads from a JSON file for the initial set of service
 * providers.  Unlike the Shindig implementation of OAuthStore we don't restrict a service
 * provider to a single gadget.  Instead any gadget may use and service provider as long
 * as it uses the correct service name.  This is probably not something you want to do in a
 * production environment but for development it should be OK.
 */
public class OSEOAuthStore implements OAuthStore {
  private static final String CLAZZ = OSEOAuthStore.class.getName();
  private static final String CONSUMER_SECRET_KEY = "consumer_secret";
  private static final String CONSUMER_KEY_KEY = "consumer_key";
  private static final String KEY_TYPE_KEY = "key_type";
  private static final String CALLBACK_URL = "callback_url";
  private static final String OAUTH_BODY_HASH_KEY = "bodyHash";
  private Logger LOG = Logger.getLogger(CLAZZ);
  
  private Map<String, BasicOAuthStoreConsumerKeyAndSecret> keyAndSecretStore;
  private Map<String, Map<String, BasicOAuthStoreConsumerKeyAndSecret>> userStore;
  private Map<TokenInfoIndex, TokenInfo> tokenStore;
  private String defaultCallbackUrl;
  private Authority authority;
  private String contextRoot;
  
  /**
   * Token index for the token store.
   */
  private static class TokenInfoIndex {
    private String serviceName;
    private String tokenName;
    private String userId;
    
    public TokenInfoIndex(String serviceName, String tokenName, String userId) {
      this.serviceName = serviceName;
      this.tokenName = tokenName;
      this.userId = userId;
    }

    public String getServiceName() {
      return serviceName;
    }

    public String getTokenName() {
      return tokenName;
    }

    public String getUserId() {
      return userId;
    }

    @Override
    public boolean equals(Object token) {
      if(token != null && token instanceof TokenInfoIndex) {
        boolean result = true;
        TokenInfoIndex testToken = (TokenInfoIndex)token;
        result &= Objects.equal(serviceName, testToken.serviceName);
        result &= Objects.equal(tokenName, testToken.tokenName);
        result &= Objects.equal(userId, testToken.userId);
        return result;
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Objects.hashCode(serviceName, tokenName, userId);
    } 
  }
  
  /**
   * Token store for the OpenSocial Explorer.
   */
  @Inject
  public OSEOAuthStore() {
    this.keyAndSecretStore = Maps.newHashMap();
    this.tokenStore = Maps.newHashMap();
    this.userStore = Maps.newHashMap();
  }
  
  /**
   * Initializes the key and secret store from a JSON string.  The JSON should follow this format:
   * <pre>
   * {@code
   * {
   *   "ServiceName" : {
   *     "consumer_key" : "<Your Consumer Key>",
   *     "consumer_secret" : "<Your Consumer Secret>",
   *     "key_type" : "HMAC_SYMMETRIC",
   *     "callback_url" : "http://localhost:8080/gadgets/oauthcallback"
   *   }
   * }
   * }
   * </pre>
   * @param config JSON configuration String.
   */
  public void init(String config) {
    final String method = "init";
    try {
      JSONObject configJson = new JSONObject(config);
      Set<String> keys = configJson.keySet();
      for(String key : keys) {
        JSONObject consumerInfo = configJson.getJSONObject(key);
        
        //BEGIN code from org.apache.shindig.gadgets.oauth.BasicOAuthStore.realStoreConsumerInfo
        String callbackUrl = consumerInfo.optString(CALLBACK_URL, null)
          .replaceAll("%origin%", authority.getOrigin())
          .replaceAll("%contextRoot%", this.contextRoot);
        String consumerSecret = consumerInfo.getString(CONSUMER_SECRET_KEY);
        String consumerKey = consumerInfo.getString(CONSUMER_KEY_KEY);
        String keyTypeStr = consumerInfo.getString(KEY_TYPE_KEY);
        boolean oauthBodyHash = true;
        String oauthBodyHashString = consumerInfo.optString(OAUTH_BODY_HASH_KEY);
        if ("false".equalsIgnoreCase(oauthBodyHashString)) {
          oauthBodyHash = false;
        }
        KeyType keyType = KeyType.HMAC_SYMMETRIC;

        if ("RSA_PRIVATE".equals(keyTypeStr)) {
          keyType = KeyType.RSA_PRIVATE;
          consumerSecret = BasicOAuthStore.convertFromOpenSsl(consumerSecret);
        } else if ("PLAINTEXT".equals(keyTypeStr)) {
          keyType = KeyType.PLAINTEXT;
        }

        BasicOAuthStoreConsumerKeyAndSecret kas = new BasicOAuthStoreConsumerKeyAndSecret(
            consumerKey, consumerSecret, keyType, null, callbackUrl, oauthBodyHash);
        //END code from code from org.apache.shindig.gadgets.oauth.BasicOAuthStore.realStoreConsumerInfo
        
        keyAndSecretStore.put(key, kas);
      }
    } catch (JSONException e) {
      LOG.logp(Level.WARNING, CLAZZ, method, "Error initiating OAuth store from config.", e);
    }
  }

  public ConsumerInfo getConsumerKeyAndSecret(SecurityToken securityToken, String serviceName,
          OAuthServiceProvider provider) throws GadgetException {
    
    BasicOAuthStoreConsumerKeyAndSecret cks;
    String ownerId = securityToken.getOwnerId();
    
    // Check user store if security token matches any keys
    if(this.userStore.containsKey(ownerId)) {
      cks = userStore.get(ownerId).get(serviceName);
    // Check anon store
    } else if (this.keyAndSecretStore.containsKey(serviceName)) {
      cks = keyAndSecretStore.get(serviceName);
    } else {
      throw new GadgetException(Code.OAUTH_STORAGE_ERROR, "No OAuth key and secret defined for the service " + serviceName);
    }
    
    //BEGIN code from org.apache.shindig.gadgets.oauth.BasicOAuthStore.getConsumerKeyAndSercret
    OAuthConsumer consumer;
    final KeyType keyType = cks.getKeyType();
    if (keyType == KeyType.RSA_PRIVATE) {
      consumer = new OAuthConsumer(null, cks.getConsumerKey(), null, provider);
      // The oauth.net java code has lots of magic.  By setting this property here, code thousands
      // of lines away knows that the consumerSecret value in the consumer should be treated as
      // an RSA private key and not an HMAC key.
      consumer.setProperty(OAuth.OAUTH_SIGNATURE_METHOD, OAuth.RSA_SHA1);
      consumer.setProperty(RSA_SHA1.PRIVATE_KEY, cks.getConsumerSecret());
    } else if  (keyType == KeyType.PLAINTEXT) {
      consumer = new OAuthConsumer(null, cks.getConsumerKey(), cks.getConsumerSecret(), provider);
      consumer.setProperty(OAuth.OAUTH_SIGNATURE_METHOD, "PLAINTEXT");
    } else {
      consumer = new OAuthConsumer(null, cks.getConsumerKey(), cks.getConsumerSecret(), provider);
      consumer.setProperty(OAuth.OAUTH_SIGNATURE_METHOD, OAuth.HMAC_SHA1);
    }
    String callback = (cks.getCallbackUrl() != null ? cks.getCallbackUrl() : defaultCallbackUrl);

    if (authority != null) {
      callback = callback.replace("%authority%", authority.getAuthority());
    }

    return new ConsumerInfo(consumer, cks.getKeyName(), callback, cks.isOauthBodyHash());
    //END code from org.apache.shindig.gadgets.oauth.BasicOAuthStore.getConsumerKeyAndSercret
  }

  public TokenInfo getTokenInfo(SecurityToken securityToken, ConsumerInfo consumerInfo,
          String serviceName, String tokenName) throws GadgetException {
    TokenInfoIndex index = new TokenInfoIndex(serviceName, tokenName, securityToken.getViewerId());
    return tokenStore.get(index);
  }

  public void setTokenInfo(SecurityToken securityToken, ConsumerInfo consumerInfo,
          String serviceName, String tokenName, TokenInfo tokenInfo) throws GadgetException {
    TokenInfoIndex index = new TokenInfoIndex(serviceName, tokenName, securityToken.getViewerId());
    tokenStore.put(index, tokenInfo);
  }

  public void removeToken(SecurityToken securityToken, ConsumerInfo consumerInfo,
          String serviceName, String tokenName) throws GadgetException {
    TokenInfoIndex index = new TokenInfoIndex(serviceName, tokenName, securityToken.getViewerId());
    tokenStore.remove(index);
  }
  
  /**
   * Sets the default callback URL to use for OAuth services.
   * @param url Default callback URL.
   */
  public void setDefaultCallbackUrl(String url) {
    this.defaultCallbackUrl = url;
  }
  
  /**
   * Sets the authority to use for OAuth services.
   * @param authority The authority.
   */
  public void setAuthority(Authority authority) {
    this.authority = authority;
  }
  
  /**
   * Sets the contest root to use for OAuth services.
   * @param contextRoot The contextRoot.
   */
  public void setContextRoot(String contextRoot) {
    this.contextRoot = contextRoot;
  }

  /**
   * Getter method for the userStore for OAuth services.
   * @param contextRoot The contextRoot.
   */
  public Map<String, Map<String, BasicOAuthStoreConsumerKeyAndSecret>> getUserStore() {
    return this.userStore;
  }

  /**
   * Gets the Map of all of a user's services via the user's ID.
   * @param contextRoot The contextRoot.
   * @throws NoSuchStoreException 
   */
  public Map<String, BasicOAuthStoreConsumerKeyAndSecret> getNameStore(String id) throws NoSuchStoreException {
      Map<String, BasicOAuthStoreConsumerKeyAndSecret> nameStore = this.userStore.get(id);
      if (nameStore == null) {
        throw new NoSuchStoreException();
      }
    return this.userStore.get(id);
  }
}

