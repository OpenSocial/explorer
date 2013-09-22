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
define(['dojo/_base/declare',
        'dojo/_base/array',
        'dojo/dom-construct', 'modules/opensocial-data',
        'dojo/_base/window', 'dojo/dom', 'dojo/json', 'dojo/Deferred', "dojo/_base/lang", 'dojo/Evented'],
        function(declare, arrayUtil, domConstruct, osData, win, dom,
                JSON, Deferred, lang, Evented) {
            return declare([Evented], {
                containerToken : null,
                containerTokenTTL : 3600,
                
                constructor : function(params) {
                  var config = {},
                      self = this,
                      lifecycle = {};
                  this.containerToken = gadgets.config.get('shindig.auth')['authToken'];
                  config[osapi.container.ContainerConfig.RENDER_DEBUG] = '1';
                  config[osapi.container.ContainerConfig.SET_PREFERENCES] = function(site, url, prefs) {
                    self.emit('setpreferences', site, url, prefs);
                  };
                  config[osapi.container.ContainerConfig.GET_CONTAINER_TOKEN] = lang.hitch(this, 'getContainerToken');
                  this.container = new osapi.container.Container(config);
                  lifecycle[osapi.container.CallbackType.ON_RENDER] = function(gadgetUrl, siteId) {
                    self.emit('gadgetrendered', gadgetUrl, siteId)
                  };
                  this.container.addGadgetLifecycleCallback('org.opensocial.explorer', lifecycle);
                  
                  // Hook-up actions
                  this.container.actions.registerShowActionsHandler(function(actionObjArray) { 
                    self.showActions(actionObjArray, self.container, function(actionId){
                      self.container.actions.runAction(actionId);
                    });
                  });
                  this.container.actions.registerHideActionsHandler(function(actionObjArray) { 
                    self.hideActions(actionObjArray);
                  });
                  this.container.actions.registerNavigateGadgetHandler(function(gadgetUrl, opt_params) {
                    self.navigateForActions(gadgetUrl, opt_params);
                  });
                  
                  //Hook-up open-views
                  this.container.views.createElementForUrl = this.handleNavigateUrl();
                  this.container.views.createElementForGadget = this.handleNavigateGadget();
                  this.container.views.createElementForEmbeddedExperience = this.handleNavigateEE();
                  this.container.views.destroyElement = this.handleDestroyElement();
                },
                
                getContainer : function() {
                  return this.container;
                },
                
                renderGadget : function(url, site, opt_renderParams) {             
                  var deferred = new Deferred();
                  var self = this;
                  this.container.preloadGadget(url, function(metadata) {
                    deferred.resolve(metadata);
                    if(metadata[url] && !metadata[url].error) {
                      var renderParams = opt_renderParams || {},
                      viewParams = {"gadgetUrl" : url};   
                      renderParams[osapi.container.RenderParam.HEIGHT] = '100%';
                      renderParams[osapi.container.RenderParam.WIDTH] = '100%';
                      self.container.navigateGadget(site, url, viewParams, 
                          renderParams);
                    }
                  });
                  return deferred.promise;
                  
                },
                
                renderEmbeddedExperience : function(dataModel, siteNode) {
                  var deferred = new Deferred();
                  var self = this;
                  renderParams = {};
                  renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS] = {};
                  renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS][osapi.container.RenderParam.HEIGHT] = '100%';
                  renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS][osapi.container.RenderParam.WIDTH] = '100%';
                  renderParams[osapi.container.ee.RenderParam.URL_RENDER_PARAMS] = {};
                  renderParams[osapi.container.ee.RenderParam.URL_RENDER_PARAMS][osapi.container.RenderParam.HEIGHT] = '100%';
                  renderParams[osapi.container.ee.RenderParam.URL_RENDER_PARAMS][osapi.container.RenderParam.WIDTH] = '100%';
                  if(dataModel.gadget) {
                    this.container.preloadGadget(dataModel.gadget, function(metadata) {
                      if(metadata && metadata[dataModel.gadget]) {
                        renderParams[osapi.container.ee.RenderParam.GADGET_VIEW_PARAMS] = {"gadgetUrl" : dataModel.gadget}; 

                        self.container.ee.navigate(siteNode, dataModel, renderParams, function(site) {
                          deferred.resolve(metadata, site);
                        });
                      } else {
                        console.error('There was an error preloading the embedded experience.');
                      }
                    });
                  } else {
                    self.container.ee.navigate(siteNode, dataModel, renderParams, function(site) {
                      deferred.resolve(undefined, site);
                    });
                  }
                  return deferred;
                },
                
                showActions : function(actionObjArray, container, runAction) {
                  for (var i = 0; i < actionObjArray.length; i++) {
                    var action = actionObjArray[i];
                    
                    // Decorate the action with a function to be called when the action is executed
                    if (action.path && action.path.length > 0) {
                      action.runAction = function() {
                        var toRun = action;
                        return function() {
                          runAction(toRun.id);
                        };
                      }();
                    } else if (action.dataType && action.dataType.length > 0) {
                      action.runAction = function() {
                        var selection = osData.get(action.dataType),
                        toRun = action;
                        return function() {
                          container.selection.setSelection(selection);
                          runAction(toRun.id);
                        };
                      }();
                    } else {
                      gadgets.error("Invalid action contribution: " + gadgets.json.stringify(action));
                      break;
                    }
                    this.emit('addaction', action);
                  }
                },
                
                hideActions : function(actionObjArray) {
                  for (var i = 0; i < actionObjArray.length; i++) {
                    var action = actionObjArray[i];
                    this.emit('removeaction', action);
                  }
                },
                
                navigateForActions : function(gadgetUrl, opt_params) {
                  this.emit('navigateforactions', gadgetUrl, opt_params);
                },
                
                handleNavigateUrl : function() {
                  var self = this;
                  return function(rel, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
                    return self.emit('navigateurl', rel, opt_viewTarget, opt_coordinates, parentSite, opt_callback);
                  };
                },
                
                handleNavigateGadget : function() {
                  var self = this;
                  return function (metadata, rel, opt_view, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
                    self.emit('navigategadget', metadata, rel, opt_view, opt_viewTarget, opt_coordinates, parentSite, opt_callback);
                  };
                },
                
                handleNavigateEE : function() {
                  var self = this;
                  return function(rel, opt_gadgetInfo, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
                    self.emit('navigateee', rel, opt_gadgetInfo, opt_viewTarget, opt_coordinates, parentSite, opt_callback);
                  };
                },
                
                handleDestroyElement : function() {
                  var self = this;
                  return function(site) {
                    self.emit('destroyelement', site);
                  };
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
                  lang.hitch(this.container, 'forceRefreshAllTokens')();
                },
                
                /**
                 * Will get called when Shindig needs to get a new container security token
                 */
                getContainerToken : function(result) {
                  // TODO: Do work to get a new container token
                  result(this.containerToken, this.containerTokenTTL);
                }
            });
        });