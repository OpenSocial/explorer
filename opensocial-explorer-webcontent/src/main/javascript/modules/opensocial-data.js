/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
define(['dojo/_base/declare'], function(declare) {
  var person = {
    "type" : "opensocial.Person",
    "dataObject" : {"id":"jane.doe","name":{"formatted":"Jane Doe","familyName":"Doe","givenName":"Jane"}}
  };

  var message = {
    "type" : "opensocial.Message",
    "dataObject" : {"id": "1", "senderId": "john.doe", "title": "Hairdo", "type": "publicMessage", "body": "nice &quot;haircut!&quot;", "replies": ["1a","1b"]}
  };

  file = {
    "type" : "opensocial.File",
    "dataObject" : {
      "author" : person,
      "displayName" : "My Presentation",
      "id" : "123",
      "mimeType" : "application/vnd.ms-powerpoint"
    }
  };
  return {
    get : function(type) {
      var data;
      if(type === 'opensocial.Person') {
        data = person;
      } else if(type === 'opensocial.Message') {
        data = message;
      } else if(type === 'opensocial.File') {
        data = file;
      }
      return data;
    }
  };
});