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
package org.opensocial.explorer.server.modules;

import java.util.Iterator;
import java.util.Properties;
import java.util.Set;

import org.apache.shindig.common.PropertiesModule;

/**
 * A guice module for loading properties.
 * 
 * @see {@link Names#bindProperties(com.google.inject.Binder, Properties))}
 */
public class ExplorerPropertiesModule extends PropertiesModule {

  private static final String DEFAULT_PROPERTIES = "config/opensocial-explorer.properties";
  private Properties properties;

  public ExplorerPropertiesModule() {
    super((Properties) null);
    Properties shindigProperties = readPropertyFile(getDefaultPropertiesPath());
    Properties oseProperties = readPropertyFile(DEFAULT_PROPERTIES);
    
    // Merge the properties together.  OSE properties take precedence
    this.properties = mergeProperties(shindigProperties, oseProperties);
  }

  @Override
  protected Properties getProperties() {
    return this.properties;
  }
  
  private Properties mergeProperties(Properties...propertiesArray) {
    if (propertiesArray.length == 0) {
      return null;
    }
    
    if (propertiesArray.length == 1) {
      return propertiesArray[0];
    }
    
    Properties merged = new Properties();
    Iterator<String> keyItr;
    String key;
    for (Properties p : propertiesArray) {
      keyItr = p.stringPropertyNames().iterator();
      while (keyItr.hasNext()) {
        key = keyItr.next();
        merged.setProperty(key, p.getProperty(key));
      }
    }
    return merged;
  }
}
