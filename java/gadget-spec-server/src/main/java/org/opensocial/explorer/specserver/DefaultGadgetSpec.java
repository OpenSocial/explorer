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
import java.util.HashMap;
import java.util.Map;

import org.apache.shindig.common.util.ResourceLoader;
import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.specserver.api.GadgetResource;
import org.opensocial.explorer.specserver.api.GadgetSpec;

import com.google.common.base.Objects;

/**
 * Default implementation of {@link GadgetSpec} that uses {@link DefaultGadgetResource} objects to
 * manage the gadget's resources.
 */
public class DefaultGadgetSpec implements GadgetSpec {

  private String pathToSpec;
  private boolean isDefault;
  protected GadgetResource gadgetResource, eeResource;
  protected Map<String, GadgetResource> cssResources, htmlResources, jsResources;
  private JSONObject specJson;
  private String title;

  public DefaultGadgetSpec(String pathToSpec) throws IOException, JSONException, GadgetSpecLoadingException {
    this.pathToSpec = pathToSpec;
    loadSpec(pathToSpec);
  }

  // Used to create temporary gadget specs in memory
  protected DefaultGadgetSpec(GadgetResource gadgetXml, Map<String, GadgetResource> cssResources,
          Map<String, GadgetResource> jsResources, Map<String, GadgetResource> htmlResources) {
    this.gadgetResource = gadgetXml;
    this.cssResources = cssResources;
    this.jsResources = jsResources;
    this.htmlResources = htmlResources;
  }

  private void loadSpec(String pathToSpec) throws IOException, JSONException, GadgetSpecLoadingException {
    String content = ResourceLoader.getContent(pathToSpec);
    if (!pathToSpec.endsWith("/spec.json")) {
      throw new IllegalArgumentException("Path does not end with \"spec.json\"");
    }

    // FIXME: 9 is a magic number.
    // TODO: Make these strings constants
    String path = pathToSpec.substring(0, pathToSpec.length() - 9);
    specJson = new JSONObject(content);
    if (!specJson.containsKey("gadget")) {
      throw new GadgetSpecLoadingException("Spec does not contain a gadget XML resource.");
    }
    gadgetResource = new DefaultGadgetResource(specJson.getString("gadget"), path
            + specJson.getString("gadget"));

    if (!specJson.containsKey("title")) {
      throw new GadgetSpecLoadingException("Spec does not contain a title.");
    }
    title = specJson.getString("title");

    if (specJson.containsKey("cssFiles")) {
      cssResources = createResources(specJson.getJSONArray("cssFiles"), path);
    }

    if (specJson.containsKey("jsFiles")) {
      jsResources = createResources(specJson.getJSONArray("jsFiles"), path);
    }

    if (specJson.containsKey("htmlFiles")) {
      htmlResources = createResources(specJson.getJSONArray("htmlFiles"), path);
    }

    if (specJson.containsKey("isDefault")) {
      isDefault = specJson.getBoolean("isDefault");
    }

    if (specJson.containsKey("eeDataModel")) {
      eeResource = new DefaultGadgetResource(specJson.getString("eeDataModel"), path
              + specJson.getString("eeDataModel"));
    }

  }

  public String getTitle() {
    return title;
  }

  public String getPathToSpec() {
    return pathToSpec;
  }

  public boolean isDefault() {
    return isDefault;
  }

  private Map<String, GadgetResource> createResources(JSONArray jsonArray, String path)
          throws IOException {
    Object[] objs = jsonArray.toArray();
    Map<String, GadgetResource> resources = new HashMap<String, GadgetResource>(objs.length);
    String s;
    for (int i = 0; i < objs.length; i++) {
      s = (String) objs[i];
      resources.put(s, new DefaultGadgetResource(s, path + s));
    }
    return resources;
  }

  @Override
  public String toString() {
    return specJson.toString(true);
  }

  public GadgetResource getGadgetResource() {
    return gadgetResource;
  }

  public GadgetResource getEEResource() {
    return eeResource;
  }

  public Map<String, GadgetResource> getCssResources() {
    return cssResources;
  }

  public Map<String, GadgetResource> getHtmlResources() {
    return htmlResources;
  }

  public Map<String, GadgetResource> getJsResources() {
    return jsResources;
  }

  public void setDefault(boolean isDefault) {
    this.isDefault = isDefault;
  }

  public JSONObject toJSON() throws JSONException {
    JSONObject json = new JSONObject();
    json.put(SPEC_ID, getId());
    json.put(GADGET_RESOURCE, getGadgetResource().toJSON());
    if (getCssResources() != null) {
      json.put(CSS_RESOURCES, mapToJSONArray(getCssResources()));
    }
    if (getJsResources() != null) {
      json.put(JS_RESOURCES, mapToJSONArray(getJsResources()));
    }
    if (getHtmlResources() != null) {
      json.put(HTML_RESOURCES, mapToJSONArray(getHtmlResources()));
    }
    if (getEEResource() != null) {
      json.put(EE_RESOURCE, getEEResource().toJSON());
    }
    return json;
  }

  private JSONArray mapToJSONArray(Map<String, GadgetResource> map) throws JSONException {
    JSONArray array = new JSONArray();
    for (GadgetResource resource : map.values()) {
      array.put(resource.toJSON());
    }
    return array;
  }

  public String getId() {
    return String.valueOf(Objects.hashCode(this.gadgetResource, this.cssResources,
            this.htmlResources, this.jsResources));
  }
}
