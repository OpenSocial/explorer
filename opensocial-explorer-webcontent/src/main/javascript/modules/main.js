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

/**
 * Main JS file of the OpenSocial Explorer.
 */
require(['explorer/widgets/editorarea/EditorArea', 'explorer/widgets/gadgetarea/GadgetArea', 'explorer/widgets/SidebarNav', 
         'explorer/widgets/login/LoginDialog', 'dojo/query', 'dojo/dom-class', 'dojo/_base/event', 'dojo/ready',
         'dojo/NodeList-manipulate', 'dojo/NodeList-dom', 'dojo/NodeList-traverse'], 
         function(EditorArea, GadgetArea, SidebarNav, LoginDialog, query, domClass, event, ready) {
  /*
   * The following code SHOULD handle showing and hiding all drop down menus on the page. 
   */
  ready(function() {
    query('html').on('click', function(e) {
      query('.dropdown-menu').parent().removeClass('open');
    });
    var dropDownMenuParents = query('.dropdown-menu').parent('div,.dropdown-parent');
    dropDownMenuParents.on('click', function(e) {
      if(!domClass.contains(e.currentTarget, 'open')) {
        domClass.add(e.currentTarget, 'open');
        event.stop(e);
      }
    });
  });
});