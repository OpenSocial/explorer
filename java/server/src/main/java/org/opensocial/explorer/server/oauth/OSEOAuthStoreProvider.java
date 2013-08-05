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

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.common.util.ResourceLoader;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.name.Named;

/**
 * OAuth store provider.
 */
public class OSEOAuthStoreProvider implements Provider<OSEOAuthStore> {
  
  private static final String CLAZZ = OSEOAuthStoreProvider.class.getName();
  private static final String OAUTH_CALLBACK_URL = "shindig.signing.global-callback-url";
  private static final String OAUTH_CONFIG = "config/oauth.json";
  private Logger LOG = Logger.getLogger(CLAZZ);
  
  private OSEOAuthStore store;
  
  @Inject
  public OSEOAuthStoreProvider(@Named(OAUTH_CALLBACK_URL) String defaultCallbackUrl,
          Authority authority) {
    this.store = new OSEOAuthStore();
    this.store.setAuthority(authority);
    this.store.setDefaultCallbackUrl(defaultCallbackUrl);
    loadServices();
  }
  
  private void loadServices() {
    final String method = "loadServices";
    try {
      String oauthConfigString = ResourceLoader.getContent(OAUTH_CONFIG);
      this.store.init(oauthConfigString);
    } catch (IOException e) {
      LOG.logp(Level.WARNING, CLAZZ, method, "There was an error locating the resource " + OAUTH_CONFIG, e);
    }
  }

  public OSEOAuthStore get() {
    return store;
  }

}

