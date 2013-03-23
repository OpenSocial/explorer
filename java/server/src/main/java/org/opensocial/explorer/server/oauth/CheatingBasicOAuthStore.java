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
package org.opensocial.explorer.server.oauth;

import net.oauth.OAuthServiceProvider;

import org.apache.shindig.auth.ForwardingSecurityToken;
import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.gadgets.GadgetException;
import org.apache.shindig.gadgets.oauth.BasicOAuthStore;

import com.google.inject.Singleton;

/**
 * A {@link BasicOAuthStore} that "cheats" and returns static values given a service name. It
 * ignores the App URL on the security token. This is done because in the OpenSocial Explorer, a
 * gadget URL will change because it contains a hash.
 * 
 * FIXME: Implement a real mechanism that can handle dynamic gadget URLs
 */
@Singleton
public class CheatingBasicOAuthStore extends BasicOAuthStore {

  @Override
  public ConsumerInfo getConsumerKeyAndSecret(SecurityToken securityToken, final String serviceName,
          OAuthServiceProvider provider) throws GadgetException {
    SecurityToken cheatingSecurityToken = new ForwardingSecurityToken(securityToken) {
      @Override
      public String getAppUrl() {
        String appUrl = CheatingBasicOAuthStore.this.getAppUrl(serviceName);
        if (appUrl != null) {
          return appUrl;
        }
        return super.getAppUrl();
      }
    };
    return super.getConsumerKeyAndSecret(cheatingSecurityToken, serviceName, provider);
  }

  /**
   * Override this if you want to cheat at OAuth too.
   *
   * @param serviceName
   * @return
   */
  protected String getAppUrl(String serviceName) {
    if (serviceName.equals("YouTube")) {
      return "http://localhost/YouTube.xml";
    }
    return null;
  }
}

