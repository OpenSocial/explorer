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

import static org.junit.Assert.*;

import java.io.FileNotFoundException;
import java.util.Map;

import org.apache.wink.json4j.JSONObject;
import org.junit.Test;
import org.opensocial.explorer.specserver.api.GadgetResource;
import org.opensocial.explorer.specserver.api.GadgetSpec;

public class DefaultGadgetSpecTest {

  @Test
  public void testSimpleSpec() throws Exception {
    GadgetSpec spec = new DefaultGadgetSpec("specs/simple/spec.json");
    assertEquals("Simple Test", spec.getTitle());
    assertEquals(true, spec.isDefault());
    
    assertNotNull(spec.getGadgetResource());
    assertEquals("GadgetContent", spec.getGadgetResource().getContent());
    
    assertNull(spec.getCssResources());
    assertNull(spec.getHtmlResources());
    assertNull(spec.getJsResources());
    assertNull(spec.getEEResource());
    
    assertEquals("specs/simple/spec.json", spec.getPathToSpec());
  }
  
  @Test
  public void testComplexSpec() throws Exception {
    GadgetSpec spec = new DefaultGadgetSpec("specs/complex/spec.json");
    assertEquals("Complex Test", spec.getTitle());
    assertEquals(false, spec.isDefault());
    
    assertNotNull(spec.getGadgetResource());
    assertEquals("GadgetContent", spec.getGadgetResource().getContent());
    
    GadgetResource eeResource = spec.getEEResource();
    assertNotNull(eeResource);
    
    Map<String, GadgetResource> cssResources = spec.getCssResources();
    Map<String, GadgetResource> htmlResources = spec.getHtmlResources();
    Map<String, GadgetResource> jsResources = spec.getJsResources();
    
    assertNotNull(cssResources);
    assertNotNull(htmlResources);
    assertNotNull(jsResources);
    
    assertEquals(2, cssResources.size());
    assertEquals(2, htmlResources.size());
    assertEquals(2, jsResources.size());
  }
  
  @Test
  public void testNoTitleInSpec() throws Exception {
    try {
      new DefaultGadgetSpec("specs/no-title/spec.json");
      fail("Expected a GadgetSpecLoadingException");
    } catch (GadgetSpecLoadingException gsle) {
      // Pass
    }
  }
  
  @Test
  public void testNoGadgetInSpec() throws Exception {
    try {
      new DefaultGadgetSpec("specs/no-gadget/spec.json");
      fail("Expected a GadgetSpecLoadingException");
    } catch (GadgetSpecLoadingException gsle) {
      // Pass
    }
  }
  
  @Test
  public void testNoIsDefaultInSpec() throws Exception {
    GadgetSpec spec = new DefaultGadgetSpec("specs/no-isdefault/spec.json");
    assertFalse(spec.isDefault());
  }
  
  @Test
  public void testMissingGadgetXML() throws Exception {
    try {
      new DefaultGadgetSpec("specs/missing-gadget/spec.json");
      fail("Expected a FileNotFoundException");
    } catch (FileNotFoundException fnfe) {
      // Pass
    }
  }
  
  @Test
  public void testBadPath() throws Exception {
    try {
      new DefaultGadgetSpec("specs/no-gadget");
      fail("Expected a IllegalArgumentException");
    } catch (IllegalArgumentException iae) {
      // Pass
    }
  }
  
  @Test
  public void testToString() throws Exception {
    GadgetSpec spec = new DefaultGadgetSpec("specs/complex/spec.json");
    assertEquals(new JSONObject("{\"isDefault\":false," +
                              		"\"gadget\":\"gadget.xml\"," +
                              		"\"htmlFiles\":[\"complex.html\",\"complex2.html\"]," +
                              		"\"cssFiles\":[\"complex.css\",\"complex2.css\"]," +
                              		"\"jsFiles\":[\"complex.js\",\"complex2.js\"]," +
                              		"\"eeDataModel\":\"complex.json\"," +
                              		"\"title\":\"Complex Test\"}"), 
            new JSONObject(spec.toString()));
  }
  
  @Test
  public void testToJSON() throws Exception {
    GadgetSpec spec = new DefaultGadgetSpec("specs/complex/spec.json");
    JSONObject json = spec.toJSON();
    // FIXME: Actually test the results from this
    
    spec = new DefaultGadgetSpec("specs/simple/spec.json");
    json = spec.toJSON();
    // FIXME: Actually test the results from this
  }
}

