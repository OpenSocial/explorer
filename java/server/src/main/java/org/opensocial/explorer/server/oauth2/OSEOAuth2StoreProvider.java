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

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.shindig.common.Nullable;
import org.apache.shindig.common.crypto.BlobCrypter;
import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.common.util.ResourceLoader;
import org.apache.shindig.gadgets.GadgetException;
import org.apache.shindig.gadgets.oauth2.BasicOAuth2Store;
import org.apache.shindig.gadgets.oauth2.OAuth2FetcherConfig;
import org.apache.shindig.gadgets.oauth2.OAuth2Module;
import org.apache.shindig.gadgets.oauth2.OAuth2Store;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Cache;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Encrypter;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2PersistenceException;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Persister;
import org.apache.shindig.gadgets.oauth2.persistence.sample.JSONOAuth2Persister;
import org.opensocial.explorer.server.oauth.OSEOAuthStoreProvider;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

@Singleton
public class OSEOAuth2StoreProvider implements Provider<OSEOAuth2Store> {
  private static final String CLAZZ = OSEOAuth2StoreProvider.class.getName();
  private Logger LOG = Logger.getLogger(CLAZZ);
  
  private OSEOAuth2Store store;

  @Inject
  public OSEOAuth2StoreProvider(
      @Named(OAuth2Module.OAUTH2_REDIRECT_URI) final String globalRedirectUri,
      @Named(OAuth2Module.OAUTH2_IMPORT) final boolean importFromConfig,
      @Named(OAuth2Module.OAUTH2_IMPORT_CLEAN) final boolean importClean,
      final Authority authority, final IOAuth2Cache cache, final IOAuth2Persister persister,
      final OAuth2Encrypter encrypter,
      @Nullable @Named("shindig.contextroot") final String contextRoot,
      @Named("explorer.oauth20.config") String oauthConfig,
      @Named(OAuth2FetcherConfig.OAUTH2_STATE_CRYPTER) final BlobCrypter stateCrypter) {

    this.store = new OSEOAuth2Store(cache, persister, encrypter, globalRedirectUri, authority,
            contextRoot, stateCrypter);
    
    if (importFromConfig) {
      final IOAuth2Persister source = new OSEOAuth2Persister(encrypter, authority,
          globalRedirectUri, contextRoot, oauthConfig);
      OSEOAuth2Store.runImport(source, persister, importClean);
    } 

    loadClients();
  }
  
  protected void loadClients() {
    final String method = "loadClients";
    try {
      this.store.init();
    } catch (final GadgetException e) {
      LOG.logp(Level.WARNING, CLAZZ, method, "Exception loading clients.", e);
    }
  }

  public OSEOAuth2Store get() {
    return this.store;
  }
}