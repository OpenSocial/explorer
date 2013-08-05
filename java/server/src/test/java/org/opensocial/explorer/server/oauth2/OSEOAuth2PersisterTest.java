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

import static org.easymock.EasyMock.createMock;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import java.util.Map;

import org.apache.shindig.common.servlet.Authority;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Encrypter;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2PersistenceException;
import org.apache.shindig.gadgets.oauth2.persistence.sample.OAuth2GadgetBinding;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class OSEOAuth2PersisterTest {
  
  private OSEOAuth2Persister persister;
  
  private JSONObject createBinding(String clientName, boolean allowModuleOverride) throws JSONException {
    JSONObject json = new JSONObject();
    json.put("clientName", clientName);
    json.put("allowModuleOverride", allowModuleOverride);
    return json;
  }
  
  private JSONObject createGadgetBindings() throws JSONException {
    JSONObject json = new JSONObject();
    json.put("binding1", createBinding("name1", true));
    json.put("binding2", createBinding("name2", false));
    return json;
  }
  
  private JSONObject createConfig() throws JSONException {
    JSONObject json = new JSONObject();
    json.put("gadgetBindings", createGadgetBindings());
    return json;
  }

  @Before
  public void setUp() throws Exception {
    this.persister = new OSEOAuth2Persister(createMock(OAuth2Encrypter.class), 
            createMock(Authority.class), "http://example.com/redirect", "ose");
    this.persister.setConfig(createConfig());
  }

  @After
  public void tearDown() throws Exception {
    persister = null;
  }

  @Test
  public void testLoadGadgetBindings() throws OAuth2PersistenceException {
    Map<String, OAuth2GadgetBinding> bindings = this.persister.loadGadgetBindings();
    assertEquals(new OAuth2GadgetBinding(null, "binding1", "name1", true), bindings.get("binding1"));
    assertEquals(new OAuth2GadgetBinding(null, "binding2", "name2", false), bindings.get("binding2"));
    assertNull(bindings.get("binding3"));
  }
}

