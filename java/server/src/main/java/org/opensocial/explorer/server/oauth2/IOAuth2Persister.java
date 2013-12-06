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
package org.opensocial.explorer.server.oauth2;

import org.apache.shindig.gadgets.oauth2.BasicOAuth2Store;
import org.apache.shindig.gadgets.oauth2.OAuth2Accessor;
import org.apache.shindig.gadgets.oauth2.OAuth2Store;
import org.apache.shindig.gadgets.oauth2.OAuth2Token;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Client;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2PersistenceException;
import org.apache.shindig.gadgets.oauth2.persistence.OAuth2Persister;
import org.apache.shindig.gadgets.oauth2.persistence.sample.JSONOAuth2Persister;
import org.apache.wink.json4j.JSONArray;
import org.apache.wink.json4j.JSONException;
import org.opensocial.explorer.server.oauth.NoSuchStoreException;

import java.io.UnsupportedEncodingException;
import java.util.Set;

/**
 * Used by {@link OSEOAuth2Store} to persist OAuth2 data.
 *
 * This interface provides additional functionality to the OAuth2Persister, allowing for
 * the storage of user-created OAuth2Clients.
 *
 */
public interface IOAuth2Persister extends OAuth2Persister {
  
  /**
   * Gets the clients associated with the given userId and serviceName.
   * @param userId The user ID.
   * @param serviceName The name of the client.
   * @return OAuth2Client
   */
  OAuth2Client getUserClient(String userId, String serviceName);
  
  /**
   * Gets all the clients associated with the given userId. Returns an empty JSONArray
   * if user doesn't exist or user has no client. 
   * @param userId The user ID.
   * @throws JSONException 
   * @throws UnsupportedEncodingException 
   * @return JSONArray of a user's services.
   */
  JSONArray getUserClients(String userId) throws JSONException, UnsupportedEncodingException;

  /**
   * Adds a client with the given serviceName to the given userId.
   * Overwrites the client if the client already exists.
   * @param userId The user ID.
   * @param serviceName The name of the client.
   * @param client The container class with all of the client's information.
   */
  void addUserClient(String userId, String serviceName, OAuth2Client client);

  /**
   * Deletes a client with the given serviceName associated with the given userId.
   * Throws an exception if the userId does not exist in the userStore.
   * @param userId The user ID.
   * @param serviceName The name of the client.
   * @throws NoSuchStoreException
   */
  void deleteUserClient(String userId, String serviceName) throws NoSuchStoreException;

  /**
   * Checks to see if the user already exists in the userStore.
   * @param userId The user ID.
   * @return Whether or not the user exists.
   */
  boolean isUserExisting(String userId);
}
