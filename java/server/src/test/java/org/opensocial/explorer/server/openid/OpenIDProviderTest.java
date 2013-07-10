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
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.common.base.Objects;

public class OpenIDProviderTest {
  
  private OpenIDProvider provider;
  private OpenIDProvider noIconProvider;

  @Before
  public void setUp() throws Exception {
    provider = new OpenIDProvider("id", "name", "url", "icon");
    noIconProvider = new OpenIDProvider("id", "name", "url", null);
  }

  @After
  public void tearDown() throws Exception {
    provider = null;
    noIconProvider = null;
  }

  @Test
  public void testHashCode() {
    assertEquals(Objects.hashCode("id", "name", "url", "icon"), provider.hashCode());
    assertFalse(Objects.hashCode("id1", "name", "url") == provider.hashCode());
    assertEquals(Objects.hashCode("id", "name", "url", null), noIconProvider.hashCode());
  }

  @Test(expected = NullPointerException.class)
  public void testOpenIDProvider() {
    new OpenIDProvider(null, null, null, null);
  }

  @Test
  public void testGetId() {
    assertEquals("id", provider.getId());
    assertEquals("id", noIconProvider.getId());
  }

  @Test
  public void testSetId() {
    provider.setId("new id");
    assertEquals("new id", provider.getId());
  }

  @Test
  public void testGetName() {
    assertEquals("name", provider.getName());
    assertEquals("name", noIconProvider.getName());
  }

  @Test
  public void testSetName() {
    provider.setName("new name");
    assertEquals("new name", provider.getName());
  }

  @Test
  public void testGetUrl() {
    assertEquals("url", provider.getUrl());
    assertEquals("url", noIconProvider.getUrl());
  }

  @Test
  public void testSetUrl() {
    provider.setUrl("new url");
    assertEquals("new url", provider.getUrl());
  }

  @Test
  public void testGetImage() {
    assertEquals("icon", provider.getImage());
    assertNull(noIconProvider.getImage());
  }

  @Test
  public void testSetImage() {
    provider.setImage(null);
    assertNull(provider.getImage());
  }

  @Test
  public void testToJson() throws JSONException {
    JSONObject json = new JSONObject();
    json.put("url", provider.getUrl());
    json.put("name", provider.getName());
    json.put("imageUrl", provider.getImage());
    assertEquals(json, provider.toJson());
  }

  @Test
  public void testEqualsObject() {
    assertFalse(provider.equals(noIconProvider));
    assertFalse(provider.equals(null));
    assertFalse(provider.equals("This is a test"));
    OpenIDProvider test = new OpenIDProvider("id", "name", "url", "icon");
    assertTrue(provider.equals(test));
    test = new OpenIDProvider("id", "name", "url", null);
    assertTrue(noIconProvider.equals(test));
  }

}

