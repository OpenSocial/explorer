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
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dojo/topic',
        'dojo/_base/array', 'dojo/text!./../../templates/GadgetArea.html', 'modules/widgets/gadgetarea/GadgetToolbar',
        'dojo/dom-construct','modules/widgets/Loading', 'modules/opensocial-data', 'modules/widgets/gadgetarea/GadgetModalDialog',
        'dojo/_base/window', 'dojo/dom', 'dojo/json', 'modules/ExplorerContainer', 'dojo/on'],
        function(declare, WidgetBase, TemplatedMixin, topic, arrayUtil, template, GadgetToolbar, 
            domConstruct, Loading, osData, GadgetModalDialog, win, dom, JSON, ExplorerContainer, on) {
      return declare('GadgetAreaWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                containerToken : null,
                containerTokenTTL : 3600,
                
    startup : function() {
      this.expContainer = new ExplorerContainer();
      this.siteCounter = 0;
      this.siteParent = this.domNode;
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
      on(this.getExplorerContainer(), 'gadgetrendered', function(gadgetUrl, siteId) {
        self.loadingWidget.hide();
      });
      
      on(this.getExplorerContainer(), 'setpreferences', function(site, url, prefs) {
        self.gadgetToolbar.getPrefDialog().setPrefs(prefs);
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
      
      //Published when a gadget switches views via the menu
      topic.subscribe('reRenderGadgetView', function(params) {
        self.reRenderGadget(params);
      })
    },
    
    getExplorerContainer : function() {
      return this.expContainer;
    },
    
    renderGadget : function(url, opt_renderParams) {
      this.closeOpenSite();
      this.loadingWidget.show();
      this.site = this.createSite();
      var self = this;
      this.getExplorerContainer().renderGadget(url, this.site, opt_renderParams).then(function(metadata) {
        if(metadata && metadata[url]) {
          self.gadgetToolbar.setGadgetMetadata(metadata[url]);
        }
      });
    },
    
    renderEmbeddedExperience : function(url, dataModel) {
      var oDataModel = JSON.parse(dataModel);
      oDataModel.gadget = url;
      this.closeOpenSite();
      this.loadingWidget.show();
      var self = this;
      this.getExplorerContainer().renderEmbeddedExperience(oDataModel, this.createNodeForSite()).then(function(metadata, site) {
        self.site = site;
        if(metadata && metadata[oDataModel.gadget]) {
          self.gadgetToolbar.setGadgetMetadata(metadata[oDataModel.gadget]);
        }
      });
    },
    
    reRenderGadget : function(opt_renderParams) {
      this.renderGadget(this.site.getActiveSiteHolder().getUrl(), opt_renderParams);
    },
    
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
    
    destroy : function() {
      this.inherited(arguments);
      if(this.gadgetDialog) {
        this.gadgetDialog.destroy();
      }
    },
    
    /**
     * Updates the container security token and forces a refresh of all of the gadget
     * security tokens to ensure owner/viewer information is up-to-date.
     */
    updateContainerSecurityToken : function(token, ttl) {
      this.getExplorerContainer().updateContainerSecurityToken(token, ttl);
    },
    
    createSite : function() {
      var siteNode = this.createNodeForSite();
      return this.getExplorerContainer().getContainer().newGadgetSite(siteNode);
    },
    
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
    
    closeOpenSite: function() {
      if(this.site) {
        // IMPORTANT: The gadget must be unloaded before it is closed.
        // Otherwise, getUrl() is undefined and no lifecycle events are fired
        // for unload!!!
        this.getExplorerContainer().getContainer().unloadGadget(this.site.getActiveSiteHolder().getUrl());
        this.getExplorerContainer().getContainer().closeGadget(this.site);
        domConstruct.destroy("gadgetSite" + this.siteCounter.toString());
      }
    },
  });
});