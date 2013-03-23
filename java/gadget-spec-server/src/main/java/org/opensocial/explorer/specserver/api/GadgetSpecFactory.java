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
package org.opensocial.explorer.specserver.api;

import org.opensocial.explorer.specserver.DefaultGadgetSpecFactory;

import com.google.inject.ImplementedBy;

/**
 * A factory for {@link GadgetSpec} objects. This class should be used instead of creating
 * {@link GadgetSpec} objects manually.
 */
@ImplementedBy(DefaultGadgetSpecFactory.class)
public interface GadgetSpecFactory {

  /**
   * Creates a {@link GadgetSpec} given the path to the specification. By default the path is
   * assumed to be on the classpath.
   * 
   * @param specPath
   *          the patch to the gadget specification
   * @return a new {@link GadgetSpec}, or null if errors occurred
   */
  public GadgetSpec create(String specPath);
}

