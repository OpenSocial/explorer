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
 * Main JS file the OpenSocial Explorer.
 */
require(['modules/widgets/editorarea/EditorArea', 'modules/widgets/gadgetarea/GadgetArea', 'modules/widgets/sidebar/SidebarNav', 
         'modules/widgets/openid/OpenIDLoginDialog', 'dojo/query', 'dojo/dom-class',  'dojo/_base/event', 
         'dojo/NodeList-manipulate', 'dojo/NodeList-dom', 'dojo/NodeList-traverse', 'dojo/domReady!'], 
         function(EditorArea, GadgetArea, SidebarNav, OpenIDLoginDialog, query, domClass, event) {
    var editorArea = EditorArea.getInstance(),
        gadgetArea = GadgetArea.getInstance(),
        sidebarNav = SidebarNav.getInstance(),
        openIDLogin = OpenIDLoginDialog.getInstance();
    
    openIDLogin.startup();
    query('body').append(openIDLogin.domNode);
    query('#openid-login').on('click', function(e) {
      openIDLogin.show();
    });

    query('#main').prepend(gadgetArea.domNode);
    gadgetArea.startup();
    query('#main').prepend(editorArea.domNode);
    editorArea.startup();  
    query('#main').append('<div class="clear"></div>');
    
    /*
     * The following code SHOULD handle showing and hiding all drop down menus on the page. 
     */
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