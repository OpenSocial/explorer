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

import java.util.Map;

import org.opensocial.explorer.specserver.DefaultGadgetSpec;

import com.google.inject.ImplementedBy;

/**
 * A specification of an OpenSocial gadget in the OpenSocial Explorer application. This class
 * defines a gadget and all metadata and resources it needs to render.
 */
@ImplementedBy(DefaultGadgetSpec.class)
public interface GadgetSpec extends JSONSerializable {

  static final String HTML_RESOURCES = "htmlResources";
  static final String JS_RESOURCES = "jsResources";
  static final String CSS_RESOURCES = "cssResources";
  static final String GADGET_RESOURCE = "gadgetResource";
  static final String EE_RESOURCE = "eeResource";
  static final String SPEC_ID = "id";
  static final String SPEC_TITLE = "title";

  /**
   * @return the title of the gadget
   */
  public String getTitle();

  /**
   * Returns the path to the specification of the gadget. By default this is on the classpath,
   * although overriding implementations could choose to load the spec from elsewhere.
   * 
   * @return the path to the specification of the gadget
   */
  public String getPathToSpec();

  /**
   * @return true iff this the default gadget
   * @see {@link GadgetRegistry#getDefaultGadget()}
   */
  public boolean isDefault();

  /**
   * Returns a {@link GadgetResource} of type text/xml that represents the XML specification of this
   * OpenSocial gadget. This MUST NOT return null.
   * 
   * @return a {@link GadgetResource} of type text/xml
   */
  public GadgetResource getGadgetResource();

  /**
   * Returns a Map of {@link GadgetResource} objects of type text/css that represents local CSS
   * resources used by the gadget at runtime. This can return null.
   * 
   * @return a Map of {@link GadgetResource} objects of type text/css or null if the gadget uses no
   *         local CSS resources
   */
  public Map<String, GadgetResource> getCssResources();

  /**
   * Returns a Map of {@link GadgetResource} objects of type text/html that represents local HTML
   * resources used by the gadget at runtime. This can return null.
   * 
   * @return a Map of {@link GadgetResource} objects of type text/html or null if the gadget uses no
   *         local HTML resources
   */
  public Map<String, GadgetResource> getHtmlResources();

  /**
   * Returns a Map of {@link GadgetResource} objects of type application/javascript that represents
   * local JavaScript resources used by the gadget at runtime. This can return null.
   * 
   * @return a Map of {@link GadgetResource} objects of type application/javascript or null if the
   *         gadget uses no local JavaScript resources
   */
  public Map<String, GadgetResource> getJsResources();

  /**
   * Returns a {@link GadgetResource} of type application/json that represents the EE data model
   * used by this OpenSocial gadget. This can return null.
   * 
   * @return a {@link GadgetResource} of type application/json or null if the gadget does not use EE
   */
  public GadgetResource getEEResource();

  /**
   * @param isDefault
   *          true to make this spec the default; false otherwise
   */
  public void setDefault(boolean isDefault);

  /**
   * @return the ID of this gadget specification
   */
  public String getId();

}
