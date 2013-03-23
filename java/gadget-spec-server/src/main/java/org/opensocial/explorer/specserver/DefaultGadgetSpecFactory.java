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
package org.opensocial.explorer.specserver;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.opensocial.explorer.specserver.api.GadgetSpec;
import org.opensocial.explorer.specserver.api.GadgetSpecFactory;

/**
 * Default implementation of {@link GadgetSpecFactory} that creates {@link DefaultGadgetSpec}
 * objects at runtime.
 */
public class DefaultGadgetSpecFactory implements GadgetSpecFactory {
  
  private static final String CLASS = DefaultGadgetSpecFactory.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  private static final String METHOD = "create";
  
  public GadgetSpec create(String specPath) {
    GadgetSpec created = null;
    try {
      created = new DefaultGadgetSpec(specPath);
    } catch (Exception e) {
      LOG.logp(Level.SEVERE, CLASS, METHOD, e.getMessage(), e);
    }
    return created;
  }

}

