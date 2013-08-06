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
package org.opensocial.explorer.server.openid;

import org.apache.shindig.common.Nullable;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;

import com.google.common.base.Objects;
import com.google.common.base.Preconditions;

/**
 * Represents a provider.
 */
public class OpenIDProvider {
  private String name;
  private String url;
  private String image;
  private String id;
  
  /**
   * Constructs a provider.
   * @param id The id of the provider.
   * @param name The name of the provider.
   * @param url The URL to log in to the provider
   * @param image The URL to the image representing the provider.
   */
  public OpenIDProvider(String id, String name, String url, @Nullable String image) {
    this.id = id;
    this.name = Preconditions.checkNotNull(name);
    this.url = Preconditions.checkNotNull(url);
    this.image = image;
  }

  /**
   * @return the id
   */
  public String getId() {
    return id;
  }

  /**
   * @param id the id to set
   */
  public void setId(String id) {
    this.id = Preconditions.checkNotNull(id);
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @param name the name to set
   */
  public void setName(String name) {
    this.name = Preconditions.checkNotNull(name);
  }

  /**
   * @return the url
   */
  public String getUrl() {
    return url;
  }

  /**
   * @param url the url to set
   */
  public void setUrl(String url) {
    this.url = Preconditions.checkNotNull(url);
  }

  /**
   * @return the image
   */
  public String getImage() {
    return image;
  }

  /**
   * @param image the image to set
   */
  public void setImage(String image) {
    this.image = image;
  }
  
  /**
   * Returns a JSON representation of the OpenIDProvider.
   * @return A JSON representation of the OpenIDProvider.
   * @throws JSONException Thrown if the JSON cannot be created.
   */
  public JSONObject toJson() throws JSONException {
    JSONObject json = new JSONObject();
    json.put("name", getName());
    json.put("url", getUrl());
    if(getImage() != null) {
      json.put("imageUrl", getImage());
    }
    return json;
  }

  /* (non-Javadoc)
   * @see java.lang.Object#hashCode()
   */
  @Override
  public int hashCode() {
    return Objects.hashCode(getId(), getName(), getUrl(), getImage());
  }

  /* (non-Javadoc)
   * @see java.lang.Object#equals(java.lang.Object)
   */
  @Override
  public boolean equals(Object obj) {
    if(obj instanceof OpenIDProvider) {
      OpenIDProvider test = (OpenIDProvider)obj;
      boolean result = Objects.equal(image, test.image) && Objects.equal(id, test.id)
              && Objects.equal(name, test.name) && Objects.equal(url, test.url);
      return result;
    } else {
      return false;
    }
  }
}

