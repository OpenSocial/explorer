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

import static org.easymock.EasyMock.*;
import static org.junit.Assert.*;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.easymock.EasyMock;
import org.easymock.IMocksControl;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.opensocial.explorer.specserver.api.GadgetRegistry;
import org.opensocial.explorer.specserver.api.GadgetResource;
import org.opensocial.explorer.specserver.api.GadgetSpec;
import org.opensocial.explorer.specserver.servlet.GadgetSpecServlet;
import org.powermock.reflect.Whitebox;

import com.google.common.collect.Maps;

public class GadgetSpecServletTest {

  private GadgetSpecServlet servlet;
  private HttpServletRequest request;
  private HttpServletResponse response;
  private GadgetRegistry registry;
  private IMocksControl niceControl = EasyMock.createNiceControl();
  private ByteArrayOutputStream stream = new ByteArrayOutputStream();
  private PrintWriter writer = new PrintWriter(stream);

  @Before
  public void setUp() throws Exception {
    servlet = new GadgetSpecServlet();
    request = niceControl.createMock(HttpServletRequest.class);

    response = niceControl.createMock(HttpServletResponse.class);

    registry = createMock(GadgetRegistry.class);
    servlet.setRegistry(registry);
  }

  @After
  public void tearDown() throws Exception {
    // Verify
    niceControl.verify();
    verify(registry);
  }

  /**
   * Test GET /gadgetspec/specTree
   * 
   * @throws Exception
   */
  @Test
  public void testGetSpecTree() throws Exception {
    expectRequestAndResponse("/specTree");
    niceControl.replay();

    JSONArray specTreeJson = new JSONArray();
    expect(registry.getSpecTree()).andReturn(specTreeJson);
    replay(registry);

    servlet.doGet(request, response);

    assertEquals(specTreeJson, new JSONArray(getWriterOutput()));
  }

  /**
   * Test GET /gadgetspec/default
   * 
   * @throws Exception
   */
  @Test
  public void testGetDefaultSpec() throws Exception {
    expectRequestAndResponse("/default");
    niceControl.replay();

    GadgetSpec mockSpec = createMock(GadgetSpec.class);
    JSONObject defaultGadgetJson = new JSONObject("{'foo':'bar'}");
    expect(mockSpec.toJSON()).andReturn(defaultGadgetJson);

    expect(registry.getDefaultGadget()).andReturn(mockSpec);
    replay(registry, mockSpec);

    servlet.doGet(request, response);

    verify(mockSpec);

    assertEquals(defaultGadgetJson, new JSONObject(getWriterOutput()));
  }

  /**
   * Test GET /gadgetspec/{id}
   * 
   * @throws Exception
   */
  @Test
  public void testGetSpecById() throws Exception {
    expectRequestAndResponse("/-1");
    niceControl.replay();

    GadgetSpec mockSpec = createMock(GadgetSpec.class);
    JSONObject defaultGadgetJson = new JSONObject("{'foo':'bar'}");
    expect(mockSpec.toJSON()).andReturn(defaultGadgetJson);

    expect(registry.getGadgetSpec("-1")).andReturn(mockSpec);
    replay(registry, mockSpec);

    servlet.doGet(request, response);

    verify(mockSpec);

    assertEquals(defaultGadgetJson, new JSONObject(getWriterOutput()));
  }

  /**
   * Test GET /gadgetspec/{id}/{resourceName}
   * 
   * @throws Exception
   */
  @Test
  public void testGetResourceById() throws Exception {
    expectRequestAndResponse("GET", "/-1/foo.css", 200, "text/css");
    niceControl.replay();

    GadgetSpec mockSpec = createMock(GadgetSpec.class);
    Map<String, GadgetResource> cssResources = Maps.newLinkedHashMap();

    String resourceContent = "The quick brown fox jumps over the lazy dog";
    GadgetResource mockResource = createMock(GadgetResource.class);
    expect(mockResource.getName()).andReturn("foo.css");
    expect(mockResource.getContent()).andReturn(resourceContent);
    expect(mockResource.getContentType()).andReturn("text/css");

    GadgetResource mockResource2 = createMock(GadgetResource.class);
    expect(mockResource2.getName()).andStubReturn("bar.css");

    cssResources.put("bar.css", mockResource2);
    cssResources.put("foo.css", mockResource);
    expect(mockSpec.getCssResources()).andReturn(cssResources);

    expect(registry.getGadgetSpec("-1")).andReturn(mockSpec);
    replay(registry, mockSpec, mockResource, mockResource2);

    servlet.doGet(request, response);

    verify(mockSpec, mockResource, mockResource2);

    assertEquals(resourceContent, getWriterOutput());
  }

  /**
   * Test GET /gadgetspec/{id}/{resourceName} for a non-existent resource
   * 
   * @throws Exception
   */
  @Test
  public void testGetResourceByIdNonExistent() throws Exception {
    expect(request.getMethod()).andStubReturn("GET");
    expect(request.getPathInfo()).andStubReturn("/-1/foo.css");

    response.sendError(eq(404), isA(String.class));
    expectLastCall().once();

    niceControl.replay();

    GadgetSpec mockSpec = createMock(GadgetSpec.class);

    expect(mockSpec.getCssResources()).andReturn(null);
    expect(registry.getGadgetSpec("-1")).andReturn(mockSpec);
    replay(registry, mockSpec);

    servlet.doGet(request, response);

    verify(mockSpec);
  }

  /**
   * Test POST /gadgetspec
   * 
   * @throws Exception
   */
  @Test
  public void testPostSpec() throws Exception {
    expectRequestAndResponse("POST", "");
    String postBody = "{'cssResources':[{'content':'csscontentstring','name':'cssfilename.css'}],"
            + "'jsResources':[{'content':'jscontentstring','name':'jsfilename.css'}],"
            + "'gadgetResource':{'content':'gadgetcontentstring','name':'gadgetfilename.xml'},"
            + "'htmlResources':[{'content':'htmlcontentstring','name':'htmlfilename.html'}]}";
    BufferedReader br = new BufferedReader(new StringReader(postBody));
    expect(request.getReader()).andReturn(br);
    expect(request.getContentType()).andReturn("application/json");
    niceControl.replay();
    replay(registry);

    servlet.doPost(request, response);

    JSONObject responseJson = new JSONObject(getWriterOutput());
    assertTrue(responseJson.has("id"));

    Map<String, GadgetSpec> tempSpecs = Whitebox.<Map<String, GadgetSpec>> getInternalState(
            servlet, "tempSpecs");
    String id = responseJson.getString("id");
    assertTrue(tempSpecs.containsKey(id));
  }

  /**
   * Test getting of a temp spec
   * 
   * @throws Exception
   */
  @Test
  public void testGetTempSpec() throws Exception {
    expectRequestAndResponse("/-1");
    niceControl.replay();
    
    GadgetSpec mockSpec = createMock(GadgetSpec.class);
    JSONObject defaultGadgetJson = new JSONObject("{'foo':'bar'}");
    expect(mockSpec.toJSON()).andReturn(defaultGadgetJson);
    Map<String, GadgetSpec> tempSpecs = Maps.newConcurrentMap();
    tempSpecs.put("-1", mockSpec);
    Whitebox.setInternalState(servlet, "tempSpecs", tempSpecs);
    
    replay(registry, mockSpec);
    
    servlet.doGet(request, response);
       
    verify(mockSpec);
    
    assertEquals(defaultGadgetJson, new JSONObject(getWriterOutput()));
  }

  /**
   * Test POST /gadgetspec with bad JSON
   * 
   * @throws Exception
   */
  @Test
  public void testPostSpecBadJSON() throws Exception {
    String postBody = "I'm not JSON, bwuhahaha";
    BufferedReader br = new BufferedReader(new StringReader(postBody));
    expect(request.getReader()).andReturn(br);
    expect(request.getContentType()).andReturn("application/json");
    expect(request.getMethod()).andStubReturn("POST");
    expect(request.getPathInfo()).andStubReturn("");

    response.sendError(eq(400), isA(String.class));
    expectLastCall().once();

    niceControl.replay();
    replay(registry);

    servlet.doPost(request, response);
  }

  /**
   * Test POST /gadgetspec and verify that it requires JSON content types
   * 
   * @throws Exception
   */
  @Test
  public void testPostContentType() throws Exception {
    expect(request.getMethod()).andStubReturn("POST");

    response.sendError(eq(400), isA(String.class));
    expectLastCall().once();

    expect(request.getContentType()).andReturn("foo/bar");
    niceControl.replay();
    replay(registry);

    servlet.doPost(request, response);
  }

  /**
   * Test GET /gadgetspec and verify that it requires a path
   * 
   * @throws Exception
   */
  @Test
  public void testGetEnforcePath() throws Exception {
    expect(request.getMethod()).andStubReturn("GET");

    response.sendError(eq(400), isA(String.class));
    expectLastCall().once();

    expect(request.getPathInfo()).andReturn("");
    niceControl.replay();
    replay(registry);

    servlet.doGet(request, response);
  }

  /**
   * Test GET /gadgetspec/{id} where the spec JSON is invalid
   * 
   * @throws Exception
   */
  @Test
  public void testGetSpecJSONException() throws Exception {
    expect(request.getMethod()).andStubReturn("GET");
    expect(request.getPathInfo()).andStubReturn("/-1");

    response.sendError(500);
    expectLastCall().once();

    niceControl.replay();

    GadgetSpec mockSpec = createMock(GadgetSpec.class);
    expect(mockSpec.toJSON()).andThrow(new JSONException("This is not JSON"));

    expect(registry.getGadgetSpec("-1")).andReturn(mockSpec);
    replay(registry, mockSpec);

    servlet.doGet(request, response);

    verify(mockSpec);
  }

  /**
   * Test the findResource method, to ensure that it can handle all required content types
   * 
   * @throws Exception
   */
  @Test
  public void testFindResource() throws Exception {
    GadgetSpec mockSpec = createMock(GadgetSpec.class);
    Map<String, GadgetResource> jsResources, htmlResources, cssResources;
    jsResources = Maps.newLinkedHashMap();
    htmlResources = Maps.newLinkedHashMap();
    cssResources = Maps.newLinkedHashMap();

    GadgetResource jsResource = createMock(GadgetResource.class);
    expect(jsResource.getName()).andReturn("foo.js");
    jsResources.put("foo.js", jsResource);

    GadgetResource htmlResource = createMock(GadgetResource.class);
    expect(htmlResource.getName()).andReturn("bar.html");
    htmlResources.put("bar.html", htmlResource);

    GadgetResource cssResource = createMock(GadgetResource.class);
    expect(cssResource.getName()).andReturn("baz.css");
    cssResources.put("baz.css", cssResource);

    GadgetResource xmlResource = createMock(GadgetResource.class);
    expect(xmlResource.getName()).andReturn("gadget.xml").atLeastOnce();

    expect(mockSpec.getJsResources()).andReturn(jsResources);
    expect(mockSpec.getHtmlResources()).andReturn(htmlResources);
    expect(mockSpec.getCssResources()).andReturn(cssResources);
    expect(mockSpec.getGadgetResource()).andReturn(xmlResource).atLeastOnce();

    replay(mockSpec, jsResource, htmlResource, cssResource, xmlResource, registry);
    niceControl.replay();

    assertEquals(jsResource, servlet.findResource(mockSpec, "foo.js"));
    assertEquals(htmlResource, servlet.findResource(mockSpec, "bar.html"));
    assertEquals(cssResource, servlet.findResource(mockSpec, "baz.css"));
    assertEquals(xmlResource, servlet.findResource(mockSpec, "gadget.xml"));
    assertNull(servlet.findResource(mockSpec, "foo.bar"));

    verify(mockSpec, jsResource, htmlResource, cssResource, xmlResource);

  }

  /*
   * Convenience method to get a String representation of the content written to response
   */
  private String getWriterOutput() throws UnsupportedEncodingException {
    writer.close();
    return stream.toString("UTF-8");

  }

  private void expectRequestAndResponse(String requestPath) throws IOException {
    expectRequestAndResponse("GET", requestPath);
  }

  private void expectRequestAndResponse(String requestMethod, String requestPath)
          throws IOException {
    expectRequestAndResponse(requestMethod, requestPath, 200, "application/json");
  }

  private void expectRequestAndResponse(String requestMethod, String requestPath,
          int responseStatus, String responseContentType) throws IOException {
    expect(request.getMethod()).andStubReturn(requestMethod);
    expect(request.getPathInfo()).andStubReturn(requestPath);

    if (responseStatus != 200) {
      response.setStatus(responseStatus);
      expectLastCall().once();
    }

    response.setContentType(responseContentType);
    expectLastCall().once();

    expect(response.getWriter()).andReturn(writer).once();
  }
}
