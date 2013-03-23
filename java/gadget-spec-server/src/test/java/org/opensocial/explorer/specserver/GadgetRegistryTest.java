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
import static org.easymock.EasyMock.*;

import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONObject;
import org.easymock.IAnswer;
import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.opensocial.explorer.specserver.api.GadgetRegistry;
import org.opensocial.explorer.specserver.api.GadgetSpec;
import org.opensocial.explorer.specserver.api.GadgetSpecFactory;

import com.google.common.base.Joiner;

public class GadgetRegistryTest {

  private GadgetSpecFactory specFactory;
  private GadgetRegistry gadgetRegistry;
  

  @Before
  public void setUp() throws Exception {
    specFactory = createMock(GadgetSpecFactory.class);
  }
  
  @After
  public void tearDown() throws Exception {
    if (specFactory != null) {
      verify(specFactory);
    }
    specFactory = null;
    gadgetRegistry = null;
  }

  protected void setupGadgetSpecCreation(String...paths) {
    setupGadgetSpecCreation(false, paths);
  }
  
  protected void setupGadgetSpecCreation(boolean isDefault, String... paths) {
    String specPath = Joiner.on("/").join(paths);
    String id = paths[paths.length - 1];
    setupGadgetSpecCreation(specPath + "/spec.json", id, id, isDefault);
  }
  
  protected void setupGadgetSpecCreation(final String specPath, final String id, final String title, final boolean isDefault) {
    expect(specFactory.create(specPath)).andStubAnswer(new IAnswer<GadgetSpec>(){
      public GadgetSpec answer() throws Throwable {
        GadgetSpec mockSpec = createMock(GadgetSpec.class);
        expect(mockSpec.getPathToSpec()).andReturn(specPath).anyTimes();
        expect(mockSpec.getTitle()).andReturn(title).anyTimes();
        expect(mockSpec.getId()).andReturn(id).anyTimes();
        expect(mockSpec.isDefault()).andReturn(isDefault).anyTimes();
        replay(mockSpec);
        return mockSpec;
      }});
  }

  @Test
  public void testEmptySpecs() throws Exception {
    replay(specFactory);
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] {});
    assertNull("No default spec", gadgetRegistry.getDefaultGadget());
    assertEquals(new JSONArray(), gadgetRegistry.getSpecTree());
  }

  @Test
  @Ignore("Currently fails.  Is this even valid or do we require all specs to be in a sub-folder?")
  public void testSingleNoRootSpec() throws Exception {
    setupGadgetSpecCreation(true, "foo");
    replay(specFactory);
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] { "foo/spec.json" });
    assertNotNull("Default gadget is not null", gadgetRegistry.getDefaultGadget());
    assertTrue("Default gadget thinks it is the default", gadgetRegistry.getDefaultGadget().isDefault());
    assertEquals(new JSONArray("[{'nodes':[{'id':'foo','title':'foo','isDefault':true}]}]"), gadgetRegistry.getSpecTree());
  }

  @Test
  public void testSingleSpec() throws Exception {
    setupGadgetSpecCreation(true, "bar", "foo");
    replay(specFactory);
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] { "bar/foo/spec.json" });
    assertNotNull("Default gadget is not null", gadgetRegistry.getDefaultGadget());
    assertTrue("Default gadget thinks it is the default", gadgetRegistry.getDefaultGadget().isDefault());
    assertEquals(new JSONArray("[{'bar':[{'nodes':[{'id':'foo','title':'foo','isDefault':true}]}]}]"), gadgetRegistry.getSpecTree());
  }
  
  @Test
  @Ignore("Currently this fails but we would want the single gadget to be picked as the default")
  public void testSingleGadgetNoDefault() throws Exception {
    setupGadgetSpecCreation("bar", "foo");
    replay(specFactory);
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] { "bar/foo/spec.json" });
    assertNotNull("Default gadget is not null", gadgetRegistry.getDefaultGadget());
    assertTrue("Default gadget thinks it is the default", gadgetRegistry.getDefaultGadget().isDefault());
    assertEquals(new JSONArray("[{'bar':[{'nodes':[{'id':'foo','title':'foo','isDefault':true}]}]}]"), gadgetRegistry.getSpecTree());
  }
  
  // TODO: Write a test for multiple specs wanting to be the default.  The last one should win.
  
  @Test
  public void testSiblingSpecs() throws Exception {
    setupGadgetSpecCreation("bar", "foo");
    setupGadgetSpecCreation(true, "bar", "baz");
    replay(specFactory);
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] { "bar/foo/spec.json", "bar/baz/spec.json" });
    assertNotNull("Default gadget is not null", gadgetRegistry.getDefaultGadget());
    assertTrue("Default gadget thinks it is the default", gadgetRegistry.getDefaultGadget().isDefault());
    assertEquals(new JSONArray("[{'bar':[{'nodes':[{'id':'foo','title':'foo','isDefault':false}, " +
    		"{'id':'baz','title':'baz','isDefault':true}]}]}]"), 
    		gadgetRegistry.getSpecTree());
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] { "bar/baz/spec.json", "bar/foo/spec.json" });
    assertNotNull("Default gadget is not null", gadgetRegistry.getDefaultGadget());
    assertTrue("Default gadget thinks it is the default", gadgetRegistry.getDefaultGadget().isDefault());
    assertEquals(new JSONArray("[{'bar':[{'nodes':[{'id':'baz','title':'baz','isDefault':true}, " +
        "{'id':'foo','title':'foo','isDefault':false}]}]}]"), 
        gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testTwoRoots() throws Exception {
    setupGadgetSpecCreation("foo", "bax");
    setupGadgetSpecCreation(true, "bar", "baz");
    replay(specFactory);
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] { "foo/bax/spec.json", "bar/baz/spec.json" });
    assertNotNull("Default gadget is not null", gadgetRegistry.getDefaultGadget());
    assertTrue("Default gadget thinks it is the default", gadgetRegistry.getDefaultGadget().isDefault());
    assertEquals(new JSONArray("[{'foo':[{'nodes':[{'id':'bax','title':'bax','isDefault':false}]}]}," +
    		"{'bar':[{'nodes':[{'id':'baz','title':'baz','isDefault':true}]}]}]"), 
        gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testNodesBeforeSubTrees() throws Exception {
    setupGadgetSpecCreation("foo", "bar", "baz");
    setupGadgetSpecCreation(true, "foo", "bax");
    replay(specFactory);
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] { "foo/bax/spec.json",
    "foo/bar/baz/spec.json" });
    assertNotNull("Default gadget is not null", gadgetRegistry.getDefaultGadget());
    assertTrue("Default gadget thinks it is the default", gadgetRegistry.getDefaultGadget().isDefault());
    assertEquals(new JSONArray("[{'foo':[{'nodes':[{'id':'bax','title':'bax','isDefault':true}]}," + 
            "{'bar':[{'nodes':[{'id':'baz','title':'baz','isDefault':false}]}]}]}]"),
            gadgetRegistry.getSpecTree());

    // Order doesn't matter. Nodes before subtrees.
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] { "foo/bar/baz/spec.json",
    "foo/bax/spec.json" });
    assertNotNull("Default gadget is not null", gadgetRegistry.getDefaultGadget());
    assertTrue("Default gadget thinks it is the default", gadgetRegistry.getDefaultGadget().isDefault());
    assertEquals(new JSONArray("[{'foo':[{'nodes':[{'id':'bax','title':'bax','isDefault':true}]}," +
            "{'bar':[{'nodes':[{'id':'baz','title':'baz','isDefault':false}]}]}]}]"),
            gadgetRegistry.getSpecTree());
    
  }
  
  @Test
  public void testRealWorldSpecs() throws Exception {
    setupGadgetSpecCreation(true, "specs", "welcome");
    setupGadgetSpecCreation("specs", "oauth", "intro");
    setupGadgetSpecCreation("specs", "oauth", "oauth2", "google");
    setupGadgetSpecCreation("specs", "oauth", "oauth10a", "youtube");
    replay(specFactory);
    
    String resultJSON = "[{'specs':[{'nodes':[{'id':'welcome','title':'welcome','isDefault':true}]},"
            + "{'oauth':[{'nodes':[{'id':'intro','title':'intro','isDefault':false}]},"
            + "{'oauth2':[{'nodes':[{'id':'google','title':'google','isDefault':false}]}]},"
            + "{'oauth10a':[{'nodes':[{'id':'youtube','title':'youtube','isDefault':false}]}]}]}]}]";
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, 
            new String[] { "specs/welcome/spec.json", "specs/oauth/intro/spec.json", 
                           "specs/oauth/oauth2/google/spec.json", "specs/oauth/oauth10a/youtube/spec.json" });
    assertNotNull("Default gadget is not null", gadgetRegistry.getDefaultGadget());
    assertTrue("Default gadget thinks it is the default", gadgetRegistry.getDefaultGadget().isDefault());
    assertEquals(new JSONArray(resultJSON), gadgetRegistry.getSpecTree());
    
    // Nodes before sub-trees
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, 
            new String[] { "specs/welcome/spec.json", "specs/oauth/oauth2/google/spec.json",
                           "specs/oauth/oauth10a/youtube/spec.json", "specs/oauth/intro/spec.json" });
    assertNotNull("Default gadget is not null", gadgetRegistry.getDefaultGadget());
    assertTrue("Default gadget thinks it is the default", gadgetRegistry.getDefaultGadget().isDefault());
    assertEquals(new JSONArray(resultJSON), gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testLoadingRealSpecs() throws Exception {
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(new DefaultGadgetSpecFactory(), "specs.txt,nospecs.txt");
    JSONArray specTree = gadgetRegistry.getSpecTree();
    assertNotNull(specTree);
    assertEquals(1, specTree.size());
    
    Object obj = specTree.iterator().next();
    assertTrue(obj instanceof JSONObject);
    
    JSONObject jsonObj = (JSONObject) obj;
    JSONArray jsonArray = jsonObj.getJSONArray("specs");
    assertEquals(1, jsonArray.size());
    
    obj = jsonArray.iterator().next();
    assertTrue(obj instanceof JSONObject);
    
    jsonObj = (JSONObject) obj;
    jsonArray = jsonObj.getJSONArray("nodes");
    assertEquals(2, jsonArray.size());
  }
  
}
