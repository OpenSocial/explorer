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
package org.opensocial.explorer.specserver.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.shindig.common.servlet.InjectedServlet;
import org.apache.shindig.gadgets.http.HttpResponse;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;

import com.google.common.base.Splitter;
import com.google.common.collect.Iterables;

/**
 * An abstract class that provides some helpers for servlets in the OpenSocial Explorer
 */
public abstract class ExplorerInjectedServlet extends InjectedServlet {
  protected static final String JSON_CONTENT_TYPE = "application/json";
  protected static final String HTML_CONTENT_TYPE = "text/html";

  private static final long serialVersionUID = 5905320989280705219L;
  private static final Splitter PATH_SPLITTER = Splitter.on('/').trimResults().omitEmptyStrings();

  public ExplorerInjectedServlet() {
    super();
  }

  protected String getRequestBody(HttpServletRequest req) throws IOException {
    StringBuffer buff = new StringBuffer();
    String line = null;
    BufferedReader reader = req.getReader();
    while ((line = reader.readLine()) != null) {
      buff.append(line);
    }
    return buff.toString();
  }

  protected String[] getPaths(HttpServletRequest req) {
    String path = req.getPathInfo();
    if (path == null) {
      return new String[0];
    }
    Iterable<String> splitPath = PATH_SPLITTER.split(path);
    return Iterables.toArray(splitPath, String.class);
  }

  protected JSONObject parseResponseToJson(HttpResponse response) throws JSONException, IllegalStateException, IOException {
    BufferedReader reader = new BufferedReader(new InputStreamReader(response.getResponse(), "UTF-8"));
    StringBuilder builder = new StringBuilder();
    for (String line = null; (line = reader.readLine()) != null;) {
        builder.append(line).append("\n");
    }
    reader.close();
    return new JSONObject(builder.toString());
  }
  

  protected String parseResponseToString(HttpResponse response) throws IOException {
    BufferedReader reader = new BufferedReader(new InputStreamReader(response.getResponse(), "UTF-8"));
    StringBuilder builder = new StringBuilder();
    for (String line = null; (line = reader.readLine()) != null;) {
        builder.append(line);
    }
    
    reader.close();
    return builder.toString();
  }
  
  protected Map<String, String> splitQuery(HttpResponse response) throws IOException, UnsupportedEncodingException {
    String query = this.parseResponseToString(response);

    Map<String, String> query_pairs = new LinkedHashMap<String, String>();
    String[] pairs = query.split("&");
    for (String pair : pairs) {
      int index = pair.indexOf("=");
      if(index == -1) {
        throw new UnsupportedEncodingException();
      }
      query_pairs.put(URLDecoder.decode(pair.substring(0, index), "UTF-8"), URLDecoder.decode(pair.substring(index + 1), "UTF-8"));
    }
    return query_pairs;
  }
}
