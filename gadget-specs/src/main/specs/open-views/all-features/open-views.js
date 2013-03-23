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
var currentSite;
function initButtons() {
  document.getElementById('open').onclick = open;
  document.getElementById('type').onchange = typeChange;
  setEEDataModel();
  gadgets.window.adjustHeight();
}

function typeChange(e) {
  hideFields();
  var type = e.currentTarget.value;
  if(type === 'gadget') {
    document.getElementById('viewSection').setAttribute('style', 'display: block;');

  } else if(type === 'url') {
    document.getElementById('urlSection').setAttribute('style', 'display: block;');
  } else {
    document.getElementById('eeSection').setAttribute('style', 'display: block;');
  }
  gadgets.window.adjustHeight();
}

function setEEDataModel() {
  //WARNING!!!  The below line of code is specific to this container
  //not every container will do this do don't rely on it
  var gadgetUrl = gadgets.views.getParams().gadgetUrl;
  var dataModel = {
    "gadget" : gadgetUrl,
    "context" : {
      "message" : "The open-views feature rocks!"
    }
  };
  document.getElementById('dataModel').value = gadgets.json.stringify(dataModel);

}

function hideFields() {
  document.getElementById('viewSection').setAttribute('style', 'display: none;');
  document.getElementById('urlSection').setAttribute('style', 'display: none;');
  document.getElementById('eeSection').setAttribute('style', 'display: none;');
}

function open() {
  var type = document.getElementById('type').value;
  if(type === 'url') {
    gadgets.views.openUrl(getUrl(), function(site) {
      currentSite = site;
    }, getViewTarget());

  } else if(type === 'gadget') {
    gadgets.views.openGadget(function(result){
      alert('You revieved a message: ' + result);
    }, function(site){},
    {"view" : getView(), 
      "viewTarget" : getViewTarget()});
  } else {
    gadgets.views.openEmbeddedExperience(function(result){
      alert('You revieved a message: ' + result);
    }, 
    function(site){}, getEEDataModel(), {"viewTarget" : getViewTarget()});
  }
};

function close() {
  gadgets.views.close(currentSite);
}

function getView() {
  return document.getElementById('view').value;

}

function getViewTarget() {
  return document.getElementById('viewTarget').value;
}

function getEEDataModel() {
  return gadgets.json.parse(document.getElementById('dataModel').value);
}

function getUrl() {
  return document.getElementById('url').value;
}

// Register the function to run with the gadget is done loading
gadgets.util.registerOnLoadHandler(initButtons);