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

import org.apache.shindig.auth.AuthenticationMode;
import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openid4java.discovery.Identifier;

/**
 * @author <a href="mailto:dev@shindig.apache.org">Shindig Dev</a>
 * @version $Id: $
 */
public class OpenIDSecurityTokenTest {
  private Identifier mockIdentifier;
  private OpenIDSecurityToken token;

  @Before
  public void setUp() throws Exception {
    mockIdentifier = EasyMock.createMock(Identifier.class);
    EasyMock.expect(mockIdentifier.getIdentifier()).andReturn("someId");
    EasyMock.replay(mockIdentifier);
    token = new OpenIDSecurityToken(mockIdentifier);
  }

  @After
  public void tearDown() throws Exception {
    mockIdentifier = null;
    token = null;
  }

  @Test
  public void testGetAuthenticationMode() {
    assertEquals(AuthenticationMode.SECURITY_TOKEN_URL_PARAMETER.name(), token.getAuthenticationMode());
  }

  @Test(expected = UnsupportedOperationException.class)
  public void testGetUpdatedToken() {
    token.getUpdatedToken();
  }

  @Test
  public void testIsAnonymous() {
    assertEquals(false, token.isAnonymous());
  }

  @Test
  public void testGetOwnerId() {
    assertEquals("someId", token.getOwnerId());
  }

  @Test
  public void testGetViewerId() {
    assertEquals("someId", token.getViewerId());
  }

  @Test
  public void testGetAppId() {
    assertEquals("ose", token.getAppId());
  }

  @Test
  public void testGetDomain() {
    assertEquals("ose", token.getDomain());
  }

  @Test
  public void testGetContainer() {
    assertEquals("ose", token.getContainer());
  }

}

