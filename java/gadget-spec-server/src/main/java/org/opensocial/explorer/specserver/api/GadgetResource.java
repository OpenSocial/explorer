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

import org.opensocial.explorer.specserver.DefaultGadgetResource;

import com.google.inject.ImplementedBy;

/**
 * A resource referenced by a {@link GadgetSpec} that constitutes a portion of that gadget spec,
 * e.g., HTML, CSS, or JavaScript content.
 * 
 * @see {@link ContentType} for a full enumeration of the possible types.
 */
@ImplementedBy(DefaultGadgetResource.class)
public interface GadgetResource extends JSONSerializable {

  static final String RESOURCE_NAME = "name";
  static final String RESOURCE_CONTENT = "content";

  /**
   * @return the name of this resource
   */
  public String getName();

  /**
   * Returns the content of this resource. For example, if this is content of type CSS then this
   * will return the stylesheet.
   * 
   * @return the content for this resource
   */
  public String getContent();

  /**
   * Returns an IANA compliant string representation of the content type for the content of this
   * resource.
   * 
   * @return a string representation of the content type
   * @see {@link ContentType#toString()}
   */
  public String getContentType();

  /**
   * An enumeration of all supported {@link GadgetResource} content types.
   */
  public enum ContentType {
    CSS("text/css"), 
    JS("application/javascript"), 
    HTML("text/html"), 
    XML("text/xml"), 
    TXT("text/plain"), 
    JSON("application/json");

    private final String contentType;

    private ContentType(String contentType) {
      this.contentType = contentType;
    }

    /**
     * Returns an IANA compliant string representation of this content type.
     */
    public String toString() {
      return this.contentType;
    }
  }
}
