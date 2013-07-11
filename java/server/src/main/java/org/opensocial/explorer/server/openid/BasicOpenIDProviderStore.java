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
package org.opensocial.explorer.server.openid;
import java.util.Iterator;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.shindig.common.util.ResourceLoader;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;

import com.google.common.collect.Sets;

/**
 * A basic OpenIDProviderStore implementation using a JSON file.
 */
public class BasicOpenIDProviderStore implements OpenIDProviderStore {
  
  private static final String OPEN_ID_JSON = "config/openid.json";
  private static final String CLASS = BasicOpenIDProviderStore.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  private Set<OpenIDProvider> providers;
  
  /**
   * Builds a basic Open ID store from a JSON file.
   */
  public BasicOpenIDProviderStore() {
    final String method = "BasicOpenIDProviderStore";
    providers = Sets.newHashSet();
    try{
      String jsonString = ResourceLoader.getContent(OPEN_ID_JSON);
      JSONObject json = new JSONObject(jsonString);
      loadProviders(json);
    } catch(Exception e) {
      LOG.logp(Level.SEVERE, CLASS, method, e.getMessage(), e);
    }
  }
  
  /**
   * Creates a basic Open ID store from a JSON object.  The JSON object should take the following
   * form
   * <pre>
   * {@code
   * {
   *   "providers" : {
   *     "google" : {
   *       "name" : "Google",
   *       "url" : "https://www.google.com/accounts/o8/id",
   *       "imageUrl" : "http://g.etfv.co/http://www.google.com"
   *     }
   *   }
   * }
   * }
   * </pre>
   * @param json The JSON to build the store from.
   */
  public BasicOpenIDProviderStore(JSONObject json) {
    providers = Sets.newHashSet();
    loadProviders(json);
  }

  /**
   * Loads the providers into the store.
   * @param json The JSON containing the providers to load.
   */
  private void loadProviders(JSONObject json) {
    final String method = "loadProviders";
    try {
      if(json.containsKey("providers")) {
        JSONObject providersObj = json.getJSONObject("providers");
        Iterator<String> iter = providersObj.keys();
        while(iter.hasNext()) {
          String providerId = iter.next();
          JSONObject provider = providersObj.getJSONObject(providerId);
          addJsonProvider(providerId, provider);
        }
      }
    } catch (JSONException e) {
      LOG.logp(Level.SEVERE, CLASS, method, e.getMessage(), e);
    }
  }
  
  /**
   * Adds a JSON provider to the store.
   * @param providerId  The ID of the provider.
   * @param provider The provider JSON object.
   */
  private void addJsonProvider(String providerId, JSONObject provider) {
    final String method = "addOpenIDProvider";
    if(validateProvider(provider)) {
      try {
        String name = provider.getString("name");
        String url = provider.getString("url");
        String imageUrl = provider.optString("imageUrl");
        providers.add(new OpenIDProvider(providerId, name, url, imageUrl));
      } catch (JSONException e) {
        LOG.logp(Level.WARNING, CLASS, method, e.getMessage(), e);
      }
    }
  }
  
  /**
   * Validates the provider object.  The object must have a name and a URL property.
   * @param provider The JSON provider.
   * @return True if the provider is valid, false otherwise.
   */
  private boolean validateProvider(JSONObject provider) {
    return provider.containsKey("name") && provider.containsKey("url");
  }

  public void removeProvider(OpenIDProvider provider) {
   providers.remove(provider);
  }
  
  public void addProvider(OpenIDProvider provider) {
    providers.add(provider);
  }

  public Set<OpenIDProvider> getProviders() {
    return providers;
  }

}

