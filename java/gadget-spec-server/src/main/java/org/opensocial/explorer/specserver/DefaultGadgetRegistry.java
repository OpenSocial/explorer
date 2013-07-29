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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.text.WordUtils;
import org.apache.shindig.common.util.ResourceLoader;
import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.specserver.api.GadgetRegistry;
import org.opensocial.explorer.specserver.api.GadgetSpec;
import org.opensocial.explorer.specserver.api.GadgetSpecFactory;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.google.inject.Inject;
import com.google.inject.name.Named;

/**
 * Default implementation of {@link GadgetRegistry} that creates {@link GadgetSpec} objects using a
 * {@link GadgetSpecFactory}.
 * 
 * The locations of the gadget spec information is provided via configuration and the creation of
 * the objects is delegated to the injected {@link GadgetSpecFactory}. By default, specs are loaded
 * from the classpath and kept in memory. One could inject one's own {@link GadgetSpecFactory} to
 * load resources from elsewhere and one could override this class to store specs someplace other
 * than in memory.
 */
public class DefaultGadgetRegistry implements GadgetRegistry {
  private static final String CLASS = DefaultGadgetRegistry.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);

  private static final Splitter CRLF_SPLITTER = Splitter.onPattern("[\r\n]+").trimResults()
          .omitEmptyStrings();

  private final Iterable<String> specsRegistry;

  private Map<String, GadgetSpec> specs;
  private GadgetSpec defaultSpec;
  private JSONArray specTree;
  private List<String> specSources;
  private GadgetSpecFactory specFactory;

  @Inject
  public DefaultGadgetRegistry(GadgetSpecFactory factory,
          @Named("explorer.registry.specs") String specsLocations) {
    this(factory, specsLocations, (List<String>) null);
  }

  @VisibleForTesting
  protected DefaultGadgetRegistry(GadgetSpecFactory factory, String specsLocations, String[] specs) {
    this(factory, specsLocations, (specs != null ? ImmutableList.copyOf(specs) : null));
  }

  @VisibleForTesting
  protected DefaultGadgetRegistry(GadgetSpecFactory factory, String specsLocations,
          List<String> specs) {
    LOG.entering(CLASS, "<constructor>", new Object[] { factory, specsLocations, specs });
    this.specTree = new JSONArray();
    this.specs = new HashMap<String, GadgetSpec>();
    this.specSources = specs;
    this.specFactory = factory;
    this.specsRegistry = specsLocations == null ? null : Splitter.on(',').trimResults()
            .split(specsLocations);
    loadSpecs();
  }

  private void loadSpecs() {
    final String method = "loadSpecs";
    try {
      // FIXME: If there's only one spec, we should force it to be the default. This might be easier
      // to do client-side
      // TODO: What if two specs want to be the default? Last one wins? This also might be easier to
      // do client-side
      for (String specPath : getSpecRegistryContents()) {
        GadgetSpec gadgetSpec = specFactory.create(specPath);
        if (gadgetSpec == null) {
          LOG.logp(Level.WARNING, CLASS, method, "Unable to load gadget at path {0}", specPath);
          continue;
        }
        specs.put(gadgetSpec.getId(), gadgetSpec);
        if (gadgetSpec.isDefault()) {
          defaultSpec = gadgetSpec;
        }
        addToSpecTree(gadgetSpec);
      }
    } catch (Exception e) {
      LOG.logp(Level.SEVERE, CLASS, method, e.getMessage(), e);
    }
  }

  public JSONArray getSpecTree() {
    return specTree;
  }

  private Iterable<String> getSpecRegistryContents() {
    final String method = "getSpecRegistryContents";
    LOG.entering(CLASS, method);
    // specSources will be non-null when testing only
    if (this.specSources == null) {
      Iterator<String> itr = specsRegistry.iterator();
      StringBuilder contents = new StringBuilder();
      while (itr.hasNext()) {
        try {
          contents.append(ResourceLoader.getContent(itr.next()));
        } catch (IOException e) {
          LOG.logp(Level.SEVERE, CLASS, method, e.getMessage(), e);
          continue;
        }
        contents.append("\r\n");
      }
      String finalContent = contents.toString();
      LOG.exiting(CLASS, method, finalContent);
      return CRLF_SPLITTER.split(finalContent);
    }
    return this.specSources;
  }

  private void addToSpecTree(GadgetSpec gadgetSpec) throws JSONException {
    String specPath = gadgetSpec.getPathToSpec();
    specPath = specPath.replace("/spec.json", "");
    String[] nodes = specPath.split("/");
    List<String> nodesArray = new ArrayList<String>();
    Collections.addAll(nodesArray, nodes);
    
    constructJSON(nodesArray, this.specTree, gadgetSpec);
    System.out.println(this.specTree);
  }
  
  /* Builds a JSON from the locations of the specs. */
  private void constructJSON(List<String> path, JSONArray parent, GadgetSpec gadgetSpec) throws JSONException {
    // Base case
    if(path.size() == 1) {
      parent.put(this.createSpec(gadgetSpec));
      return;
    }
    
    // Does the leftmost of path already exist?
    Integer index = this.findObject(parent, path.get(0));
    
    // If it doesn't exist, create it as a Folder and recurse with the next element in the path.
    if(index == -1) {
      parent.put(this.createFolder(path.get(0)));
      path.remove(0);
      this.constructJSON(path, parent.getJSONObject(parent.size()-1).getJSONArray("children"), gadgetSpec);
    }
    
    // If it does exist, recurse with the next element in the path.
    if(index != -1) {
      path.remove(0);
      this.constructJSON(path, parent.getJSONObject(index).getJSONArray("children"), gadgetSpec);
    }
  }
  
  /* Returns the index of where the JSONObject exists in the JSONArray; Returns -1 if not found. */
  private Integer findObject(JSONArray array, String node) throws JSONException {
    for(int i=0; i<array.length(); i++) {
      if(array.get(i) instanceof JSONObject) {
        JSONObject temp = array.getJSONObject(i);
        if (StringUtils.capitalize((String)temp.get("name")).equals(StringUtils.capitalize(node))) {
          return i;
        }
      }
    }
    return -1;
  }
  
  /* Creates a JSONObject of the spec with :name (String), :id (Integer), and :children (JSONArray).
     {name: "abc", id: 123, children: [...]} */
  private JSONObject createSpec(GadgetSpec gadgetSpec) throws JSONException {
    JSONObject temp = new JSONObject();
    temp.put("name", StringUtils.capitalize(gadgetSpec.getTitle()));
    temp.put("id", gadgetSpec.getId());
    temp.put("children", new JSONArray());
    return temp;
  }
  
  /* Creates a folder in the specTree with :name (String) and :children (JSONArray).
  {name: "folder1", children: [...]} */
  private JSONObject createFolder(String name) throws JSONException {
    JSONObject temp = new JSONObject();
    temp.put("name", StringUtils.capitalize(name));
    temp.put("id", this.getFolderId(name));
    temp.put("children", new JSONArray());
    return temp;
  }
  
  public String getFolderId(String name) {
    return String.valueOf(name.hashCode());
  }
  
  public GadgetSpec getDefaultGadget() {
    return defaultSpec;
  }

  public GadgetSpec getGadgetSpec(String id) {
    return specs.get(id);
  }
}