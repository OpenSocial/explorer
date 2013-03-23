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
package org.opensocial.explorer.specserver.temp;

import java.util.Iterator;
import java.util.Map;

import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.specserver.DefaultGadgetResource;
import org.opensocial.explorer.specserver.api.GadgetResource;
import org.opensocial.explorer.specserver.api.OnDiskResource;

import com.google.common.collect.Maps;

/**
 * A temporary {@link GadgetResource} that exists in memory only.
 * 
 * Temporary gadget resources are transient and won't be available across server restarts. These
 * temporary resources are used when users make changes to gadget resources client-side and want to
 * test those changes.
 */
public class TempGadgetResource extends DefaultGadgetResource {

  public TempGadgetResource(String name, String content) {
    super(name);
    this.content = content;
  }

  public static GadgetResource parse(JSONObject json) throws JSONException {
    String name = json.getString(RESOURCE_NAME);
    String content = json.getString(RESOURCE_CONTENT);
    return new TempGadgetResource(name, content);
  }

  public static Map<String, GadgetResource> parse(JSONArray json) throws JSONException {
    Map<String, GadgetResource> resourceMap = Maps.newHashMap();
    Iterator itr = json.iterator();
    Object obj;
    GadgetResource resource;
    while (itr.hasNext()) {
      obj = itr.next();
      if (obj instanceof JSONObject) {
        resource = parse((JSONObject) obj);
        resourceMap.put(resource.getContent(), resource);
      }
    }
    return resourceMap;
  }

  /**
   * TODO: The abstraction is broken here because this extends {@link DefaultGadgetResource} but
   * isn't an {@link OnDiskResource}.
   * 
   * @throws UnsupportedOperationException
   *           because temporary resources don't exist on disk
   */
  public String getPath() {
    throw new UnsupportedOperationException("Not implemented");
  }
}
