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

import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.specserver.DefaultGadgetRegistry;

import com.google.inject.ImplementedBy;

/**
 * A registry of {@link GadgetSpec} objects. This is a static registry that provides no mechanisms
 * for runtime changes to its contents.
 */
@ImplementedBy(DefaultGadgetRegistry.class)
public interface GadgetRegistry {

  /**
   * Returns the default {@link GadgetSpec} object. This is the gadget spec that will be rendered
   * first on the client-side.
   * 
   * @return the default {@link GadgetSpec}
   */
  public GadgetSpec getDefaultGadget();

  /**
   * Returns a {@link JSONArray} tree representation of the gadget specs in the registry.
   * 
   * @return a {@link JSONArray} tree
   */
  public JSONArray getSpecTree();

  /**
   * Returns information for a specific {@link GadgetSpec} given its <code>id</code>
   * 
   * @param id
   *          the id of the {@link GadgetSpec}
   * @return a {@link GadgetSpec} such that <code>GadgetSpec.getId().equals(id)</code>
   */
  public GadgetSpec getGadgetSpec(String id);

}
