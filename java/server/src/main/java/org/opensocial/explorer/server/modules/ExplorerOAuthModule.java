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
package org.opensocial.explorer.server.modules;

import org.apache.shindig.gadgets.oauth.OAuthModule;
import org.apache.shindig.gadgets.oauth.OAuthStore;
import org.apache.shindig.gadgets.oauth2.OAuth2Module;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Cache;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Persister;
import org.apache.shindig.gadgets.oauth2.persistence.sample.OAuth2PersistenceModule;
import org.opensocial.explorer.server.oauth.OSEOAuthStoreProvider;
import org.opensocial.explorer.server.oauth2.OSEInMemoryCache;
import org.opensocial.explorer.server.oauth2.OSEOAuth2Persister;

import com.google.inject.AbstractModule;
import com.google.inject.util.Modules;

/**
 * A module that injects OAuth1.0a and OAuth2 implementations for the OpenSocial Explorer.
 * 
 */
public class ExplorerOAuthModule extends AbstractModule {

  @Override
  protected void configure() {
    // OAuth1.0a
    install(Modules.override(new OAuthModule()).with(new OAuthModuleOverride()));
    
    // OAuth2
    install(new OAuth2Module());
    install(Modules.override(new OAuth2PersistenceModule()).with(new OAuth2PersistenceModuleOverride()));
  }

  private static class OAuthModuleOverride extends AbstractModule {
    @Override
    protected void configure() {
      bind(OAuthStore.class).toProvider(OSEOAuthStoreProvider.class);
    }
  }

  private static class OAuth2PersistenceModuleOverride extends AbstractModule {
    @Override
    protected void configure() {
      bind(OAuth2Cache.class).to(OSEInMemoryCache.class);
      bind(OAuth2Persister.class).to(OSEOAuth2Persister.class);
    }
  }
}

