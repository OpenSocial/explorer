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
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/_base/array', 'dojo/query', 'dojo/text!./../../templates/SpecLink.html',
        'dojo/on', 'modules/widgets/editorarea/EditorArea', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom', 
        'dojo/ready', 'dojo/domReady!'],
        function(declare, WidgetBase, TemplatedMixin,
                arrayUtil, query, template, on, EditorArea) {
            return declare('SpecLinkWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                
                constructor : function() {
                  this.activationListeners = [];
                },
                
                postCreate : function() {
                  if(this.node.isDefault) {
                    // TODO: Introduce a way for the container to override what the default spec is via a path or query param.
                    // For instance, I want to be able to say "http://ose.org/OAuth/OAuth10A/YouTube
                    // Player with Comments" to get to that example in the navigator. This creates a
                    // "permalink" to that particular example.
                    this.activate();
                    EditorArea.getInstance().setTitle(this.node.title);
                  }
                  var self = this;
                  on(this.domNode, 'click', function(e){
                    for(var i = 0; i < self.activationListeners.length; i++) {
                      self.activationListeners[i].pre();
                    }
                    self.activate();
                    EditorArea.getInstance().displaySpec(self.node.id);
                    for(var i = 0; i < self.activationListeners.length; i++) {
                      self.activationListeners[i].post(self);
                    }
                  });
                },
                
                activate : function() {
                  query('li', this.domNode).addClass('active');
                },
                
                deactivate : function() {
                  query('li', this.domNode).removeClass('active');
                },
                
                addActivationListener : function(listener) {
                  this.activationListeners.push(listener);
                }
                
            });
        });