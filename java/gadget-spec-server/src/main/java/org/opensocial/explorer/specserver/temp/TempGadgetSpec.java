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

import java.util.Map;

import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.specserver.DefaultGadgetSpec;
import org.opensocial.explorer.specserver.api.GadgetResource;
import org.opensocial.explorer.specserver.api.GadgetSpec;

/**
 * A temporary {@link GadgetSpec} that exists in memory only.
 * 
 * Temporary gadget specs are transient and won't be available across server restarts. These
 * temporary specs are used when users make changes to gadgets client-side and want to test those
 * changes.
 * 
 * TODO: The abstraction is broken (or at least muddled) here because there are several methods that
 * simply throw UnsupportedOperationExceptions.
 */
public class TempGadgetSpec extends DefaultGadgetSpec {

  public TempGadgetSpec(GadgetResource gadgetResource, Map<String, GadgetResource> cssResources,
          Map<String, GadgetResource> jsResources, Map<String, GadgetResource> htmlResources) {
    super(gadgetResource, cssResources, jsResources, htmlResources);
  }

  public static GadgetSpec parse(JSONObject json) throws JSONException {
    Map<String, GadgetResource> cssResources, jsResources, htmlResources;

    JSONArray css = json.getJSONArray(CSS_RESOURCES);
    cssResources = TempGadgetResource.parse(css);

    JSONArray js = json.getJSONArray(JS_RESOURCES);
    jsResources = TempGadgetResource.parse(js);

    JSONArray html = json.getJSONArray(HTML_RESOURCES);
    htmlResources = TempGadgetResource.parse(html);

    JSONObject gadget = json.getJSONObject(GADGET_RESOURCE);
    GadgetResource gadgetResource = TempGadgetResource.parse(gadget);

    return new TempGadgetSpec(gadgetResource, cssResources, jsResources, htmlResources);
  }

  /**
   * @throws UnsupportedOperationException
   */
  public String getTitle() {
    throw new UnsupportedOperationException("Not implemented");
  }

  /**
   * @throws UnsupportedOperationException
   */
  public String getPathToSpec() {
    throw new UnsupportedOperationException("Not implemented");
  }

  public boolean isDefault() {
    return false;
  }

  /**
   * @throws UnsupportedOperationException
   */
  public void setDefault(boolean isDefault) {
    throw new UnsupportedOperationException("Not implemented");

  }
}
