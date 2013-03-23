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

import java.io.IOException;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.specserver.api.GadgetRegistry;
import org.opensocial.explorer.specserver.api.GadgetResource;
import org.opensocial.explorer.specserver.api.GadgetSpec;
import org.opensocial.explorer.specserver.api.JSONSerializable;
import org.opensocial.explorer.specserver.temp.TempGadgetSpec;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Maps;
import com.google.inject.Inject;

/**
 * A servlet used for accessing and manipulating {@link GadgetSpec} objects in the
 * {@link GadgetRegistry}.
 * 
 * <pre>
 * GET /gadgetspec/specTree
 * - Returns a JSON representation of the {@link GadgetRegistry}. 
 * - @see {@link GadgetRegistry#getSpecTree()}
 * 
 * GET /gadgetspec/default
 * - Returns a JSON representation of the default {@link GadgetSpec}
 * - @see {@link GadgetRegistry#getDefaultGadget()}
 * 
 * GET /gadgetspec/{id}[/{resource}]
 * - If no {resource} name is provided, this returns a JSON representation of the {@link GadgetSpec} whose ID is {id}
 * - If a {resource} name is provided, this returns the resource given by {resource} for the {@link GadgetSpec} whose ID is {id}
 * 
 * POST /gadgetspec
 * - Creates a new temporary {@link GadgetSpec} with from the JSON POST data.
 * - @see {@link TempGadgetSpec}
 * - @see {@link #doPost(HttpServletRequest, HttpServletResponse)}
 * 
 * </pre>
 */
public class GadgetSpecServlet extends ExplorerInjectedServlet {
  private static final long serialVersionUID = -6848715863895692189L;
  private static final String CLASS = GadgetSpecServlet.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  private GadgetRegistry registry;
  private Map<String, GadgetSpec> tempSpecs = Maps.newConcurrentMap();

  @Inject
  public void setRegistry(GadgetRegistry registry) {
    checkInitialized();
    this.registry = registry;
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
          IOException {
    final String method = "doGet";

    // Enforce an ID
    String[] paths = getPaths(req);
    if (paths.length == 0) {
      resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "The request must specify a gadget id.");
      return;
    }
    String specId = paths[0];

    if ("specTree".equals(specId)) { // /gadgetspec/specTree
      String specTree = registry.getSpecTree().toString();
      resp.setContentLength(specTree.length());
      resp.setContentType(JSON_CONTENT_TYPE);
      
      PrintWriter writer = resp.getWriter();
      writer.print(specTree);
      writer.flush();
      return;
    }

    if ("default".equalsIgnoreCase(specId)) { // /gadgetspec/default
      GadgetSpec spec = registry.getDefaultGadget();
      if (spec == null) {
        resp.sendError(HttpServletResponse.SC_NOT_FOUND, "No default gadget spec was found.");
      } else {
        returnJSONResult(spec, resp);
      }
      return;
    }

    // /gadgetspec/{id}[/{resource}]
    GadgetSpec spec;
    // Check the tempSpecs first then go to the registry
    if (this.tempSpecs.containsKey(specId)) {
      spec = this.tempSpecs.get(specId);
    } else {
      spec = registry.getGadgetSpec(specId);
    }

    if (spec == null) {
      resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Gadget spec with ID {" + specId
              + "} was not found.");
      return;
    }

    // Check to see if resources are being requested through this servlet
    if (paths.length > 1) {
      String resourceName = paths[1];
      GadgetResource resource = findResource(spec, resourceName);
      if (resource != null) {
        returnResource(resource, resp);
      } else {
        // 404 - Not Found
        resp.sendError(HttpServletResponse.SC_NOT_FOUND, resourceName + " was not found");
      }
    } else {
      // No resources being requested, just the spec. Return it.
      returnJSONResult(spec, resp);
    }
  }

  /**
   * Servlet to POST a gadget to the server so it can be served back up and rendered. The POST body
   * should be JSON and be modeled after the following sample.
   * 
   * <pre>
   * { 
   *  "cssResources":[ 
   *    {
   *      "content":<css content string>, 
   *      "name":<css filename string> 
   *    } 
   *  ], 
   *  "jsResources":[ 
   *    {
   *      "content":<js content string>, 
   *      "name":<js filename string> 
   *    } 
   *  ], 
   *  "gadgetResource":{
   *    "content":<gadget content string>, 
   *    "name":<gadget filename string> 
   *  }, 
   *  "htmlResources":[ 
   *    {
   *      "content":<html content string>, 
   *      "name":<html filename string> 
   *    } 
   *  ] 
   * }
   * </pre>
   */
  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
          IOException {

    // Enforce request content type as JSON
    if (!req.getContentType().startsWith(JSON_CONTENT_TYPE)) {
      resp.sendError(HttpURLConnection.HTTP_BAD_REQUEST,
              "The request content-type must be application/json.");
      return;
    }
    String jsonString = getRequestBody(req);
    PrintWriter writer = null;
    try {
      JSONObject json = new JSONObject(jsonString);
      GadgetSpec tempSpec = TempGadgetSpec.parse(json);
      String tempSpecId = tempSpec.getId();
      this.tempSpecs.put(tempSpecId, tempSpec);

      // Respond with the ID of the temp spec
      JSONObject respObj = new JSONObject();
      respObj.put(GadgetSpec.SPEC_ID, tempSpecId);
      
      resp.setContentType(JSON_CONTENT_TYPE);
      
      writer = resp.getWriter();
      writer.print(respObj.toString());
    } catch (JSONException e) {
      resp.sendError(HttpURLConnection.HTTP_BAD_REQUEST,
              "Invalid JSON object: " + e.getLocalizedMessage());
    } finally {
      if (writer != null) {
        writer.flush();
      }
    }
  }

  @VisibleForTesting
  GadgetResource findResource(GadgetSpec spec, String resourceName) {
    Map<String, GadgetResource> resources = null;
    if (resourceName.endsWith(".js")) {
      resources = spec.getJsResources();
    } else if (resourceName.endsWith(".html")) {
      resources = spec.getHtmlResources();
    } else if (resourceName.endsWith(".css")) {
      resources = spec.getCssResources();
    } else if (resourceName.endsWith(".xml")
            && spec.getGadgetResource().getName().equals(resourceName)) {
      // Just return the gadget resource
      return spec.getGadgetResource();
    } else {
      LOG.warning("Unknown resource type: " + resourceName);
      return null;
    }

    if (resources == null) {
      // We didn't find any resources of the given type
      return null;
    }

    Iterator<Entry<String, GadgetResource>> itr = resources.entrySet().iterator();
    Entry<String, GadgetResource> entry;
    GadgetResource resource = null;
    while (itr.hasNext()) {
      entry = itr.next();
      resource = entry.getValue();
      if (resource.getName().equals(resourceName)) {
        break;
      }
    }
    return resource;
  }

  private void returnJSONResult(JSONSerializable spec, HttpServletResponse resp) throws IOException {
    final String method = "returnJSONResult";
    PrintWriter writer = null;
    try {
      String specString = spec.toJSON().toString();
      resp.setContentLength(specString.length());
      resp.setContentType(JSON_CONTENT_TYPE);
      
      writer = resp.getWriter();
      writer.print(specString);
    } catch (Exception e) {
      LOG.logp(Level.WARNING, CLASS, method, "An exception occurred returning a JSON result", e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    } finally {
      if (writer != null) {
        writer.flush();
      }
    }
  }

  private void returnResource(GadgetResource resource, HttpServletResponse resp) throws IOException {
    final String method = "returnResource";
    PrintWriter writer = null;
    try {

      String content = resource.getContent();
      resp.setContentLength(content.length());
      resp.setContentType(resource.getContentType());
     
      writer = resp.getWriter(); 
      writer.print(content);
    } catch (Exception e) {
      LOG.logp(Level.WARNING, CLASS, method, e.getMessage(), e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    } finally {
      if (writer != null) {
        writer.flush();
      }
    }
  }
}
