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
package org.opensocial.explorer.server.config;

import java.util.Map;

import org.apache.shindig.auth.BlobCrypterSecurityTokenCodec;
import org.apache.shindig.auth.SecurityTokenCodec;
import org.apache.shindig.common.Nullable;
import org.apache.shindig.common.crypto.Crypto;
import org.apache.shindig.common.util.CharsetUtil;
import org.apache.shindig.config.ContainerConfigException;
import org.apache.shindig.config.JsonContainerConfig;
import org.apache.shindig.expressions.Expressions;

import com.google.common.collect.Maps;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

@Singleton
public class OSEContainerConfig extends JsonContainerConfig {

  private final Map<String, String> containerKeys;

  @Inject
  public OSEContainerConfig(@Named("shindig.containers.default") String containers,
                             @Nullable @Named("shindig.host") String host,
                             @Nullable @Named("shindig.port") String port,
                             @Nullable @Named("shindig.contextroot") String contextRoot,
                             Expressions expressions) throws ContainerConfigException {
    super(containers, host, port, contextRoot, expressions);
    this.containerKeys = Maps.newHashMap();
  }

  @Override
  public Object getProperty(String container, String property) {
    // FIXME: Shindig should allow me to do this by injecting my own BlobCrypter. Instead
    // BlobCrypterSecurityTokenCodec is tightly coupled to BasicBlobCrypter and BasicBlobCrypter
    // relies on BlobCrypterSecurityTokenCodec giving it a key when it is contructed.
    if (property.equals(BlobCrypterSecurityTokenCodec.SECURITY_TOKEN_KEY)) {
      return getEncryptionKey(container);
    }
    return super.getProperty(container, property);
  }

  private String getEncryptionKey(String container) {
    String key = this.containerKeys.get(container);
    if (key == null) {
      key = CharsetUtil.newUtf8String(Crypto.getRandomBytes(20));
      this.containerKeys.put(container, key);
    }
    return key;
  }
  
}
