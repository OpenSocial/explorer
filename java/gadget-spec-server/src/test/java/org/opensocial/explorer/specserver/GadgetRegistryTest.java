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
  
  protected void setupDefaultGadgetSpecCreation(final String specPath, final String id, final String title) {
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
  
  protected void setupGadgetSpecCreation(final String specPath, final String id, final String title) {
    expect(specFactory.create(specPath)).andStubAnswer(new IAnswer<GadgetSpec>(){
      public GadgetSpec answer() throws Throwable {
        GadgetSpec mockSpec = createMock(GadgetSpec.class);
        expect(mockSpec.getPathToSpec()).andReturn(specPath).anyTimes();
        expect(mockSpec.getTitle()).andReturn(title).anyTimes();
        expect(mockSpec.getId()).andReturn(id).anyTimes();
        expect(mockSpec.isDefault()).andReturn(false).anyTimes();
        replay(mockSpec);
        return mockSpec;
      }});
  }

  @Test
  public void testEmptySpec() throws Exception {
    replay(specFactory);
    JSONObject emptyTree = new JSONObject();
    emptyTree.put("tree", new JSONArray());
    emptyTree.put("defaultPath", new JSONArray());
    emptyTree.put("defaultTitle", "");
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] {});
    assertEquals(emptyTree, gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testRootFolderSingleSpec() throws Exception {
    setupGadgetSpecCreation("specs/foo/spec.json", "123", "foo");
    replay(specFactory);
    
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, new String[] { "specs/foo/spec.json" });
    JSONObject specTree = new JSONObject();
    JSONArray tree = new JSONArray();
    JSONObject specs = new JSONObject();
    JSONArray specsChildren = new JSONArray();
    JSONObject foo = new JSONObject();
    JSONArray fooChildren = new JSONArray();
    
    specTree.put("tree", tree);
      tree.put(specs);
        specs.put("id", "109641752");
        specs.put("name", "Specs");
        specs.put("isDefault", false);
        specs.put("children", specsChildren);
          specsChildren.put(foo);
            foo.put("id", "123");
            foo.put("name", "Foo");
            foo.put("isDefault", false);
            foo.put("children", fooChildren);
    specTree.put("defaultPath", new JSONArray());
    specTree.put("defaultTitle", "");
      
    assertEquals(specTree, gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testRootFolderDoubleSpec() throws Exception {
    setupGadgetSpecCreation("specs/foo/spec.json", "123", "foo");
    setupGadgetSpecCreation("specs/bar/spec.json", "456", "bar");
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, 
        new String[] { "specs/foo/spec.json", "specs/bar/spec.json"});
    
    JSONObject specTree = new JSONObject();
    JSONArray tree = new JSONArray();
    JSONObject specs = new JSONObject();
    JSONArray specsChildren = new JSONArray();
    JSONObject foo = new JSONObject();
    JSONArray fooChildren = new JSONArray();
    JSONObject bar = new JSONObject();
    JSONArray barChildren = new JSONArray();
    
    specTree.put("tree", tree);
      tree.put(specs);
        specs.put("id", "109641752");
        specs.put("name", "Specs");
        specs.put("isDefault", false);
        specs.put("children", specsChildren);
          specsChildren.put(foo);
            foo.put("id", "123");
            foo.put("name", "Foo");
            foo.put("isDefault", false);
            foo.put("children", fooChildren);
          specsChildren.put(bar);  
            bar.put("id", "456");
            bar.put("name", "Bar");
            bar.put("isDefault", false);
            bar.put("children", barChildren);
    specTree.put("defaultPath", new JSONArray());
    specTree.put("defaultTitle", "");
    
    assertEquals(specTree, gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testTwoFolderDoubleSpec() throws Exception {
    setupGadgetSpecCreation("specs/abc/foo/spec.json", "123", "foo");
    setupGadgetSpecCreation("specs/def/bar/spec.json", "456", "bar");
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, 
        new String[] { "specs/abc/foo/spec.json", "specs/def/bar/spec.json"});
    
    JSONObject specTree = new JSONObject();
    JSONArray tree = new JSONArray();
    JSONObject specs = new JSONObject();
    JSONArray specsChildren = new JSONArray();
    JSONObject abc = new JSONObject();
    JSONArray abcChildren = new JSONArray();
    JSONObject foo = new JSONObject();
    JSONArray fooChildren = new JSONArray();
    JSONObject def = new JSONObject();
    JSONArray defChildren = new JSONArray();
    JSONObject bar = new JSONObject();
    JSONArray barChildren = new JSONArray();
    
    specTree.put("tree", tree);
      tree.put(specs);
        specs.put("id", "109641752");
        specs.put("name", "Specs");
        specs.put("isDefault", false);
        specs.put("children", specsChildren);
          specsChildren.put(abc);
            abc.put("id", "96354");
            abc.put("name", "Abc");
            abc.put("isDefault", false);
            abc.put("children", abcChildren);
              abcChildren.put(foo);
                foo.put("id", "123");
                foo.put("name", "Foo");
                foo.put("isDefault", false);
                foo.put("children", fooChildren);
          specsChildren.put(def);
            def.put("id", "99333");
            def.put("name", "Def");
            def.put("isDefault", false);
            def.put("children", defChildren);
              defChildren.put(bar);
                bar.put("id", "456");
                bar.put("name", "Bar");
                bar.put("isDefault", false);
                bar.put("children", barChildren);
    specTree.put("defaultPath", new JSONArray());
    specTree.put("defaultTitle", "");
    
    assertEquals(specTree, gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testSameFolderDoubleSpec() throws Exception {
    setupGadgetSpecCreation("specs/abc/foo/spec.json", "123", "foo");
    setupGadgetSpecCreation("specs/abc/bar/spec.json", "456", "bar");
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, 
        new String[] { "specs/abc/foo/spec.json", "specs/abc/bar/spec.json"});
    
    JSONObject specTree = new JSONObject();
    JSONArray tree = new JSONArray();
    JSONObject specs = new JSONObject();
    JSONArray specsChildren = new JSONArray();
    JSONObject abc = new JSONObject();
    JSONArray abcChildren = new JSONArray();
    JSONObject foo = new JSONObject();
    JSONArray fooChildren = new JSONArray();
    JSONObject bar = new JSONObject();
    JSONArray barChildren = new JSONArray();
    
    specTree.put("tree", tree);
      tree.put(specs);
        specs.put("id", "109641752");
        specs.put("name", "Specs");
        specs.put("isDefault", false);
        specs.put("children", specsChildren);
          specsChildren.put(abc);
            abc.put("id", "96354");
            abc.put("name", "Abc");
            abc.put("isDefault", false);
            abc.put("children", abcChildren);
              abcChildren.put(foo);
                foo.put("id", "123");
                foo.put("name", "Foo");
                foo.put("isDefault", false);
                foo.put("children", fooChildren);
              abcChildren.put(bar);
                bar.put("id", "456");
                bar.put("name", "Bar");
                bar.put("isDefault", false);
                bar.put("children", barChildren);
    specTree.put("defaultPath", new JSONArray());
    specTree.put("defaultTitle", "");
    
    assertEquals(specTree, gadgetRegistry.getSpecTree());
  }
  
  /*
  @Test
  public void testLoadingRealSpecsEmpty() throws Exception {
    replay(specFactory);
    JSONObject emptyTree = new JSONObject();
    emptyTree.put("tree", new JSONArray());
    emptyTree.put("defaultPath", new JSONArray());
    emptyTree.put("defaultTitle", "");
    gadgetRegistry = new DefaultGadgetRegistry(new DefaultGadgetSpecFactory(), "nospecs.txt");
    assertEquals(emptyTree, gadgetRegistry.getSpecTree());
  }
  */
  @Test
  public void testLoadingRealSpecsNotEmpty() throws Exception {
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(new DefaultGadgetSpecFactory(), "specs.txt");
    JSONObject specTree = gadgetRegistry.getSpecTree();
    assertNotNull(specTree);
    assertNotNull(specTree.getJSONArray("tree"));
    assertNotNull(specTree.getJSONArray("defaultPath"));
    assertNotNull(specTree.getString("defaultTitle"));
  }
  
  @Test
  public void testLoadingRealSpecsBoth() throws Exception {
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(new DefaultGadgetSpecFactory(), "specs.txt,nospecs.txt");
    JSONObject specTree = gadgetRegistry.getSpecTree();
    assertNotNull(specTree);
    assertNotNull(specTree.getJSONArray("tree"));
    assertNotNull(specTree.getJSONArray("defaultPath"));
    assertNotNull(specTree.getString("defaultTitle"));
  }
  
  @Test
  public void testLoadingRealSpecsBothReverse() throws Exception {
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(new DefaultGadgetSpecFactory(), "nospecs.txt,specs.txt");
    JSONObject specTree = gadgetRegistry.getSpecTree();
    assertNotNull(specTree);
    assertNotNull(specTree.getJSONArray("tree"));
    assertNotNull(specTree.getJSONArray("defaultPath"));
    assertNotNull(specTree.getString("defaultTitle"));
  }
  
  @Test
  public void testDefaultFirst() throws Exception {
    setupDefaultGadgetSpecCreation("specs/foo/spec.json", "123", "foo");
    setupGadgetSpecCreation("specs/bar/spec.json", "456", "bar");
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, 
        new String[] { "specs/foo/spec.json", "specs/bar/spec.json"});
    JSONObject specTree = new JSONObject();
    JSONArray tree = new JSONArray();
    JSONObject specs = new JSONObject();
    JSONArray specsChildren = new JSONArray();
    JSONObject foo = new JSONObject();
    JSONArray fooChildren = new JSONArray();
    JSONObject bar = new JSONObject();
    JSONArray barChildren = new JSONArray();
    JSONArray path = new JSONArray();
    
  
    specTree.put("tree", tree);
      tree.put(specs);
        specs.put("id", "109641752");
        specs.put("name", "Specs");
        specs.put("isDefault", false);
        specs.put("children", specsChildren);
          specsChildren.put(foo);
            foo.put("id", "123");
            foo.put("name", "Foo");
            foo.put("isDefault", true);
            foo.put("children", fooChildren);
          specsChildren.put(bar);  
            bar.put("id", "456");
            bar.put("name", "Bar");
            bar.put("isDefault", false);
            bar.put("children", barChildren);
    specTree.put("defaultPath", path);
      path.put("109641752");
      path.put("123");
    specTree.put("defaultTitle", "Foo");
      
    assertEquals(specTree, gadgetRegistry.getSpecTree());
  }
  
  @Test
  public void testDefaultSecond() throws Exception {
    setupGadgetSpecCreation("specs/foo/spec.json", "123", "foo");
    setupDefaultGadgetSpecCreation("specs/bar/spec.json", "456", "bar");
    replay(specFactory);
    gadgetRegistry = new DefaultGadgetRegistry(specFactory, null, 
        new String[] { "specs/foo/spec.json", "specs/bar/spec.json"});
    JSONObject specTree = new JSONObject();
    JSONArray tree = new JSONArray();
    JSONObject specs = new JSONObject();
    JSONArray specsChildren = new JSONArray();
    JSONObject foo = new JSONObject();
    JSONArray fooChildren = new JSONArray();
    JSONObject bar = new JSONObject();
    JSONArray barChildren = new JSONArray();
    JSONArray path = new JSONArray();
    
    specTree.put("tree", tree);
      tree.put(specs);
        specs.put("id", "109641752");
        specs.put("name", "Specs");
        specs.put("isDefault", false);
        specs.put("children", specsChildren);
          specsChildren.put(foo);
            foo.put("id", "123");
            foo.put("name", "Foo");
            foo.put("isDefault", false);
            foo.put("children", fooChildren);
          specsChildren.put(bar);  
            bar.put("id", "456");
            bar.put("name", "Bar");
            bar.put("isDefault", true);
            bar.put("children", barChildren);
    specTree.put("defaultPath", path);
      path.put("109641752");
      path.put("456");
    specTree.put("defaultTitle", "Bar");
      
    assertEquals(specTree, gadgetRegistry.getSpecTree());
  }
}
