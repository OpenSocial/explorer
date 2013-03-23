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
define(['dojo/_base/declare',  'modules/widgets/ModalDialog', 'dojo/query', 
        'dojo/dom-class', 'modules/widgets/controlgroups/StringControlGroup', 'modules/widgets/controlgroups/BooleanControlGroup', 'modules/widgets/controlgroups/EnumControlGroup', 
        'modules/widgets/controlgroups/ListControlGroup', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ModalDialog, query, domClass, StringControlGroup, BooleanControlGroup, EnumControlGroup, ListControlGroup) {
            return declare('GadgetModalDialogWidget', [ ModalDialog ], {
                
                postCreate : function() {
                  
                  if(this.viewTarget === 'TAB') {
                    domClass.add(this.domNode, 'tab');  
                    domClass.add(this.domNode, 'gadgetModal');
                  } else if( this.viewTarget === 'SIDEBAR') {
                    domClass.add(this.domNode, 'sidebar');
                    domClass.add(this.domNode, 'gadgetModal');
                  }
                },
                
                startup : function() {
                  this.setHeaderTitle(this.title);
                  this.inherited(arguments);
                },
                
                getGadgetNode : function() {
                  return query('.modal-body', this.domNode)[0];
                },
                
                hide : function(opt_site) {
                  var site = opt_site;
                  if(!site) {
                    site = this.container.getGadgetSiteByIframeId_(query('.modal-body > iframe')[0].getAttribute('id'));
                  }
                  this.container.closeGadget(site);
                  this.inherited(arguments);
                  this.destroy();
                }
            });
        });