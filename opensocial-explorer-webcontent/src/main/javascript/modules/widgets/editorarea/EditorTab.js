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
        'dojo/_base/array', 'dojo/text!./../../templates/EditorTab.html', 'dojo/dom-class',
        'dojo/on'],
        function(declare, WidgetBase, TemplatedMixin,
                arrayUtil, template, domClass, on) {
            return declare('EditorTabWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                
                constructor : function() {
                  this.preActivationListeners = [];
                },
                
                postCreate : function() {
                  if(this.isActive) {
                    this.activate();
                  }
                  var self = this;
                  on(this.domNode, 'click', function(e) {
                    for(var i = 0; i < self.preActivationListeners.length; i++) {
                      self.preActivationListeners[i]();
                    }
                    self.activate.call(self);
                  });
                },
                
                activate : function() {
                  domClass.add(this.domNode, 'active');
                  this.editor.show();
                },
                
                deactivate : function() {
                  domClass.remove(this.domNode, 'active');
                  this.editor.hide();
                },
                
                addPreActivationListener : function(listener) {
                  this.preActivationListeners.push(listener);
                },
                
                destroy : function() {
                  this.editor.destroy();
                  this.inherited(arguments);
                },
                
                getResource : function() {
                  return {
                    "content" : this.editor.getContent(),
                    "name" : this.resource.name
                  };
                },
                
                getEditor : function() {
                  return this.editor;
                }
            });
        });