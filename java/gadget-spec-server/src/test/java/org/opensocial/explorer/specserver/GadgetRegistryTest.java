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
  
  protected void setupGadgetSpecCreation(final String specPath, final String id, final String title) {
    expect(specFactory.create(specPath)).andStubAnswer(new IAnswer<GadgetSpec>(){
      public GadgetSpec answer() throws Throwable {
        GadgetSpec mockSpec = createMock(GadgetSpec.class);
        expect(mockSpec.getPathToSpec()).andReturn(specPath).anyTimes();
        expect(mockSpec.getTitle()).andReturn(title).anyTimes();
        expect(mockSpec.getId()).andReturn(id).anyTimes();
        expect(mockSpec.isDefault()).andReturn(true).anyTimes();
        replay(mockSpec);
        return mockSpec;
      }});
  }

  @Test
  public void testEmptySpec() throws Exception {
    replay(specFactory);
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] {});
    assertEquals(new JSONArray(), gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testRootFolderSingleSpec() throws Exception {
    setupGadgetSpecCreation("specs/foo/spec.json", "123", "foo");
    replay(specFactory);
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] { "specs/foo/spec.json" });
    assertEquals(new JSONArray(
        "[{'id':'109641752','name':'Specs','children':["
        +  "{'id':'123','name':'Foo','children':[]}]}]"), 
        gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testRootFolderDoubleSpec() throws Exception {
    setupGadgetSpecCreation("specs/foo/spec.json", "123", "foo");
    setupGadgetSpecCreation("specs/bar/spec.json", "456", "bar");
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, 
        new String[] { "specs/foo/spec.json", "specs/bar/spec.json"});
    assertEquals(new JSONArray(
        "[{'id':'109641752','name':'Specs','children':["
        +  "{'id':'123','name':'Foo','children':[]},"
        +  "{'id':'456','name':'Bar','children':[]}]}]"), 
        gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testTwoFolderDoubleSpec() throws Exception {
    setupGadgetSpecCreation("specs/abc/foo/spec.json", "123", "foo");
    setupGadgetSpecCreation("specs/def/bar/spec.json", "456", "bar");
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, 
        new String[] { "specs/abc/foo/spec.json", "specs/def/bar/spec.json"});
    assertEquals(new JSONArray(
        "[{'id':'109641752','name':'Specs','children':["
        +  "{'id':'96354','name':'Abc','children':["
        +    "{'id':'123','name':'Foo','children':[]}]},"
        +  "{'id':'99333','name':'Def','children':["
        +    "{'id':'456','name':'Bar','children':[]}]}]}]"), 
        gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testSameFolderDoubleSpec() throws Exception {
    setupGadgetSpecCreation("specs/abc/foo/spec.json", "123", "foo");
    setupGadgetSpecCreation("specs/abc/bar/spec.json", "456", "bar");
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, 
        new String[] { "specs/abc/foo/spec.json", "specs/abc/bar/spec.json"});
    assertEquals(new JSONArray(
        "[{'id':'109641752','name':'Specs','children':["
        +  "{'id':'96354','name':'Abc','children':["
        +    "{'id':'123','name':'Foo','children':[]},"
        +    "{'id':'456','name':'Bar','children':[]}]}]}]]"), 
        gadgetRegistry.getSpecTree());
  }
  
  
  @Test
  public void testLoadingRealSpecsEmpty() throws Exception {
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(new DefaultGadgetSpecFactory(), "nospecs.txt");
    assertEquals(new JSONArray(), gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testLoadingRealSpecsNotEmpty() throws Exception {
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(new DefaultGadgetSpecFactory(), "specs.txt");
    JSONArray specTree = gadgetRegistry.getSpecTree();
    assertNotNull(specTree);
    assertEquals(1, specTree.size());
  }
  
  @Test
  public void testLoadingRealSpecsBoth() throws Exception {
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(new DefaultGadgetSpecFactory(), "specs.txt,nospecs.txt");
    JSONArray specTree = gadgetRegistry.getSpecTree();
    assertNotNull(specTree);
    assertEquals(1, specTree.size());
  }
  
  @Test
  public void testLoadingRealSpecsBothReverse() throws Exception {
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(new DefaultGadgetSpecFactory(), "nospecs.txt,specs.txt");
    JSONArray specTree = gadgetRegistry.getSpecTree();
    assertNotNull(specTree);
    assertEquals(1, specTree.size());
  }
}
