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
package org.opensocial.explorer.server.security;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createNiceMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.junit.Assert.*;

import java.util.Map;

import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.auth.SecurityTokenCodec;
import org.apache.shindig.auth.SecurityTokenException;
import org.junit.Before;
import org.junit.Test;

import com.google.caja.util.Maps;

public class OSEAuthConfigContributorTest {

  private OSEAuthConfigContributor contrib, exceptionContrib;

  @Before
  public void setup() throws Exception {
    SecurityTokenCodec codec = createNiceMock(SecurityTokenCodec.class);
    expect(codec.encodeToken(anyObject(SecurityToken.class))).andReturn("IAmASecurityToken")
            .anyTimes();
    replay(codec);
    this.contrib = new OSEAuthConfigContributor(codec);

    SecurityTokenCodec exceptionCodec = createNiceMock(SecurityTokenCodec.class);
    expect(exceptionCodec.encodeToken(anyObject(SecurityToken.class))).andThrow(
            new SecurityTokenException("Catch me!")).anyTimes();
    replay(exceptionCodec);
    this.exceptionContrib = new OSEAuthConfigContributor(exceptionCodec);
  }

  @Test
  @SuppressWarnings("unchecked")
  public void testContribute() {
    Map<String, Object> config = Maps.newHashMap();
    this.contrib.contribute(config, "container", "localhost");
    Object authConfig = config.get("shindig.auth");
    assertNotNull("Auth config was added", authConfig);
    assertTrue(authConfig instanceof Map);
    assertNotNull("Auth token was not null", ((Map<String, String>) authConfig).get("authToken"));
    assertEquals("Correct auth token was added", "IAmASecurityToken",
            ((Map<String, String>) authConfig).get("authToken"));
  }

  @Test
  @SuppressWarnings("unchecked")
  public void testContributeWithException() {
    Map<String, Object> config = Maps.newHashMap();
    this.exceptionContrib.contribute(config, "container", "localhost");
    Object authConfig = config.get("shindig.auth");
    assertNotNull("Auth config was added", authConfig);
    assertTrue(authConfig instanceof Map);
    assertNull("Auth token was null", ((Map<String, String>) authConfig).get("authToken"));
  }
}
