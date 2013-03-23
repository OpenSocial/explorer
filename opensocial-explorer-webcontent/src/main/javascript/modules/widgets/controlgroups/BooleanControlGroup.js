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
define(['dojo/_base/declare', 'modules/widgets/controlgroups/ControlGroup', 'dojo/query', 'dojo/dom-construct',
        'dojo/dom-attr', 'dojo/on', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ControlGroup, query, domConstruct, domAttr, on) {
            return declare('BooleanControlGroupWidget', [ ControlGroup ], {
                
                constructor : function() {
                },
                
                postCreate : function() {
                  this.input = domConstruct.create('input', {"type" : "checkbox"});
                  if(this.defaultValue.toUpperCase() === 'TRUE') {
                    domAttr.set(this.input, 'checked', 'checked');
                  }
                  on(this.input, 'click', function(e) {
                    if(domAttr.get(e.currentTarget, 'checked')) {
                      domAttr.set(e.currentTarget, 'checked', '');
                    } else {
                      domAttr.set(e.currentTarget, 'checked', 'checked');
                    }
                  });
                  query('.controls', this.domNode).append(this.input);
                },
                
                getValue : function() {
                  return this.input.checked;
                },
                
                setValue : function(checked) {
                  this.input.checked = checked;
                }
            });
        });