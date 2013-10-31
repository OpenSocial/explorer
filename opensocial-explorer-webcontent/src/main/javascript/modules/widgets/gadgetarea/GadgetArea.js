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
 * Contains the space where the gadget renders.
 *
 * @module explorer/widgets/gadgetarea/GadgetArea
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
*/
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dojo/topic',
        'dojo/_base/array', 'dojo/text!./../../templates/GadgetArea.html', './GadgetToolbar',
        'dojo/dom-construct','../Loading', '../../opensocial-data', './GadgetModalDialog',
        'dojo/_base/window', 'dojo/dom', 'dojo/json', '../../ExplorerContainer', 'dojo/on', 'dojo/Deferred'],
        function(declare, WidgetBase, TemplatedMixin, topic, arrayUtil, template, GadgetToolbar, 
            domConstruct, Loading, osData, GadgetModalDialog, win, dom, JSON, ExplorerContainer, on, Deferred) {
      return declare('GadgetAreaWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                containerToken : null,
                containerTokenTTL : 3600,
    
    /**
     * Called right after this widget has been added to the DOM.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      this.expContainer = new ExplorerContainer();
      this.siteCounter = 0;
      this.siteParent = this.domNode;
      this.gadgetToolbar = new GadgetToolbar();
      domConstruct.place(this.gadgetToolbar.domNode, this.domNode);
      this.gadgetToolbar.startup();
      var self = this;
      this.loadingWidget = new Loading();
      domConstruct.place(this.loadingWidget.domNode, this.domNode);
      this.loadingWidget.startup();
      this.setupEventListeners();
      this.setupSubscriptions();
    },
    
    /**
     * Setups topic subscriptions for this class.
     *
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     */
    setupSubscriptions : function() {
      var self = this;
      //Published when a gadget switches views via the menu
      topic.subscribe('reRenderGadgetView', function(params) {
        self.reRenderGadget(params);
      });
    },
    
    /**
     * Sets up event listeners for this class.  Override this method to add additional event listeners.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     */
    setupEventListeners : function() {
      var self = this;
      on(this.getExplorerContainer(), 'gadgetrendered', function(gadgetUrl, siteId) {
        self.loadingWidget.hide();
      });
      
      on(this.getExplorerContainer(), 'addaction', function(action) {
        self.gadgetToolbar.addAction(action);
      });
      
      on(this.getExplorerContainer(), 'removeaction', function(action) {
        self.gadgetToolbar.removeAction(action);
      });
      
      on(this.getExplorerContainer(), 'navigateurl', function(rel, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
        opt_callback(self.createDialog('URL', opt_viewTarget));
      });
      
      on(this.getExplorerContainer(), 'navigategadget', function(metadata, rel, opt_view, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
        var title = 'Gadget';
        if(metadata.modulePrefs && metadata.modulePrefs.title) {
          title = metadata.modulePrefs.title;
        }
        opt_callback(self.createDialog(title, opt_viewTarget));
      });
      
      on(this.getExplorerContainer(), 'navigateee', function(el, opt_gadgetInfo, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
        var title = 'Embedded Experiences';
        if(opt_gadgetInfo && opt_gadgetInfo.modulePrefs && opt_gadgetInfo.modulePrefs.title) {
          title = opt_gadgetInfo.modulePrefs.title;
        }
        opt_callback(self.createDialog(title, opt_viewTarget));
      });
      
      on(this.getExplorerContainer(), 'destroyelement', function(site) {
        self.gadgetDialog.hide(site);
      });
      
      on(this.getExplorerContainer(), 'navigateforactions', function(gadgetUrl, opt_params) {
        // We can effectively ignore gadgetUrl, because we'll get it from the site's holder in reRenderGadget
        self.reRenderGadget(opt_params);
      });
      
      // When a user logs in and a security token is generated, we update it in this module.
      topic.subscribe("updateToken", function(token, ttl) {
        self.updateContainerSecurityToken(token, ttl);
      });
    },
    
    /**
     * Gets the {@link module:explorer/widgets/ExplorerContainer}.
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     */
    getExplorerContainer : function() {
      return this.expContainer;
    },

    /**
     * Renders the gadget given its URL.
     *
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     * @param {String} url - The URL where the gadget is located.
     * @param {Object=} opt_renderParams - Optional parameter used by the container, see the
     * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#RenderConfiguration|OpenSocial spec} 
     * for more details about how this object should be constructed.
     * @returns {module:dojo/promise/Promise} Returns a 
     * {@link http://dojotoolkit.org/reference-guide/1.8/dojo/promise/Promise.html#dojo-promise-promise|Dojo Promise}.
     * Call the then method of this Promise with a function that takes in one parameter, the gadget metadata.
     */
    renderGadget : function(url, opt_renderParams) {
      this.closeOpenSite();
      this.loadingWidget.show();
      this.site = this.createSite();
      var self = this;
      var deferred = new Deferred();
      this.getExplorerContainer().renderGadget(url, this.site, opt_renderParams).then(function(metadata) {
        if(metadata && metadata[url]) {
          self.gadgetToolbar.setGadgetMetadata(metadata[url]);
        }
        deferred.resolve(metadata);
      });
      return deferred;
    },

    /**
     * Renders an embedded experience.
     *
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     * @param {String} url - The URL where the embedded experience is located.
     * @param {String} dataModel - A stringified JSON object containing just the context property
     * from the {@link http://opensocial.github.io/spec/2.5/Core-Gadget.xml#Embedded-Experiences|embedded experiences data model}.
     * The gadget property of the embedded experiences data model will be the URL parameter.
     * @returns {module:dojo/promise/Promise} Returns a 
     * {@link http://dojotoolkit.org/reference-guide/1.8/dojo/promise/Promise.html#dojo-promise-promise|Dojo Promise}.
     * Call the then method of this Promise with a function that takes in one parameter, the gadget metadata and the
     * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#osapi.container.GadgetSite|osapi.container.GadgetSite|gadget site}.
     */
    renderEmbeddedExperience : function(url, dataModel) {
      var oDataModel = JSON.parse(dataModel);
      oDataModel.gadget = url;
      this.closeOpenSite();
      this.loadingWidget.show();
      var self = this;
      var deferred = new Deferred();
      this.getExplorerContainer().renderEmbeddedExperience(oDataModel, this.createNodeForSite()).then(function(results) {
        self.site = results.site;
        if(results.metadata && results.metadata[oDataModel.gadget]) {
          self.gadgetToolbar.setGadgetMetadata(results.metadata[oDataModel.gadget]);
        }
        deferred.resolve(results);
      });
      return deferred;
    },
    
    /**
     * Rerenders the currently rendered gadget.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     * @param {Object=} opt_renderParams - Optional render params. See
     * {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#RenderConfiguration|OpenSocial spec} 
     * for more details about how this object should be constructed.
     */
    reRenderGadget : function(opt_renderParams) {
      this.renderGadget(this.site.getActiveSiteHolder().getUrl(), opt_renderParams);
    },
    
    /**
     * Creates a modal dialog.  Typically used when handling open-views requests from the gadget.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     * @param {String} title - The title to give the dialog.
     * @param {String} viewTarget - Should be one of the 
     * {@link http://opensocial.github.io/spec/2.5/Core-Gadget.xml#gadgets.views.ViewType.ViewTarget|view targets} 
     * defined in the OpenSocial spec.
     */
    createDialog : function(title, viewTarget) {
      if(this.gadgetDialog) {
        this.gadgetDialog.destroy();
      }
      this.gadgetDialog = new GadgetModalDialog({"title" : title, "viewTarget" : viewTarget, 
        "container" : this.getExplorerContainer().getContainer()});
      domConstruct.place(this.gadgetDialog.domNode, win.body());
      this.gadgetDialog.startup();
      this.gadgetDialog.show();
      return this.gadgetDialog.getGadgetNode();
    },
    
    /**
     * Destroys this widget.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    destroy : function() {
      this.inherited(arguments);
      if(this.gadgetDialog) {
        this.gadgetDialog.destroy();
      }
    },
    
    /**
     * Updates the container security token and forces a refresh of all of the gadget
     * security tokens to ensure owner/viewer information is up-to-date.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     * @param {String} token - The security token.
     * @param {Number} ttl - The time to live for the security token.
     */
    updateContainerSecurityToken : function(token, ttl) {
      this.getExplorerContainer().updateContainerSecurityToken(token, ttl);
    },
    
    /**
     * Creates an gadget site.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     * @return Returns a new gadget site.
     * @see {@link http://opensocial.github.io/spec/2.5/Core-Container.xml#osapi.container.GadgetSite|osapi.container.GadgetSite|OpenSocial Spec}
     */
    createSite : function() {
      var siteNode = this.createNodeForSite();
      return this.getExplorerContainer().getContainer().newGadgetSite(siteNode);
    },
    
    /**
     * Creates a DOM node to use for the gadget site.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     * @returns {Element} A DOM node.
     */
    createNodeForSite: function() {
      // Let's be nice and reuse the same div for the site.
      var siteNode = dom.byId("gadgetSite" + this.siteCounter.toString());
      if (!siteNode) {
        this.siteCounter += 1;
        siteNode = domConstruct.create("div", {"id" : "gadgetSite" + this.siteCounter.toString()});
        domConstruct.place(siteNode, this.siteParent);
      }
      return siteNode;
    },
    
    /**
     * Closes the currently open gadget site.
     * 
     * @memberof module:explorer/widgets/gadgetarea/GadgetArea#
     */
    closeOpenSite: function() {
      if(this.site) {
        // IMPORTANT: The gadget must be unloaded before it is closed.
        // Otherwise, getUrl() is undefined and no lifecycle events are fired
        // for unload!!!
        if(this.site && this.site.getActiveSiteHolder() && this.site.getActiveSiteHolder().getUrl()) {
          this.getExplorerContainer().getContainer().unloadGadget(this.site.getActiveSiteHolder().getUrl());
        }
        this.getExplorerContainer().getContainer().closeGadget(this.site);
        domConstruct.destroy("gadgetSite" + this.siteCounter.toString());
      }
    }
  });
});