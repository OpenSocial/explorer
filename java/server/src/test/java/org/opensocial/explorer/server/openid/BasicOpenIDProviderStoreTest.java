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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.Set;

import org.apache.wink.json4j.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.common.collect.Sets;

public class BasicOpenIDProviderStoreTest {
  private JSONObject empty;
  private JSONObject validProviders;
  private JSONObject invalidProviders;
  private OpenIDProvider provider1;
  private OpenIDProvider provider2;
  
  @Before
  public void setUp() throws Exception {
    empty = new JSONObject();
    JSONObject validJson = new JSONObject();
    JSONObject invalidJson = new JSONObject();
    validProviders = new JSONObject();
    invalidProviders = new JSONObject();
    provider1 = new OpenIDProvider("provider1", "Provider 1", "http://provider1.com", "http://provider1.com/image.png");
    provider2 = new OpenIDProvider("provider2", "Provider 2", "http://provider2.com", null);
    validJson.put(provider1.getId(), provider1.toJson());
    validJson.put(provider2.getId(), provider2.toJson());
    validProviders.put("providers", validJson);
    JSONObject provider3 = new JSONObject();
    provider3.put("url", "http://provider2.com");
    invalidJson.put("provider3", provider3);
    invalidProviders.put("providers", invalidJson);
  }

  @After
  public void tearDown() throws Exception {
    empty = null;
    validProviders = null;
    invalidProviders = null;
    provider1 = null;
    provider2 = null;
  }

  @Test
  public void testBasicOpenIDProviderStoreJSONObject() {
    new BasicOpenIDProviderStore(empty);
    new BasicOpenIDProviderStore(validProviders);
    new BasicOpenIDProviderStore(invalidProviders);
  }

  @Test
  public void testRemoveProvider() {
    OpenIDProviderStore store = new BasicOpenIDProviderStore(validProviders);
    store.removeProvider(provider1);
    assertEquals(Sets.newHashSet(provider2), store.getProviders());
    store = new BasicOpenIDProviderStore(empty);
    store.removeProvider(provider2);
    assertEquals(Sets.newHashSet(), store.getProviders());
  }

  @Test
  public void testAddProvider() {
    OpenIDProviderStore store = new BasicOpenIDProviderStore(empty);
    store.addProvider(provider1);
    store.addProvider(provider2);
    assertEquals(Sets.newHashSet(provider2, provider1), store.getProviders());
  }

  @Test
  public void testGetProviders() {
    OpenIDProviderStore providerStore = new BasicOpenIDProviderStore(empty);
    assertEquals(Sets.newHashSet(), providerStore.getProviders());
    providerStore = new BasicOpenIDProviderStore(validProviders);
    assertEquals(Sets.newHashSet(provider1, provider2), providerStore.getProviders());
    providerStore = new BasicOpenIDProviderStore(invalidProviders);
    assertEquals(Sets.newHashSet(), providerStore.getProviders());
  }

}

