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
        'dojo/text!./../../templates/GadgetMenuButton.html',
        'modules/widgets/gadgetarea/GadgetDropDownMenu', 'dojo/dom-construct'],
        function(declare, WidgetBase, TemplatedMixin, template, GadgetDropDownMenu, domConstruct) {
            return declare('GadgetMenuButtonWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,

                startup : function() {
                  this.gadgetDropDown = new GadgetDropDownMenu({"gadgetArea" : this.gadgetArea, "prefDialog" : this.prefDialog});
                  domConstruct.place(this.gadgetDropDown.domNode, this.domNode);
                  this.gadgetDropDown.startup();
                },
                
                constructMenu : function(metadata) {
                  this.gadgetDropDown.setViews(metadata.views);
                },
                
                getGadgetDropDownMenu : function() {
                  return this.gadgetDropDown;
                }
            });
        });