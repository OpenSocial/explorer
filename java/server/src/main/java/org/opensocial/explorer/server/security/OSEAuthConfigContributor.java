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

import java.util.Map;

import org.apache.shindig.auth.AnonymousSecurityToken;
import org.apache.shindig.auth.AuthenticationMode;
import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.auth.SecurityTokenCodec;
import org.apache.shindig.auth.SecurityTokenException;
import org.apache.shindig.gadgets.config.ShindigAuthConfigContributor;

import com.google.common.collect.Maps;
import com.google.inject.Inject;

public class OSEAuthConfigContributor extends ShindigAuthConfigContributor {

  private SecurityTokenCodec securityTokenCodec;

  @Inject
  public OSEAuthConfigContributor(SecurityTokenCodec codec) {
    super(codec);
    this.securityTokenCodec = codec;
  }

  @Override
  public void contribute(Map<String, Object> config, String container, String host) {
    // FIXME: Shindig doesn't like feeding AnonymousSecurityTokens to the
    // BlobCrypterSecurityTokenCodec, so I fake it out by setting the authentication mode to
    // something other than UNAUTHENTICATED. Shindig needs to be fixed to remove the tight coupling
    // between codecs and token implementations.
    SecurityToken containerToken = new AnonymousSecurityToken(container, 0L, "*") {
      @Override
      public String getAuthenticationMode() {
        return AuthenticationMode.SECURITY_TOKEN_URL_PARAMETER.name();
      }
    };
    
    Map<String, String> authConfig = Maps.newHashMapWithExpectedSize(2);
    try {
      config.put("shindig.auth", authConfig);
      authConfig.put("authToken", securityTokenCodec.encodeToken(containerToken));
    } catch (SecurityTokenException e) {
      // CONSIDER: Ignore?
    }
  }
}
