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

import org.apache.shindig.gadgets.oauth2.OAuth2Accessor;
import org.apache.shindig.gadgets.oauth2.OAuth2CallbackState;
import org.apache.shindig.gadgets.oauth2.OAuth2Token.Type;
import org.apache.shindig.gadgets.oauth2.persistence.sample.InMemoryCache;

/**
 * An in-memory cache for OAuth 2.0.  In the cache we do not use the gadget URLs in the keys.
 * This allows us to reuse OAuth 2.0 accessors, tokens, and client info for multiple
 * gadgets.  Not something you would want to do for production containers but is suitable for
 * development containers like the OpenSocial Explorer. 
 */
public class OSEInMemoryCache extends InMemoryCache {

  @Override
  protected String getClientKey(String gadgetUri, String serviceName) {
    //By default the key consists of the gadget URI and the service name
    return serviceName;
  }

  @Override
  protected String getTokenKey(String gadgetUri, String serviceName, String user, String scope,
          Type type) {
    if(serviceName == null || user == null) {
      return null;
    }
    String s = scope == null ? "" : scope;
    String t = type.name();
    return serviceName + ":" + user + ":" + s + ":" + t;
  }

  //TODO Remove this once we get the proper visibility in MapCache
  @Override
  protected String getAccessorKey(OAuth2CallbackState state) {
    return this.getAccessorKey(state.getGadgetUri(), state.getServiceName(), state.getUser(),
            state.getScope());
  }

  //TODO Remove this once we get the proper visibility in MapCache
  @Override
  protected String getAccessorKey(OAuth2Accessor accessor) {
    return this.getAccessorKey(accessor.getGadgetUri(), accessor.getServiceName(),
            accessor.getUser(), accessor.getScope());
  }
  
  protected String getAccessorKey(final String gadgetUri, final String serviceName,
          final String user, final String scope) {
    if (serviceName == null || user == null) {
      return null;
    }
    final String s = scope == null ? "" : scope;
    return serviceName + ":" + user + ":" + s;
  }
}

