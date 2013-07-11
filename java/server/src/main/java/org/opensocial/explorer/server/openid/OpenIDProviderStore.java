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

import java.util.Set;

import com.google.inject.ImplementedBy;

/**
 * Stores Open ID providers.
 */
@ImplementedBy(BasicOpenIDProviderStore.class)
public interface OpenIDProviderStore {

  /**
   * Adds an open ID provider.
   * @param provider The provider to add.
   */
  public void addProvider(OpenIDProvider provider);
  
  /**
   * Removes an open ID provider.
   * @param provider The provider to remove.
   */
  public void removeProvider(OpenIDProvider provider);
  
  /**
   * Gets a collection of providers.
   * @return A collection of providers.
   */
  public Set<OpenIDProvider> getProviders();
}

