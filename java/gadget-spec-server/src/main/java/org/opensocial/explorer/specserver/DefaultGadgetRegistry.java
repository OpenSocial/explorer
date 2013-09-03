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
        addToTree(gadgetSpec, specTree);
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

  private void addToTree(GadgetSpec gadgetSpec, JSONArray tree) throws JSONException {
    String specPath = gadgetSpec.getPathToSpec();
    specPath = specPath.replace("/spec.json", "");
    String[] nodes = specPath.split("/");
    List<String> nodesArray = new ArrayList<String>();
    Collections.addAll(nodesArray, nodes);
    setJsonTree(nodesArray, tree, gadgetSpec);
  }
  
  private void setJsonTree(List<String> path, JSONArray parent, GadgetSpec gadgetSpec) throws JSONException {
    String tempId = "root"; // Temp variable to keep track of parent ID.
    for(int i=0; i<path.size(); i++) {
      JSONObject newNode = new JSONObject();
      if(!this.isNodeExisting(path.get(i), parent)) {
        // If node is a GadgetSpec (last in path)
        if(i == path.size()-1) {
          newNode.put("name", StringUtils.capitalize(gadgetSpec.getTitle()));
          newNode.put("hasChildren", false);
          newNode.put("isDefault", gadgetSpec.isDefault());
          newNode.put("id", gadgetSpec.getId());
        } 
        // Id node is a unique folder
        else {
          newNode.put("name", StringUtils.capitalize(path.get(i)));
          newNode.put("hasChildren", true);
          newNode.put("isDefault", false);
          newNode.put("id", getFolderId(path.get(i)));
        }
        newNode.put("parent", tempId);
        parent.put(newNode);
      }
      tempId = getFolderId(path.get(i));
    }
  }
  
  private boolean isNodeExisting(String node, JSONArray array) throws JSONException {
    for(int i=0; i<array.length(); i++) {
      JSONObject temp = array.getJSONObject(i);
      String tempName = temp.getString("name");
      if (tempName.equalsIgnoreCase(node)) {
        return true;
      }
    }
    return false;
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