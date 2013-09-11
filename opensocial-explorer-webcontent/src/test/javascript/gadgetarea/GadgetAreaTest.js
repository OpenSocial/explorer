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
define(['modules/widgets/gadgetarea/GadgetArea'], function(GadgetArea){
  describe('An GadgetArea widget', function() {
    var container;
    var actions;
    var views;
    var ee;
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
      window.osapi.container.ee.RenderParam.GADGET_VIEW_PARAMS = 'gadgetViewParams';
      container = createContainerSpy();
      window.osapi.container.Container = jasmine.createSpy('Container').andCallFake(function() {
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
    };
  
    function createContainerSpy() {
      var container = jasmine.createSpyObj('container', 
              ['addGadgetLifecycleCallback', 'newGadgetSite', 'preloadGadget',
               'navigateGadget', 'unloadGadget', 'closeGadget']);
      container.preloadGadget.andCallFake(function(url, callback) {
        var metadata = {};
        metadata[url] = {};
        callback(metadata);
      });
    
      var site = createSiteSpy();
      container.newGadgetSite.andCallFake(function() {
        return site;
      });
    
      container.actions = createActionsSpy();
      container.views = createViewsSpy();
      container.ee = createEESpy();
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
      return jasmine.createSpyObj('actions', 
              ['registerShowActionsHandler', 'registerHideActionsHandler', 
               'registerNavigateGadgetHandler']);
    };
  
    function createViewsSpy() {
      return jasmine.createSpyObj('views', 
              ['createElementForUrl', 'createElementForGadget', 
               'createElementForEmbeddedExperience', 'destroyElement']);
    };
  
    function createEESpy() {
      var ee = jasmine.createSpyObj('ee', ['navigate']);
      return ee;
    };
  
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
      defineContainerNamespace();
      defineGadgetNameSpace();
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
    });
  
    it("can be started", function() {
      var gadgetArea = new GadgetArea();
    
      document.getElementById('testDiv').appendChild(gadgetArea.domNode);
      gadgetArea.startup();
      expect(container.addGadgetLifecycleCallback.calls.length).toEqual(1);
      expect(container.actions.registerShowActionsHandler.calls.length).toEqual(1);
      expect(container.actions.registerHideActionsHandler.calls.length).toEqual(1);
      expect(container.actions.registerNavigateGadgetHandler.calls.length).toEqual(1);
      gadgetArea.destroy();
    });
  
    it("can load a gadget", function() {
      var gadgetArea = new GadgetArea();
      document.getElementById('testDiv').appendChild(gadgetArea.domNode);
      gadgetArea.startup();
      gadgetArea.loadGadget('http://example.com/gadget.xml');
      //The first argument is a spy object for the site
      expect(container.navigateGadget).toHaveBeenCalledWith(jasmine.any(Object), 'http://example.com/gadget.xml', 
              {"gadgetUrl" : "http://example.com/gadget.xml"}, 
              {"height" : "100%", "width" : "100%"});
      gadgetArea.destroy();
    });
  
    it("can handle an error when loading a gadget", function() {
      var gadgetArea = new GadgetArea();
      document.getElementById('testDiv').appendChild(gadgetArea.domNode);
      gadgetArea.startup();
      container.preloadGadget.andCallFake(function(url, callback) {
        var metadata = {};
        callback(metadata);
      });
      gadgetArea.loadGadget('http://example.com/gadget.xml');
      expect(container.navigateGadget).not.toHaveBeenCalled();
      
      gadgetArea.renderEmbeddedExperience('http://example.com/gadget.xml', "{" +
              "\"gadget\" : \"http://example.com/gadget.xml\"," +
              "\"context\" : {" +
                "\"id\" : 123" +
              "}" +
            "}");
      
      expect(container.ee.navigate).not.toHaveBeenCalled();
      gadgetArea.destroy();
    });
  
    it("can load consecutive gadgets", function() {
      var gadgetArea = new GadgetArea();
      document.getElementById('testDiv').appendChild(gadgetArea.domNode);
      gadgetArea.startup();
      gadgetArea.loadGadget('http://example.com/gadget.xml');
      //The first argument is a spy object for the site
      expect(container.navigateGadget).toHaveBeenCalledWith(jasmine.any(Object), 'http://example.com/gadget.xml', 
              {"gadgetUrl" : "http://example.com/gadget.xml"}, 
              {"height" : "100%", "width" : "100%"});
      expect(container.unloadGadget).not.toHaveBeenCalled();
      expect(container.closeGadget).not.toHaveBeenCalled();
      gadgetArea.loadGadget('http://example.com/gadget.xml');
      expect(container.unloadGadget).toHaveBeenCalledWith('http://example.com/gadget.xml');
      expect(container.unloadGadget.calls.length).toEqual(1);
      expect(container.closeGadget.calls.length).toEqual(1);
      //The first argument is a spy object for the site
      expect(container.navigateGadget).toHaveBeenCalledWith(jasmine.any(Object), 'http://example.com/gadget.xml', 
              {"gadgetUrl" : "http://example.com/gadget.xml"}, 
              {"height" : "100%", "width" : "100%"});
      gadgetArea.destroy();
    });
  
    it("can render embedded experience gadgets", function() {
      var gadgetArea = new GadgetArea();
      document.getElementById('testDiv').appendChild(gadgetArea.domNode);
      gadgetArea.startup();
      gadgetArea.renderEmbeddedExperience('http://example.com/gadget.xml', "{" +
        "\"gadget\" : \"http://example.com/gadget.xml\"," +
        "\"context\" : {" +
          "\"id\" : 123" +
        "}" +
      "}");
      var renderParams = {};
      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS] = {};
      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS][osapi.container.RenderParam.HEIGHT] = '100%';
      renderParams[osapi.container.ee.RenderParam.GADGET_RENDER_PARAMS][osapi.container.RenderParam.WIDTH] = '100%';
      renderParams[osapi.container.ee.RenderParam.GADGET_VIEW_PARAMS] = {"gadgetUrl" : 'http://example.com/gadget.xml'}; 
      expect(container.ee.navigate).toHaveBeenCalledWith(jasmine.any(Object), {
        "gadget" : "http://example.com/gadget.xml",
        "context" : {
          "id" : 123
        }
      }, renderParams, jasmine.any(Function));
      gadgetArea.destroy();
    });
  });
});