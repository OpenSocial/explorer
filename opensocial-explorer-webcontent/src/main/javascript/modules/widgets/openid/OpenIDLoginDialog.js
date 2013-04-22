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
define(['dojo/_base/declare',  'modules/widgets/ModalDialog', 'dojo/query', 'dojo/dom-construct',
        'dojo/on', 'modules/widgets/openid/OpenIDLoginControls', 'dojo/NodeList-manipulate', 
        'dojo/NodeList-dom'],
        function(declare, ModalDialog, query, domConstruct, on, OpenIDLoginControls) {
            var OpenIDLoginDialog = declare('OpenIDLoginDialog', [ ModalDialog ], {
              constructor : function() {
              },

              postCreate : function() {
                this.openIdLoginControls = new OpenIDLoginControls();
                query('.modal-body', this.domNode).append(this.openIdLoginControls.domNode);
              },
              
              startup : function() {
                this.setHeaderTitle('Sign-in or Create New Account');
                this.inherited(arguments);
              },
              
              show : function() {
                this.openIdLoginControls.show();
                this.inherited(arguments);
              }
            });
    var instance;

    return {
      getInstance : function() {
        if(!instance) {
          instance = new OpenIDLoginDialog();
        }
        return instance;
      }
    };            
});