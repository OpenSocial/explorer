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
        'dojo/_base/array','dojo/text!./../../templates/SpecList.html', 'dojo/dom-construct', 'modules/widgets/sidebar/SpecCategory', 'modules/widgets/sidebar/SpecLink',
        'modules/widgets/sidebar/SpecList'],
        function(declare, WidgetBase, TemplatedMixin,
                arrayUtil, template, domConstruct, SpecCategory, SpecLink, SpecList) {
            return declare('SpecListWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                
                constructor : function() {
                  this.specLists = [];
                  this.specLinks = [];
                },
                
                postCreate : function() {
                  var category = new SpecCategory({"name" : this.categoryName});
                  domConstruct.place(category.domNode, this.domNode);
                  for (var j = 0; j < this.specTree.length; j++) {
	                  for(var key in this.specTree[j]) {
	                    if(key === 'nodes') {
	                      var nodes = this.specTree[j][key];
	                      for(var i = 0; i < nodes.length; i++) {
	                        var specLink = new SpecLink({"node" : nodes[i]});
	                        this.specLinks.push(specLink);
	                        domConstruct.place(specLink.domNode, this.domNode);
	                        specLink.startup();
	                      }
	                    } else {
	                      var self = this;
	                      require(['modules/widgets/sidebar/SpecList'], function(SpecList) {
	                        var specList = new SpecList({"categoryName": key, "specTree" : self.specTree[j][key]});
	                        self.specLists.push(specList);
	                        domConstruct.place(specList.domNode, self.domNode);
	                        specList.startup();
	                      });
	                    }
	                  }
                  }
                },
                
                addActivationListener : function(listener) {
                  for(var i = 0; i < this.specLists.length; i++) {
                    this.specLists[i].addActivationListener(listener);
                  }
                  
                  for(var i = 0; i < this.specLinks.length; i++) {
                    this.specLinks[i].addActivationListener(listener);
                  }
                },
                
                deactivateLinks : function() {
                  for(var i = 0; i < this.specLists.length; i++) {
                    this.specLists[i].deactivateLinks();
                  }
                  
                  for(var i = 0; i < this.specLinks.length; i++) {
                    this.specLinks[i].deactivate();
                  }
                }
            });
        });