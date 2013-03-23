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

import java.io.IOException;

import org.apache.shindig.common.util.ResourceLoader;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.specserver.api.GadgetResource;
import org.opensocial.explorer.specserver.api.OnDiskResource;

/**
 * Default implementation of {@link GadgetResource} that expects all resources to be on disk via
 * {@link OnDiskResource}.
 */
public class DefaultGadgetResource implements GadgetResource, OnDiskResource {

  protected String name;
  protected String path;
  protected String content;
  protected ContentType contentType;

  public DefaultGadgetResource(String name, String path) throws IOException {
    this(name);
    this.path = path;
    this.content = ResourceLoader.getContent(path);
  }

  protected DefaultGadgetResource(String name) {
    this.name = name;
    String extension = this.name.substring(this.name.lastIndexOf('.') + 1);
    this.contentType = ContentType.valueOf(extension.toUpperCase());
  }

  public String getName() {
    return name;
  }

  public String getPath() {
    return path;
  }

  public String getContent() {
    return content;
  }

  public JSONObject toJSON() throws JSONException {
    JSONObject json = new JSONObject();
    json.put(RESOURCE_NAME, getName());
    json.put(RESOURCE_CONTENT, getContent());
    return json;
  }

  public String getContentType() {
    return contentType.toString();
  }
}
