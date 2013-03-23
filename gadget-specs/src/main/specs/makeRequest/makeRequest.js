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
function lookupTeam() {
  var index = document.getElementById('team').selectedIndex;
  var options = document.getElementById('team').options;
  var teamID = options[index].value;
  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  var url = 'http://www.nicetimeonice.com/api/teams/' + teamID;
  gadgets.io.makeRequest(url, function(response) {
    if (response.errors.length == 0) {
      var data = response.data;
      document.getElementById('teamID').innerHTML = data.teamID;
      document.getElementById('name').innerHTML = data.name;
      document.getElementById('conference').innerHTML = data.conference;
      document.getElementById('division').innerHTML = data.division;
      gadgets.window.adjustHeight();
    } else {
      gadgets.error('There was an error making the request.');
    }
  }, params);
}