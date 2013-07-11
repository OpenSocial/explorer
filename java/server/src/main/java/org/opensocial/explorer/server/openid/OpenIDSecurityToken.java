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

import java.util.EnumSet;
import java.util.Map;

import org.apache.shindig.auth.AbstractSecurityToken;
import org.apache.shindig.auth.AuthenticationMode;
import org.openid4java.discovery.Identifier;

import com.google.caja.util.Maps;

/**
 * FIXME: doc this
 */
public final class OpenIDSecurityToken extends AbstractSecurityToken {

  private EnumSet<Keys> mapKeys;

  public OpenIDSecurityToken(Identifier identifier) {
    String id = identifier.getIdentifier();
    Map<String, String> values = Maps.newHashMap();
    values.put(Keys.VIEWER.getKey(), id);
    values.put(Keys.OWNER.getKey(), id);
    values.put(Keys.APP_ID.getKey(), "ose");
    values.put(Keys.APP_URL.getKey(), "ose");
    values.put(Keys.CONTAINER.getKey(), "default");
    values.put(Keys.DOMAIN.getKey(), "ose");

    this.mapKeys = EnumSet.allOf(Keys.class);
    this.mapKeys.add(Keys.VIEWER);
    this.mapKeys.add(Keys.OWNER);
    this.mapKeys.add(Keys.APP_ID);
    this.mapKeys.add(Keys.APP_URL);
    this.mapKeys.add(Keys.CONTAINER);
    this.mapKeys.add(Keys.DOMAIN);
    
    loadFromMap(values);
  }

  public String getAuthenticationMode() {
    return AuthenticationMode.SECURITY_TOKEN_URL_PARAMETER.name();
  }

  public String getUpdatedToken() {
    throw new UnsupportedOperationException("Not implemented");
  }

  public boolean isAnonymous() {
    return false;
  }

  @Override
  protected EnumSet<Keys> getMapKeys() {
    return this.mapKeys;
  }
}
