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
define(['dojo/_base/declare', 'modules/widgets/controlgroups/ControlGroup',
        'dojo/_base/array', 'dojo/query', 'dojo/dom-construct',
        'dojo/dom-attr', 'dojo/on', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ControlGroup, arrayUtil, query, domConstruct, domAttr, on) {
            return declare('EnumControlGroupWidget', [ ControlGroup ], {
                
                postCreate : function() {
                  var select = domConstruct.create('select'),
                      self = this;
                  on(select, 'change', function(e) {
                    var options = e.currentTarget.options;
                    self.toggleSelection(options, e.currentTarget.value);
                  });
                  for(var i = 0; i < this.orderedEnumValues.length; i++) {
                    var option = domConstruct.create('option', 
                            {"value" : this.orderedEnumValues[i].value, "innerHTML" : this.orderedEnumValues[i].displayValue}, select);
                    if(this.orderedEnumValues[i].displayValue === this.defaultValue) {
                      domAttr.set(option, 'selected', 'selected');
                    }
                  }
                  domConstruct.place(select, query('.controls', this.domNode)[0]);
                  
                },
                
                getValue : function() {
                  return this.currentValue;
                },
                
                toggleSelection : function(options, selected) {
                  this.currentValue = selected;
                  arrayUtil.forEach(options, function(option) {
                    if(domAttr.get(option, 'selected')) {
                      domAttr.set(option, 'selected', '');
                    }
                    if(selected === domAttr.get(option, 'value')) {
                      domAttr.set(option, 'selected', 'selected');
                    }
                  });
                },
                
                setValue : function(selected) {
                  var options = query('.controls select')[0].options;
                  this.toggleSelection(options, selected);
                }
            });
        });