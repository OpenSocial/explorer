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

import static org.easymock.EasyMock.anyBoolean;
import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createNiceMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.Map;

import org.apache.shindig.auth.AnonymousSecurityToken;
import org.apache.shindig.auth.AuthenticationMode;
import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.auth.SecurityTokenException;
import org.apache.shindig.config.ContainerConfig;
import org.apache.shindig.config.ContainerConfig.ConfigObserver;
import org.junit.Before;
import org.junit.Test;

import com.google.caja.util.Lists;
import com.google.common.collect.Maps;

public class OSESecurityTokenCodecTest {

  private OSESecurityTokenCodec codec;

  @Before
  public void setup() {
    ContainerConfig mockConfig = createNiceMock(ContainerConfig.class);
    expect(mockConfig.getContainers()).andReturn(Lists.newLinkedList("secure", "insecure"))
            .anyTimes();
    expect(mockConfig.getString("secure", "gadgets.securityTokenType")).andReturn("secure")
            .anyTimes();
    expect(mockConfig.getString("insecure", "gadgets.securityTokenType")).andReturn("insecure")
            .anyTimes();
    expect(mockConfig.getString("secure", "gadgets.securityTokenKey")).andReturn(
            "IAmATokenKeyWithAtLeast16Bytes").anyTimes();
    mockConfig.addConfigObserver(anyObject(ConfigObserver.class), anyBoolean());
    expectLastCall().anyTimes();
    replay(mockConfig);
    this.codec = new OSESecurityTokenCodec(mockConfig);
  }

  @Test
  public void testCreateTokenSecure() throws Exception {
    // CONSIDER: Is there a better way to test this?
    Map<String, String> tokenParams = Maps.newHashMapWithExpectedSize(1);
    tokenParams.put("token", "secure:this-is-encrypted-garbage");
    try {
      this.codec.createToken(tokenParams);
      fail("Exected a SecurityTokenException");
    } catch (SecurityTokenException e) {
      assertTrue("Exception is about the format", e.getMessage().contains("format"));
      // Pass
    }
  }

  @Test
  public void testCreateTokenInsecure() throws Exception {
    Map<String, String> tokenParams = Maps.newHashMapWithExpectedSize(1);
    tokenParams.put("token", "viewer:owner:appid:domain:appurl:0:insecure");
    SecurityToken token = this.codec.createToken(tokenParams);
    assertEquals("token's contianer matches what was given", "insecure", token.getContainer());
  }

  @Test
  public void testCreateTokenUnknownContainer() throws Exception {
    Map<String, String> tokenParams = Maps.newHashMapWithExpectedSize(1);
    tokenParams.put("token", "viewer:owner:appid:domain:appurl:0:unknown");
    try {
      this.codec.createToken(tokenParams);
      fail("Expected an exception to be thrown because of unknown container");
    } catch (Exception e) {
      // Pass
    }
  }

  @Test
  public void testEncodeTokenSecure() throws Exception {
    SecurityToken token = createNiceMock(SecurityToken.class);
    expect(token.getContainer()).andReturn("secure").anyTimes();
    expect(token.getAuthenticationMode()).andReturn(
            AuthenticationMode.SECURITY_TOKEN_URL_PARAMETER.name()).anyTimes();
    replay(token);
    String encodedToken = this.codec.encodeToken(token);
    assertTrue("The token string contains the container we put in", encodedToken.contains("secure"));
    assertTrue(encodedToken.split(":").length == 2);
  }

  @Test
  public void testEncodeTokenInsecure() throws Exception {
    SecurityToken token = new AnonymousSecurityToken("insecure", 0L, "*");
    String encodedToken = this.codec.encodeToken(token);
    assertTrue("The token string contains the container we put in",
            encodedToken.contains("insecure"));
    assertTrue(encodedToken.split(":").length > 2);
  }

  @Test
  public void testEncodeTokenUnknown() throws Exception {
    SecurityToken token = createNiceMock(SecurityToken.class);
    expect(token.getContainer()).andReturn("unknown");
    replay(token);
    try {
      this.codec.encodeToken(token);
      fail("Expected an exception to be thrown because of unknown container");
    } catch (Exception e) {
      // Pass
    }
  }

  @Test
  public void testEncodeTokenNull() throws Exception {
    assertNull("Null token in gets null string out", this.codec.encodeToken(null));
  }

  @Test
  public void testGetCodecByType() throws Exception {
    assertSame("The secure codec is a singleton", this.codec.getCodecByType("secure"),
            this.codec.getCodecByType("secure"));
    assertSame("The insecure codec is a singleton", this.codec.getCodecByType("insecure"),
            this.codec.getCodecByType("insecure"));
  }

  @Test
  public void testGetCodecByTypeUnknown() throws Exception {
    try {
      this.codec.getCodecByType("unknown");
      fail("Expected an exception");
    } catch (Exception e) {
      // Pass
    }
  }
}
