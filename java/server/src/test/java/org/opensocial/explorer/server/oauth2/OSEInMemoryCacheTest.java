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

import static org.junit.Assert.*;

import org.apache.shindig.gadgets.oauth2.OAuth2Token.Type;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class OSEInMemoryCacheTest {

  private OSEInMemoryCache cache;
  
  @Before
  public void setUp() throws Exception {
    this.cache = new OSEInMemoryCache();
  }

  @After
  public void tearDown() throws Exception {
    this.cache = null;
  }

  @Test
  public void testGetClientKeyStringString() {
    String key = cache.getClientKey("http://example.com/gadget.xml", "myservice");
    assertEquals("myservice", key);
    key = cache.getClientKey(null, "myservicenull");
    assertEquals("myservicenull", key);
    key = cache.getClientKey(null, null);
    assertNull(key);
  }

  @Test
  public void testGetTokenKeyStringStringStringStringType() {
    String key = cache.getTokenKey("http://example.com", "myservice", "@me", "myscope", Type.ACCESS);
    assertEquals("myservice:@me:myscope:ACCESS", key);
    key = cache.getTokenKey("http://example.com", "myservice", "@me", null, Type.ACCESS);
    assertEquals("myservice:@me::ACCESS", key);
    key = cache.getTokenKey(null, "myservice", "@me", null, Type.ACCESS);
    assertEquals("myservice:@me::ACCESS", key);
    key = cache.getTokenKey(null, null, "@me", null, Type.ACCESS);
    assertNull(key);
    key = cache.getTokenKey(null, "myservice", null, null, Type.ACCESS);
    assertNull(key);
  }

  @Test
  public void testGetAccessorKeyStringStringStringString() {
    String key = cache.getAccessorKey("http://example.com/gadget.xml", "myservice", "@me", "scope");
    assertEquals("myservice:@me:scope", key);
    key = cache.getAccessorKey("http://example.com/gadget.xml", "myservice", "@me", null);
    assertEquals("myservice:@me:", key);
    key = cache.getAccessorKey("http://example.com/gadget.xml", "myservice", null, null);
    assertNull(key);
    key = cache.getAccessorKey("http://example.com/gadget.xml", null, "@me", null);
    assertNull(key);
  }

}

