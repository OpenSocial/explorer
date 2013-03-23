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

import org.apache.shindig.gadgets.oauth2.persistence.sample.InMemoryCache;

/**
 * An {@link InMemoryCache} that "cheats" and returns static OAuth2Client values. It will ignore
 * gadget URIs and only utilize the service name when returning client keys. This is done because in
 * the OpenSocial Explorer, a gadget URL will change because it contains a hash.
 * 
 * FIXME: Implement a real mechanism to handle dynamic gadget URIs
 */
public class CheatingMapCache extends InMemoryCache {

  @Override
  protected String getClientKey(String gadgetUri, String serviceName) {
    if (serviceName.equals("googleAPI")) {
      return serviceName;
    }
    return super.getClientKey(gadgetUri, serviceName);
  }

}
