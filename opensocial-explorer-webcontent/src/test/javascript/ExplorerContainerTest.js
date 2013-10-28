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
define(['explorer/ExplorerContainer', 'dojo/on', 'dojo/json', 'dojo/dom-construct', 'dojo/topic'], 
        function(ExplorerContainer, on, JSON, domConstruct, topic){
  describe('An OpenSocial container', function() {
    var container;
    var actions;
    var views;
    var ee;
    var setPrefsFunc;
    var gadgetLifecycle;
    var showActionsHandler;
    var hideActionsHandler;
    var navigateGadgetHandler;
    function defineContainerNamespace() {
      window.osapi = window.osapi || {};
      window.osapi.container = window.osapi.container || {};
      window.osapi.container.ContainerConfig = window.osapi.container.ContainerConfig || {};
      window.osapi.container.ContainerConfig.RENDER_DEBUG = 'renderDebug';
      window.osapi.container.ContainerConfig.SET_PREFERENCES = 'setPrefs';
      window.osapi.container.RenderParam = window.osapi.container.RENDER_PARAM || {};
      window.osapi.container.RenderParam.HEIGHT = 'height';
      window.osapi.container.RenderParam.WIDTH = 'width';
      window.osapi.container.CallbackType = window.osapi.container.CallbackType || {};
      window.osapi.container.CallbackType.ON_RENDER = 'onRender';
      window.osapi.container.ee = window.osapi.container.ee || {};
      window.osapi.container.ee.RenderParam = window.osapi.container.ee.RenderParam || {};
      window.osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS = 'gadgetRenderParams';
      window.osapi.container.ee.RenderParam.URL_RENDER_PARAMS = 'urlRenderParams';
      window.osapi.container.ee.RenderParam.GADGET_VIEW_PARAMS = 'gadgetViewParams';
      window.osapi.container.ContainerConfig.GET_CONTAINER_TOKEN = 'containerToken';
      container = createContainerSpy();
      window.osapi.container.Container = jasmine.createSpy('Container').andCallFake(function(config) {
        setPrefsFunc = config.setPrefs;
        return container;
      });
    };
    
    function defineGadgetNameSpace() {
      window.gadgets = window.gadgets || {};
      window.gadgets.config = window.gadgets.config || {};
      window.gadgets.config.get = window.gadgets.config.get || function(opt_component) {
        if (opt_component === 'shindig.auth') {
          return {'authToken': '-1:-1:*:*:*:0:default'};
        }
        throw "Unexpected config requested";
      };
      window.gadgets.error = function(error) {
        console.error(error);
      };
      window.gadgets.json = jasmine.createSpyObj('json', ['stringify', 'parse']);
      window.gadgets.json.stringify.andCallFake(function(obj) {
        return JSON.stringify(obj);
      })
    };
  
    function createContainerSpy() {
      var container = jasmine.createSpyObj('container', 
              ['addGadgetLifecycleCallback', 'newGadgetSite', 'preloadGadget',
               'navigateGadget', 'unloadGadget', 'closeGadget', 'forceRefreshAllTokens']);
      container.preloadGadget.andCallFake(function(url, callback) {
        var metadata = {};
        metadata[url] = {};
        callback(metadata);
      });
      
      container.addGadgetLifecycleCallback.andCallFake(function(id, lifecycle) {
        gadgetLifecycle = lifecycle;
      });
    
      var site = createSiteSpy();
      container.newGadgetSite.andCallFake(function() {
        return site;
      });
    
      container.actions = createActionsSpy();
      container.views = createViewsSpy();
      container.ee = createEESpy();
      container.selection = createSelectionSpy();
      return container;
    };
  
    function createSiteSpy() {
      var site = jasmine.createSpyObj('site', 
              ['getActiveSiteHolder']);
      var holder = createGadgetHolderSpy();
      site.getActiveSiteHolder.andCallFake(function() {
        return holder;
      });
      return site;
    };
  
    function createGadgetHolderSpy() {
      var holder = jasmine.createSpyObj('holder',
              ['getUrl']);
      holder.getUrl.andCallFake(function() {
        return 'http://example.com/gadget.xml';
      });
      return holder;
    };
  
    function createActionsSpy() {
      var actions =  jasmine.createSpyObj('actions', 
              ['registerShowActionsHandler', 'registerHideActionsHandler', 
               'registerNavigateGadgetHandler', 'runAction']);
      actions.registerShowActionsHandler.andCallFake(function(handler) {
        showActionsHandler = handler;
      });
      actions.registerHideActionsHandler.andCallFake(function(handler) {
        hideActionsHandler = handler;
      })
      actions.registerNavigateGadgetHandler.andCallFake(function(handler) {
        navigateGadgetHandler = handler;
      });
      return actions;
    };
    
    function createSelectionSpy() {
      var selection = jasmine.createSpyObj('selection',
              ['setSelection']);
      return selection;
    }
  
    function createViewsSpy() {
      return jasmine.createSpyObj('views', 
              ['createElementForUrl', 'createElementForGadget', 
               'createElementForEmbeddedExperience', 'destroyElement']);
    };
  
    function createEESpy() {
      var ee = jasmine.createSpyObj('ee', ['navigate']);
      ee.navigate.andCallFake(function(siteNode, dataModel, renderParams, callback) {
        var site = createSiteSpy();
        callback(site);
      })
      return ee;
    };
    
    function defineShindigNameSpace() {
      shindig = {};
      shindig.auth = jasmine.createSpyObj('auth', ['updateSecurityToken']);
    }
  
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
      defineContainerNamespace();
      defineGadgetNameSpace();
      defineShindigNameSpace();
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
    });
  
    it("can be created", function() {
      var expContainer = new ExplorerContainer();
   
      expect(container.addGadgetLifecycleCallback.calls.length).toEqual(1);
      expect(container.actions.registerShowActionsHandler.calls.length).toEqual(1);
      expect(container.actions.registerHideActionsHandler.calls.length).toEqual(1);
      expect(container.actions.registerNavigateGadgetHandler.calls.length).toEqual(1);
    });
  
    
    it("can load a gadget", function() {
      var expContainer = new ExplorerContainer();
      expContainer.renderGadget('http://example.com/gadget.xml', createSiteSpy());
      //The first argument is a spy object for the site
      expect(container.navigateGadget).toHaveBeenCalledWith(jasmine.any(Object), 'http://example.com/gadget.xml', 
              {"gadgetUrl" : "http://example.com/gadget.xml"}, 
              {"height" : "100%", "width" : "100%"});
    });
  
    it("can handle an error when loading a gadget", function() {
      var expContainer = new ExplorerContainer();
      container.preloadGadget.andCallFake(function(url, callback) {
        var metadata = {};
        callback(metadata);
      });
      expContainer.renderGadget('http://example.com/gadget.xml', createSiteSpy());
      expect(container.navigateGadget).not.toHaveBeenCalled();
      
      expContainer.renderEmbeddedExperience({
              "gadget" : "http://example.com/gadget.xml",
              "context" : {
                "id" : "123"
              }
            });
      
      expect(container.ee.navigate).not.toHaveBeenCalled();
    });
  
    it("can load consecutive gadgets", function() {
      var expContainer = new ExplorerContainer();
      expContainer.renderGadget('http://example.com/gadget.xml', createSiteSpy());
      //The first argument is a spy object for the site
      expect(container.navigateGadget).toHaveBeenCalledWith(jasmine.any(Object), 'http://example.com/gadget.xml', 
              {"gadgetUrl" : "http://example.com/gadget.xml"}, 
              {"height" : "100%", "width" : "100%"});
      expect(container.unloadGadget).not.toHaveBeenCalled();
      expect(container.closeGadget).not.toHaveBeenCalled();
      expContainer.renderGadget('http://example.com/gadget.xml', createSiteSpy());
      //The first argument is a spy object for the site
      expect(container.navigateGadget).toHaveBeenCalledWith(jasmine.any(Object), 'http://example.com/gadget.xml', 
              {"gadgetUrl" : "http://example.com/gadget.xml"}, 
              {"height" : "100%", "width" : "100%"});
    });
    
    it("can render embedded experience gadgets", function() {
      var siteNode = document.createElement("div");
      var expContainer = new ExplorerContainer();
      var callback = jasmine.createSpy('eecallback');
      expContainer.renderEmbeddedExperience({
        "gadget" : "http://example.com/gadget.xml",
        "context" : {
          "id" : "123"
        }
      }, siteNode).then(callback);
      var renderParams = {};
      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS] = {};
      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS][osapi.container.RenderParam.HEIGHT] = '100%';
      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS][osapi.container.RenderParam.WIDTH] = '100%';
      renderParams[osapi.container.ee.RenderParam.URL_RENDER_PARAMS] = {};
      renderParams[osapi.container.ee.RenderParam.URL_RENDER_PARAMS][osapi.container.RenderParam.HEIGHT] = '100%';
      renderParams[osapi.container.ee.RenderParam.URL_RENDER_PARAMS][osapi.container.RenderParam.WIDTH] = '100%';
      renderParams[osapi.container.ee.RenderParam.GADGET_VIEW_PARAMS] = {"gadgetUrl" : 'http://example.com/gadget.xml'};
      
      expect(container.ee.navigate).toHaveBeenCalledWith(jasmine.any(Element), {
        "gadget" : "http://example.com/gadget.xml",
        "context" : {
          "id" : "123"
        }
      }, renderParams, jasmine.any(Function));
      expect(callback).toHaveBeenCalled();
      
      callback = jasmine.createSpy('eeCallback');
      expContainer.renderEmbeddedExperience({
        "url" : "http://example.com"
      }, siteNode).then(callback);
      expect(callback).toHaveBeenCalled();
      
      var renderParams = {};
      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS] = {};
      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS][osapi.container.RenderParam.HEIGHT] = '100%';
      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS][osapi.container.RenderParam.WIDTH] = '100%';
      renderParams[osapi.container.ee.RenderParam.URL_RENDER_PARAMS] = {};
      renderParams[osapi.container.ee.RenderParam.URL_RENDER_PARAMS][osapi.container.RenderParam.HEIGHT] = '100%';
      renderParams[osapi.container.ee.RenderParam.URL_RENDER_PARAMS][osapi.container.RenderParam.WIDTH] = '100%';
      expect(container.ee.navigate).toHaveBeenCalledWith(jasmine.any(Element), {
        "url" : "http://example.com"
      }, renderParams, jasmine.any(Function));
    }); 
    
    it("emits a set preferences event", function() {
      var expContainer = new ExplorerContainer(),
        testSite, testUrl, testPrefs;
      runs(function() {
        on(expContainer, 'setpreferences', function(site, url, prefs) {
          testSite = site;
          testUrl = url;
          testPrefs = prefs;
        });
        setPrefsFunc(createSiteSpy(), 'http://example.com/gadget.xml', {"set_pref" : "value"});
      });
        
      waitsFor(function() {
        return testSite && testUrl && testPrefs;
      }, "The setpreferences event should have fired.", 750);
        
      runs(function() {
        expect(testSite).not.toBeUndefined();
        expect(testUrl).toEqual('http://example.com/gadget.xml');
        expect(testPrefs).toEqual({"set_pref" : "value"});
      });
    });
    
    it("emits a rendered event", function() {
      var expContainer = new ExplorerContainer(),
      testGadgetUrl, testSiteId;
      runs(function() {
        on(expContainer, 'gadgetrendered', function(gadgetUrl, siteId) {
          testGadgetUrl = gadgetUrl;
          testSiteId = siteId;
        });
        gadgetLifecycle[osapi.container.CallbackType.ON_RENDER]('http://example.com/gadget.xml', '123');
      });
      
      waitsFor(function() {
        return testGadgetUrl && testSiteId;
      }, "The rendergadget event should have fired.", 750);
      
      runs(function() {
        expect(testGadgetUrl).toEqual('http://example.com/gadget.xml');
        expect(testSiteId).toEqual('123');
      });
    });
    
    it("shows actions for gadgets with action contributions", function() {
      var expContainer = new ExplorerContainer();
      var actions = [{
        "dataType" : "opensocial.Person",
        "id" : "org-opensocial-explorer-person",
        "label" : "Person Action",
        "tooltip" : "Execute the person action"
      },{
        "id" : "org-opensocial-explorer-red",
        "label" : "Red Action",
        "path" : "container/menus/actions",
        "tooltip" : "Execute the red action"
      },{
        "id" : "org-opensocial-explorer-red2"
      }];
      showActionsHandler(actions);
      expect(actions[0].runAction).not.toBeUndefined();
      expect(actions[1].runAction).not.toBeUndefined();
      expect(actions[2].runAction).toBeUndefined();
      actions[0].runAction(actions[0].id);
      expect(container.actions.runAction).toHaveBeenCalledWith('org-opensocial-explorer-person');
      actions[1].runAction(actions[1].id);
      expect(container.actions.runAction).toHaveBeenCalledWith('org-opensocial-explorer-red');
    });
    
    it("emits an addaction event", function() {
      var expContainer = new ExplorerContainer(),
      testAction;
      var actions = [{
        "dataType" : "opensocial.Person",
        "id" : "org-opensocial-explorer-person",
        "label" : "Person Action",
        "tooltip" : "Execute the person action"
      }];
      runs(function() {
        on(expContainer, 'addaction', function(action) {
          testAction = action;
        });
        showActionsHandler(actions);
      });
      
      waitsFor(function() {
        return testAction;
      }, "The addaction event should have fired.", 750);
      
      runs(function() {
        expect(testAction).toEqual(actions[0]);
      });
    });
    
    it("emits a removeaction event", function() {
      var expContainer = new ExplorerContainer(),
      testAction;
      var actions = [{
        "dataType" : "opensocial.Person",
        "id" : "org-opensocial-explorer-person",
        "label" : "Person Action",
        "tooltip" : "Execute the person action"
      }];
      runs(function() {
        on(expContainer, 'removeaction', function(action) {
          testAction = action;
        });
        hideActionsHandler(actions);
      });
      
      waitsFor(function() {
        return testAction;
      }, "The removeaction event should have fired.", 750);
      
      runs(function() {
        expect(testAction).toEqual(actions[0]);
      });
    });
    
    it("emits a navigateforactions event", function() {
      var expContainer = new ExplorerContainer(),
      testGadgetUrl, testParams;
      runs(function() {
        on(expContainer, 'navigateforactions', function(gadgetUrl, opt_params) {
          testGadgetUrl = gadgetUrl;
          testParams = opt_params;
        });
        navigateGadgetHandler('http://example.com/gadget.xml', {"view" : "redView"});
      });
      
      waitsFor(function() {
        return testGadgetUrl && testParams;
      }, "The navigateforactions event should have fired.", 750);
      
      runs(function() {
        expect(testGadgetUrl).toEqual('http://example.com/gadget.xml');
        expect(testParams).toEqual({"view" : "redView"});
      });
    });
    
    it("emits a navigateurl event", function() {
      var expContainer = new ExplorerContainer(),
      divRel = domConstruct.toDom('<div id="test"></div>'),
      site = createSiteSpy(),
      testRel, testViewTarget, testCoordinates, testParentSite, testCallback;
      runs(function() {
        on(expContainer, 'navigateurl', function(rel, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
          testRel = rel;
          testViewTarget = opt_viewTarget;
          testCoordinates = opt_coordinates;
          testParentSite = parentSite;
          testCallback = opt_callback;
        });
        container.views.createElementForUrl(divRel, 'sidebar', {"top" : "12px"}, site, function(){});
      });
      
      waitsFor(function() {
        return testRel && testViewTarget && testCoordinates && testParentSite;
      }, "The navigateurl event should have fired.", 750);
      
      runs(function() {
        expect(testRel).toEqual(divRel);
        expect(testViewTarget).toEqual('sidebar');
        expect(testCoordinates).toEqual({"top" : "12px"});
        expect(testParentSite).toEqual(site);
      });
    });
    
    it("emits a navigategadget event", function() {
      var expContainer = new ExplorerContainer(),
      divRel = domConstruct.toDom('<div id="test"></div>'),
      site = createSiteSpy(),
      testMetadata, testRel, testView, testViewTarget, testCoordinates, testParentSite, testCallback;
      runs(function() {
        on(expContainer, 'navigategadget', function(metadata, rel, opt_view, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
          testMetadata = metadata;
          testRel = rel;
          testView = opt_view;
          testViewTarget = opt_viewTarget;
          testCoordinates = opt_coordinates;
          testParentSite = parentSite;
          testCallback = opt_callback;
        });
        container.views.createElementForGadget({"needsTokenRefresh" : true}, divRel, 'sidebarView', 'sidebar', {"top" : "12px"}, site, function(){});
      });
      
      waitsFor(function() {
        return testMetadata && testRel && testView && testViewTarget && testCoordinates && testParentSite;
      }, "The navigategadget event should have fired.", 750);
      
      runs(function() {
        expect(testMetadata).toEqual({"needsTokenRefresh" : true});
        expect(testRel).toEqual(divRel);
        expect(testView).toEqual('sidebarView')
        expect(testViewTarget).toEqual('sidebar');
        expect(testCoordinates).toEqual({"top" : "12px"});
        expect(testParentSite).toEqual(site);
      });
    });
    
    it("emits a navigateee event", function() {
      var expContainer = new ExplorerContainer(),
      divRel = domConstruct.toDom('<div id="test"></div>'),
      site = createSiteSpy(),
      testRel, testGadgetInfo, testViewTarget, testCoordinates, testParentSite, testCallback;
      runs(function() {
        on(expContainer, 'navigateee', function(rel, opt_gadgetInfo, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
          testRel = rel;
          testGadgetInfo = opt_gadgetInfo;
          testViewTarget = opt_viewTarget;
          testCoordinates = opt_coordinates;
          testParentSite = parentSite;
          testCallback = opt_callback;
        });
        container.views.createElementForEmbeddedExperience(divRel, {"needsTokenRefresh" : true}, 'sidebar', 
                {"top" : "12px"}, site, function(){});
      });
      
      waitsFor(function() {
        return testRel && testGadgetInfo && testViewTarget && testCoordinates && testParentSite;
      }, "The navigateee event should have fired.", 750);
      
      runs(function() {
        expect(testGadgetInfo).toEqual({"needsTokenRefresh" : true});
        expect(testRel).toEqual(divRel);
        expect(testViewTarget).toEqual('sidebar');
        expect(testCoordinates).toEqual({"top" : "12px"});
        expect(testParentSite).toEqual(site);
      });
    });
    
    it("emits a destroyelement event", function() {
      var expContainer = new ExplorerContainer(),
      site = createSiteSpy(), testSite;
      runs(function() {
        on(expContainer, 'destroyelement', function(site) {
          testSite = site;
        });
        container.views.destroyElement(site);
      });
      
      waitsFor(function() {
        return testSite;
      }, "The destroyelement event should have fired.", 750);
      
      runs(function() {
        expect(testSite).toEqual(site);
      });
    });
    
    it("updates security tokens", function() {
      var expContainer = new ExplorerContainer();
      expContainer.updateContainerSecurityToken('123', 320);
      expect(shindig.auth.updateSecurityToken).toHaveBeenCalledWith('123');
      expect(container.forceRefreshAllTokens).toHaveBeenCalled();
    });
    
    it("can get a container token", function() {
      var expContainer = new ExplorerContainer();
      expContainer.containerToken = '123';
      expContainer.containerTokenTTL = 320;
      var callback = jasmine.createSpy('token')
      expContainer.getContainerToken(callback);
      expect(callback).toHaveBeenCalledWith('123', 320);
    });
    
    it("handles the setSelection event", function() {
      var expContainer = new ExplorerContainer();
      topic.publish('setSelection', '123');
      expect(container.selection.setSelection).toHaveBeenCalledWith('123');
    });
  });
});