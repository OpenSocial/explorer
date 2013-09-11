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
        'dojo/_base/array', 'dojo/text!./../../templates/GadgetArea.html', 'modules/widgets/gadgetarea/GadgetToolbar',
        'dojo/dom-construct','modules/widgets/Loading', 'modules/opensocial-data', 'modules/widgets/gadgetarea/GadgetModalDialog',
        'dojo/_base/window', 'dojo/dom', 'dojo/json', 'modules/ExplorerContainer', 'dojo/on'],
        function(declare, WidgetBase, TemplatedMixin,
                arrayUtil, template, GadgetToolbar, domConstruct, Loading, osData, GadgetModalDialog, win, dom,
                JSON, ExplorerContainer, on) {
            var GadgetArea = declare('GadgetAreaWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                containerToken : null,
                containerTokenTTL : 3600,
                
                constructor : function() {
                  
                },
                
                startup : function() {
                  this.expContainer = new ExplorerContainer({"siteParent" : this.domNode});
                  
                  this.container = this.expContainer.getContainer();
                  this.gadgetToolbar = new GadgetToolbar();
                  domConstruct.place(this.gadgetToolbar.domNode, this.domNode);
                  this.gadgetToolbar.startup();
                  var self = this;
                  this.gadgetToolbar.getPrefDialog().addPrefsChangedListener(function(prefs) {
                    var params = {};
                    params[osapi.container.RenderParam.USER_PREFS] = prefs;
                    self.reRenderGadget(params);
                  });
                  this.loadingWidget = new Loading();
                  domConstruct.place(this.loadingWidget.domNode, this.domNode);
                  this.loadingWidget.startup();
                  on(this.expContainer, 'rendergadget', function(gadgetUrl, siteId) {
                    self.loadingWidget.hide();
                  });
                  
                  on(this.expContainer, 'setpreferences', function(site, url, prefs) {
                    self.gadgetToolbar.getPrefDialog().setPrefs(prefs);
                  });
                  
                  on(this.expContainer, 'addaction', function(action) {
                    self.gadgetToolbar.addAction(action);
                  });
                  
                  on(this.expContainer, 'removeaction', function(action) {
                    gadgetToolbar.removeAction(action);
                  });
                  
                  on(this.expContainer, 'navigateurl', function(rel, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
                    return self.createDialog('URL', opt_viewTarget);
                  });
                  
                  on(this.expContainer, 'navigategadget', function(metadata, rel, opt_view, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
                    var title = 'Gadget';
                    if(metadata.modulePrefs && metadata.modulePrefs.title) {
                      title = metadata.modulePrefs.title;
                    }
                    return self.createDialog(title, opt_viewTarget);
                  });
                  
                  on(this.expContainer, 'navigateee', function(el, opt_gadgetInfo, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
                    var title = 'Embedded Experiences';
                    if(opt_gadgetInfo && opt_gadgetInfo.modulePrefs && opt_gadgetInfo.modulePrefs.title) {
                      title = opt_gadgetInfo.modulePrefs.title;
                    }
                    return self.createDialog(title, opt_viewTarget);
                  });
                  
                  on(this.expContainer, 'destroyelement', function(site) {
                    self.gadgetDialog.hide(site);
                  });
                },
                
                getContainer : function() {
                  return this.container;
                },
                
                loadGadget : function(url) {
                  this.loadingWidget.show();
                  var self = this;
                  this.expContainer.loadGadget(url).then(function(metadata) {
                    self.gadgetToolbar.setGadgetMetadata(metadata[url]);
                  });
                },
                
                renderGadget : function(url, opt_renderParams) {
                  this.expContainer.renderGadget(url, opt_renderParams);
                },
                
                setPrefs : function() {
                  var self = this;
                  return function(site, url, prefs) {
                    self.gadgetToolbar.getPrefDialog().setPrefs(prefs);
                  };
                },
                
                renderEmbeddedExperience : function(url, dataModel) {
                  this.expContainer.renderEmbeddedExperience(url, dataModel);
                },
                
                reRenderGadget : function(opt_renderParams) {
                  this.renderGadget(this.site.getActiveSiteHolder().getUrl(), opt_renderParams);
                },
                
                createDialog : function(title, viewTarget) {
                  this.gadgetDialog = new GadgetModalDialog({"title" : title, "viewTarget" : viewTarget, 
                    "container" : this.container});
                  domConstruct.place(this.gadgetDialog.domNode, win.body());
                  this.gadgetDialog.startup();
                  this.gadgetDialog.show();
                  return this.gadgetDialog.getGadgetNode();
                },
                
                destroy : function() {
                  this.inherited(arguments);
                  instance = undefined;
                },
                
                /**
                 * Updates the container security token and forces a refresh of all of the gadget
                 * security tokens to ensure owner/viewer information is up-to-date.
                 */
                updateContainerSecurityToken : function(token, ttl) {
                  this.expContainer.updateContainerSecurityToken(token, ttl);
                }
            });
            
            var instance;
            
            return {
              getInstance : function() {
                if(!instance) {
                  instance = new GadgetArea();
                }
                return instance;
              }
            };
        });