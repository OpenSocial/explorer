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
/**
 * An AMD module that can be used to manage an OpenSocial container.  This module depends on the container Javascript
 * to already be loaded.  This module requires the following container features to be loaded as well.
 * <ul>
 *  <li>embedded-experiences</li>
 *  <li>open-views</li>
 *  <li>actions</li>
 *  <li>selection</li>
 * </ul>
 *
 * @module explorer/ExplorerContainer
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @augments dojo/Evented
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dojo/Evented.html|Evented Documentation}
 * 
 * @fires module:explorer/ExplorerContainer#setpreferences
 * @fires module:explorer/ExplorerContainer#gadgetrendered
 * @fires module:explorer/ExplorerContainer#addaction
 * @fires module:explorer/ExplorerContainer#removeaction
 * @fires module:explorer/ExplorerContainer#navigateforactions
 * @fires module:explorer/ExplorerContainer#navigateurl
 * @fires module:explorer/ExplorerContainer#navigateee
 * @fires module:explorer/ExplorerContainer#destroyelement
 */
define(['dojo/_base/declare', 'dojo/_base/array', 'dojo/dom-construct', './opensocial-data',
        'dojo/_base/window', 'dojo/dom', 'dojo/json', 'dojo/Deferred', "dojo/_base/lang", 'dojo/Evented', 'dojo/topic'],
  function(declare, arrayUtil, domConstruct, osData, win, dom,
           JSON, Deferred, lang, Evented, topic) {
    var ExplorerContainer = declare([Evented], {
      containerToken : null,
      containerTokenTTL : 3600,
  
      /**
       * Creates a new ExplorerContainer.
       * @constructor
       * 
       * @memberof module:explorer/ExplorerContainer#
       */
      constructor : function() {
        var config = {},
        self = this,
        lifecycle = {};
        this.containerToken = gadgets.config.get('shindig.auth').authToken;
        config[osapi.container.ContainerConfig.RENDER_DEBUG] = '1';
        config[osapi.container.ContainerConfig.SET_PREFERENCES] = function(site, url, prefs) {
          /**
           * setpreferences event.
           *
           * @event module:explorer/ExplorerContainer#setpreferences
           * @param {osapi.container.GadgetSite} site - The 
           * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#osapi.container.GadgetSite|osapi.container.GadgetSite|gadget site}
           * the set preferences event came from.
           * @param {String} url - The gadget URL for the gadget firing the event.
           * @param {Object} prefs - An object of key value pairs containing the preferences set.
           */
          self.emit('setpreferences', site, url, prefs);
        };
        config[osapi.container.ContainerConfig.GET_CONTAINER_TOKEN] = lang.hitch(this, 'getContainerToken');
        this.container = new osapi.container.Container(config);
        lifecycle[osapi.container.CallbackType.ON_RENDER] = function(gadgetUrl, siteId) {
          /**
           * gadgetrendered event.
           * 
           * @event module:explorer/ExplorerContainer#gadgetrendered
           * @param {String} gadgetUrl - The gadget URL of the gadget that has rendered.
           * @param {String} siteId - The id of the site containing the gadget that rendered.
           */
          self.emit('gadgetrendered', gadgetUrl, siteId);
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
  
        this.subscribe();
      },
  
      /**
       * This classes topic subscriptions.  Subclasses may override this method to
       * add their own.
       * 
       * @memberof module:explorer/ExplorerContainer#
       */
      subscribe : function() {
        var self = this;
        topic.subscribe('setSelection', function(selection) {
          self.getContainer().selection.setSelection(selection);
        });
      },
  
      /**
       * Gets the common container.
       * 
       * @memberof module:explorer/ExplorerContainer#
       * @return {osapi.container.Container} The common container.
       * @see {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#osapi.container.Container|OpenSocial Spec}
       */
      getContainer : function() {
        return this.container;
      },
  
      /**
       * Renders a gadget.
       * 
       * @memberof module:explorer/ExplorerContainer#
       * @param {String} url - The URL of the gadget to render.
       * @param {osapi.container.GadgetSite} site - The {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#osapi.container.GadgetSite|site}
       * to render the gadget in.
       * @param {Object=} opt_renderParams - Optional parameter used by the container, see the
       * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#RenderConfiguration|OpenSocial spec} 
       * for more details about how this object should be constructed.
       * @returns {module:dojo/promise/Promise} Returns a 
       * {@link http://dojotoolkit.org/reference-guide/1.8/dojo/promise/Promise.html#dojo-promise-promise|Dojo Promise}.
       * Call the then method of this Promise with a function that takes in one parameter, the gadget metadata.
       * 
       * @example
       * var container = new ExplorerContainer();
       * container.renderGadget(....).then(function(metadata) {
       *   if(metadata && metadata[gadgetUrl]) {
       *     //Do something with the metadata
       *   }
       * });
       */
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
  
      /**
       * Renders an embedded experience gadget.
       * 
       * @memberof module:explorer/ExplorerContainer#
       * @param {Object} dataModel - A JSON object representing the 
       * {@link http://opensocial.github.io/spec/2.5/Core-Gadget.xml#Embedded-Experiences|embedded experiences data model}.
       * @param {Element} siteNode - The element to be used for the site.
       * @returns {module:dojo/promise/Promise} Returns a 
       * {@link http://dojotoolkit.org/reference-guide/1.8/dojo/promise/Promise.html#dojo-promise-promise|Dojo Promise}.
       * Call the then method of this Promise with a function that takes in one parameter, the gadget metadata and the
       * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#osapi.container.GadgetSite|osapi.container.GadgetSite|gadget site}.
       * 
       * @example
       * var container = new ExplorerContainer();
       * container.renderEmbeddedExperience(....).then(function(metadata, site) {
       *   if(metadata && metadata[gadgetUrl]) {
       *     //Do something with the metadata
       *   }
       * });
       */
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
                var results = {
                    "site" : site,
                    "metadata" : metadata
                };
                deferred.resolve(results);
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
  
      /**
       * Called when a gadget is rendered which has actions.
       * 
       * @memberof module:explorer/ExplorerContainer#
       * @param {Object[]} actionObjArray - The array of actions from the gadget.
       * @param {osapi.container.Container} container - The OpenSocial container object.
       * @param {Function} runAction - Function which will run an action in the OpeSocial container.
       */
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
          /**
           * addaction event.
           * 
           * @event module:explorer/ExplorerContainer#addaction
           * @param {Object} action - The action that was added.
           * @see {@link http://opensocial.github.io/spec/trunk/Core-Gadget.xml#gadgets.actions.actionobjects|Action Object}
           */
          this.emit('addaction', action);
        }
      },
  
      /**
       * Called when actions from a gadget should be hidden.
       * 
       * @memberof module:explorer/ExplorerContainer#
       * @param {Object[]} actionObjArray - The actions that should be hidden.
       */
      hideActions : function(actionObjArray) {
        for (var i = 0; i < actionObjArray.length; i++) {
          var action = actionObjArray[i];
          /**
           * removeaction event.
           * 
           * @event module:explorer/ExplorerContainer#removeaction
           * @param {Object} action - The action that was removed.
           * @see {@link http://opensocial.github.io/spec/trunk/Core-Gadget.xml#gadgets.actions.actionobjects|Action Object}
           */
          this.emit('removeaction', action);
        }
      },
  
      /**
       * Emits an event letting listeners know to navigate to a gadget for an action.
       * 
       * @memberof module:explorer/ExplorerContainer#
       * @param {String} gadgetUrl - The URL to the gadget to render.
       * @param {Object=} opt_params - Optional parameter used by the container, see the
       * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#RenderConfiguration|OpenSocial spec} 
       * for more details about how this object should be constructed. 
       */
      navigateForActions : function(gadgetUrl, opt_params) {
        /**
         * navigateforactions event.
         * 
         * @event module:explorer/ExplorerContainer#navigateforactions
         * @param {String} gadgetUrl - The URL of the gadget that is being navigated to.
         * @param {Object=} opt_params - Optional parameter used by the container, see the
         * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#RenderConfiguration|OpenSocial spec} 
         * for more details about how this object should be constructed.
         */
        this.emit('navigateforactions', gadgetUrl, opt_params);
      },
  
      /**
       * Returns a closure to handle navigate URL calls from gadgets.
       * 
       * @memberof module:explorer/ExplorerContainer#
       * @return {Function} A closure that handles navigate URL calls for gadgets.
       * 
       */
      handleNavigateUrl : function() {
        var self = this;
        return function(rel, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
          /**
           * navigateurl event.
           * 
           * @event module:explorer/ExplorerContainer#navigateurl
           * @param {Element} rel - The element containing the gadget requesting to open the URL.
           * @param {String=} opt_viewTarget - The 
           * {@link http://opensocial.github.io/spec/2.5/Core-Gadget.xml#gadgets.views.ViewType.ViewTarget|view target}
           * to open.
           * @param {Object=} opt_coordinates - The coordinates of where to open the URL.
           * @param {osapi.container.GadgetSite} - The
           * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#osapi.container.GadgetSite|osapi.container.GadgetSite|gadget site}
           * of the gadget requesting to open the URL.
           * @param {Function} opt_callback - A function to call once the DOM element to be used for the URL site
           * has been created.  You should call this function and pass the DOM element.
           */
          return self.emit('navigateurl', rel, opt_viewTarget, opt_coordinates, parentSite, opt_callback);
        };
      },
  
      /**
       * Returns a closure to handle navigate gadget calls from gadgets.
       * 
       * @memberof module:explorer/ExplorerContainer#
       * @returns {Function} A closure that handles navigate gadget calls for gadgets.
       */
      handleNavigateGadget : function() {
        var self = this;
        return function (metadata, rel, opt_view, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
          /**
           * navigategadget event.
           * 
           * @event module:explorer/ExplorerContainer#navigategadget
           * @param {Object} metadata - The gadget metadata for the gadget being opened.
           * @param {Element} rel - The element containing the gadget requesting to open the URL.
           * @param {String=} opt_view - The view of the gadget to open.
           * @param {String=} opt_viewTarget - The 
           * {@link http://opensocial.github.io/spec/2.5/Core-Gadget.xml#gadgets.views.ViewType.ViewTarget|view target}
           * to open.
           * @param {Object=} opt_coordinates - The coordinates of where to open the URL.
           * @param {osapi.container.GadgetSite} - The
           * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#osapi.container.GadgetSite|osapi.container.GadgetSite|gadget site}
           * of the gadget requesting to open the URL.
           * @param {Function} opt_callback - A function to call once the DOM element to be used for the URL site
           * has been created.  You should call this function and pass the DOM element.
           */
          self.emit('navigategadget', metadata, rel, opt_view, opt_viewTarget, opt_coordinates, parentSite, opt_callback);
        };
      },
  
      /**
       * Returns a closure to handle navigate embedded experience calls from gadgets.
       * 
       * @memberof module:explorer/ExplorerContainer#
       * @returns {Function} A closure that handles navigate embedded experience calls for gadgets.
       */
      handleNavigateEE : function() {
        var self = this;
        return function(rel, opt_gadgetInfo, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
          /**
           * navigateee event.
           * 
           * @event module:explorer/ExplorerContainer#navigateee
           * @param {Element} rel - The element containing the gadget requesting to open the URL.
           * @param {Object=} opt_gadgetInfo - The metadata of the embedded experience gadget being opened.
           * @param {String=} opt_viewTarget - The 
           * {@link http://opensocial.github.io/spec/2.5/Core-Gadget.xml#gadgets.views.ViewType.ViewTarget|view target}
           * to open.
           * @param {Object=} opt_coordinates - The coordinates of where to open the URL.
           * @param {osapi.container.GadgetSite} - The
           * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#osapi.container.GadgetSite|osapi.container.GadgetSite|gadget site}
           * of the gadget requesting to open the URL.
           * @param {Function} opt_callback - A function to call once the DOM element to be used for the URL site
           * has been created.  You should call this function and pass the DOM element.
           */
          self.emit('navigateee', rel, opt_gadgetInfo, opt_viewTarget, opt_coordinates, parentSite, opt_callback);
        };
      },
  
      /**
       * Returns a closure to handle destroy element calls from gadgets closing other gadgets they have opened.
       * 
       *  @memberof module:explorer/ExplorerContainer#
       *  @returns {Function} A closure to handle destroy element calls from gadgets closing other gadgets they have opened.
       */
      handleDestroyElement : function() {
        var self = this;
        return function(site) {
          /**
           * destroyelement event.
           * 
           * @event module:explorer/ExplorerContainer#destroyelement
           * @param {osapi.container.GadgetSite} site - The
           * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#osapi.container.GadgetSite|osapi.container.GadgetSite|gadget site}
           * to destroy.
           */
          self.emit('destroyelement', site);
        };
      },
  
      /**
       * Updates the container security token and forces a refresh of all of the gadget
       * security tokens to ensure owner/viewer information is up-to-date.
       * 
       * @memberof module:explorer/ExplorerContainer#
       * @param {String} token - The security token.
       * @param {Number} ttl - The time to live for the security token.
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
       * Will get called when Shindig needs to get a new container security token.
       * @param {module:explorer/ExplorerContainer~containerTokenCallback} result - The callback that gets called with the container token.
       * 
       * @memberof module:explorer/ExplorerContainer#
       */
      getContainerToken : function(result) {
        // TODO: Do work to get a new container token
        result(this.containerToken, this.containerTokenTTL);
      },
      
      destroy : function() {
        this.inherited(arguments);
        instance = undefined;
      }
    });

    var instance;
    return {
      getInstance: function() {
        if(!instance) {
          instance = new ExplorerContainer();
        }
        return instance;
      }
    };
});
