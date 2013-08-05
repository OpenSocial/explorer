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
        'dojo/_base/window', 'dojo/dom', 'dojo/json'],
        function(declare, WidgetBase, TemplatedMixin,
                arrayUtil, template, GadgetToolbar, domConstruct, Loading, osData, GadgetModalDialog, win, dom,
                JSON) {
            var GadgetArea = declare('GadgetAreaWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                containerToken : null,
                containerTokenTTL : 3600,
                
                constructor : function() {
                  this.siteCounter = 0;
                  
                  var config = {},
                      self = this,
                      lifecycle = {};
                  this.containerToken = gadgets.config.get('shindig.auth')['authToken'];
                  config[osapi.container.ContainerConfig.RENDER_DEBUG] = '1';
                  config[osapi.container.ContainerConfig.SET_PREFERENCES] = this.setPrefs();
                  config[osapi.container.ContainerConfig.GET_CONTAINER_TOKEN] = dojo.hitch(this, 'getContainerToken');
                  this.container = new osapi.container.Container(config);
                  lifecycle[osapi.container.CallbackType.ON_RENDER] = function(gadgetUrl, sideId) {
                    self.loadingWidget.hide();
                  };
                  this.container.addGadgetLifecycleCallback('org.opensocial.explorer', lifecycle);
                  
                  // Hook-up actions
                  this.container.actions.registerShowActionsHandler(function(actionObjArray) { 
                    self.showActions(actionObjArray, self.gadgetToolbar, self.container, function(actionId){
                      self.container.actions.runAction(actionId);
                    });
                  });
                  this.container.actions.registerHideActionsHandler(function(actionObjArray) { 
                    self.hideActions(actionObjArray, self.gadgetToolbar);
                  });
                  this.container.actions.registerNavigateGadgetHandler(function(gadgetUrl, opt_params) {
                    self.navigateForActions(self, gadgetUrl, opt_params);
                  });
                  
                  //Hook-up open-views
                  this.container.views.createElementForUrl = this.handleNavigateUrl();
                  this.container.views.createElementForGadget = this.handleNavigateGadget();
                  this.container.views.createElementForEmbeddedExperience = this.handleNavigateEE();
                  this.container.views.destroyElement = this.handleDestroyElement();
                },
                
                startup : function() {
                  this.gadgetToolbar = new GadgetToolbar({"gadgetArea" : this});
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
                  
                },
                
                getContainer : function() {
                  return this.container;
                },
                
                loadGadget : function(url) {
                  this.closeOpenSite();
                  this.loadingWidget.show();                  
                  var self = this;
                  this.container.preloadGadget(url, function(metadata) {
                    if(metadata[url] && !metadata[url].error) {
                      // TODO: Check to see if the gadget requires OAuth and ensure we are logged in if it does
                      self.gadgetToolbar.setGadgetMetadata(metadata[url]);
                      self.renderGadget(url);
                    } else { 
                      console.error('There was an error fetching the metadata');
                    }
                  });
                },
                
                renderGadget : function(url, opt_renderParams) {
                  var renderParams = opt_renderParams || {},
                      viewParams = {"gadgetUrl" : url};
                  this.loadingWidget.show();                  
                  this.site = this.createSite();
                  renderParams[osapi.container.RenderParam.HEIGHT] = '100%';
                  renderParams[osapi.container.RenderParam.WIDTH] = '100%';
                  this.container.navigateGadget(this.site, url, viewParams, 
                          renderParams);
                },
                
                setPrefs : function() {
                  var self = this;
                  return function(site, url, prefs) {
                    self.gadgetToolbar.getPrefDialog().setPrefs(prefs);
                  };
                },
                
                renderEmbeddedExperience : function(url, dataModel) {
                  this.closeOpenSite();
                  this.loadingWidget.show();  
                  var self = this;
                  this.container.preloadGadget(url, function(metadata) {
                    if(metadata && metadata[url]) {
                      self.gadgetToolbar.setGadgetMetadata(metadata[url]);
                      var siteNode = self.createNodeForSite.call(self),
                      oDataModel = JSON.parse(dataModel),
                      renderParams = {};
                      oDataModel.gadget = url;
                      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS] = {};
                      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS][osapi.container.RenderParam.HEIGHT] = '100%';
                      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS][osapi.container.RenderParam.WIDTH] = '100%';
                      renderParams[osapi.container.ee.RenderParam.GADGET_VIEW_PARAMS] = {"gadgetUrl" : url}; 

                      self.container.ee.navigate(siteNode, oDataModel, renderParams, function(site){
                        // Set the site so we can clean it up when we switch gadgets
                        self.site = site;
                      });
                    } else {
                      console.error('There was an error preloading the embedded experience.');
                    }
                  });
                },
                
                createSite : function() {
                  var siteNode = this.createNodeForSite();
                  return this.container.newGadgetSite(siteNode);
                },
                
                createNodeForSite: function() {
                  // Let's be nice and reuse the same div for the site.
                  var siteNode = dom.byId("gadgetSite" + this.siteCounter.toString());
                  if (!siteNode) {
                    this.siteCounter += 1;
                    siteNode = domConstruct.create("div", {"id" : "gadgetSite" + this.siteCounter.toString()});
                    domConstruct.place(siteNode, this.domNode);
                  }
                  return siteNode;
                },
                
                closeOpenSite: function() {
                  if(this.site) {
                    // IMPORTANT: The gadget must be unloaded before it is closed.
                    // Otherwise, getUrl() is undefined and no lifecycle events are fired
                    // for unload!!!
                    this.container.unloadGadget(this.site.getActiveSiteHolder().getUrl());
                    this.container.closeGadget(this.site);
                    domConstruct.destroy("gadgetSite" + this.siteCounter.toString());
                  }
                },
                
                reRenderGadget : function(opt_renderParams) {
                  this.renderGadget(this.site.getActiveSiteHolder().getUrl(), opt_renderParams);
                },
                
                showActions : function(actionObjArray, gadgetToolbar, container, runAction) {
                  for (var i = 0; i < actionObjArray.length; i++) {
                    var action = actionObjArray[i];
                    
                    // Decorate the action with a function to be called when the action is executed
                    if (action.path && action.path.length > 0) {
                      action.runAction = function() {
                        runAction(action.id);
                      };
                    } else if (action.dataType && action.dataType.length > 0) {
                      action.runAction = function() {
                        var selection = osData.get(action.dataType);
                        container.selection.setSelection(selection);
                        runAction(action.id);
                      };
                    } else {
                      gadgets.error("Invalid action contribution: " + gadgets.json.stringify(action));
                      break;
                    }
                    gadgetToolbar.addAction(action);
                  }
                },
                
                hideActions : function(actionObjArray, gadgetToolbar) {
                  for (var i = 0; i < actionObjArray.length; i++) {
                    var action = actionObjArray[i];
                    gadgetToolbar.removeAction(action);
                  }
                },
                
                navigateForActions : function(gadgetArea, gadgetUrl, opt_params) {
                  // We can effectively ignore gadgetUrl, because we'll get it from the site's holder in reRenderGadget
                  gadgetArea.reRenderGadget(opt_params);
                },
                
                handleNavigateUrl : function() {
                  var self = this;
                  return function(rel, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
                    return self.createDialog('URL', opt_viewTarget);
                  };
                },
                
                handleNavigateGadget : function() {
                  var self = this;
                  return function (metadata, rel, opt_view, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
                    var title = 'Gadget';
                    if(metadata.modulePrefs && metadata.modulePrefs.title) {
                      title = metadata.modulePrefs.title;
                    }
                    return self.createDialog(title, opt_viewTarget);
                  };
                },
                
                handleNavigateEE : function() {
                  var self = this;
                  return function(rel, opt_gadgetInfo, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
                    var title = 'Embedded Experiences';
                    if(opt_gadgetInfo && opt_gadgetInfo.modulePrefs && opt_gadgetInfo.modulePrefs.title) {
                      title = opt_gadgetInfo.modulePrefs.title;
                    }
                    return self.createDialog(title, opt_viewTarget);
                  };
                },
                
                handleDestroyElement : function() {
                  var self = this;
                  return function(site) {
                    self.gadgetDialog.hide(site);
                  };
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
                  this.containerToken = token;
                  this.containerTokenTTL = ttl;
                  shindig.auth.updateSecurityToken(token);
                  // FIXME: Fixed by https://issues.apache.org/jira/browse/SHINDIG-1924
                  // Begin GROSS
                  sites = sites_ = this.container.sites_;
                  commonContainer = this.container;
                  // End GROSS
                  dojo.hitch(this.container, 'forceRefreshAllTokens')();
                },
                
                /**
                 * Will get called when Shindig needs to get a new container security token
                 */
                getContainerToken : function(result) {
                  // TODO: Do work to get a new container token
                  result(this.containerToken, this.containerTokenTTL);
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