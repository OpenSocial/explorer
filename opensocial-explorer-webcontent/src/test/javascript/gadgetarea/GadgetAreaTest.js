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
define(['explorer/widgets/gadgetarea/GadgetArea', 'dojo/_base/declare', 'dojo/Evented', 'dojo/dom-class', 'dojo/query',
        'dojo/topic'], 
        function(GadgetArea, declare, Evented, domClass, query, topic){
  describe('An GadgetArea widget', function() {
    
    var MockContainer = declare([Evented], {
      fireGadgetRendered : function(gadgetUrl, siteId) {
        this.emit('gadgetrendered', gadgetUrl, siteId);
      },
      
      fireSetPreferences : function(site, url, preferences) {
        this.emit('setpreferences', site, url, preferences);
      },
      
      fireAddAction : function(action) {
        this.emit('addaction', action);
      },
      
      fireRemoveAction : function(action) {
        this.emit('removeaction', action);
      },
      
      fireNavigateUrl : function(rel, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
        this.emit('navigateurl', rel, opt_viewTarget, opt_coordinates, parentSite, opt_callback);
      },
      
      fireNavigateGadget : function(metadata, rel, opt_view, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
        this.emit('navigategadget', metadata, rel, opt_view, opt_viewTarget, opt_coordinates, parentSite, opt_callback);
      },
      
      fireNavigateEE : function(el, opt_gadgetInfo, opt_viewTarget, opt_coordinates, parentSite, opt_callback) {
        this.emit('navigateee', el, opt_gadgetInfo, opt_viewTarget, opt_coordinates, parentSite, opt_callback);
      },
      
      fireDestroyElement : function(site) {
        this.emit('destroyelement', site);
      },
      
      fireNavigateForActions : function(gadgetUrl, opt_params) {
        this.emit('navigateforactions', gadgetUrl, opt_params);
      },
      
      renderGadget : function(url, site, opt_renderParams){},
      
      renderEmbeddedExperience : function(url, dataModel){},
      
      getContainer : function() {
        return jasmine.createSpy('container');
      },
      
      updateContainerSecurityToken : function(token, ttl){}
    });
  
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
      gadgetArea = new GadgetArea();
      document.getElementById('testDiv').appendChild(gadgetArea.domNode);
      mockContainer = new MockContainer();
      spyOn(gadgetArea, 'getExplorerContainer').andReturn(mockContainer);
      gadgetArea.startup();
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
      gadgetArea.destroy();
    });
    
    it("handles the gadgetrendered event", function() {
      mockContainer.fireGadgetRendered('http://example.com/gadget.xml', '123');
      var loading = query('.progress-striped', gadgetArea.domNode)[0];
      expect(domClass.contains(loading, 'hide')).toEqual(true);
    });
    
    it("handles the addaction event", function() {
      spyOn(gadgetArea.gadgetToolbar, 'addAction').andCallThrough();
      var action = {
        "dataType" : "opensocial.Person",
        "id" : "org-opensocial-explorer-person",
        "label" : "Person Action",
        "tooltip" : "Execute the person action"
      };
      mockContainer.fireAddAction(action);
      expect(gadgetArea.gadgetToolbar.addAction).toHaveBeenCalledWith(action);
    });
    
    it("handles the removeaction event", function() {
      spyOn(gadgetArea.gadgetToolbar, 'removeAction').andReturn(undefined);
      var action = {
        "dataType" : "opensocial.Person",
        "id" : "org-opensocial-explorer-person",
        "label" : "Person Action",
        "tooltip" : "Execute the person action"
      };
      mockContainer.fireRemoveAction(action);
      expect(gadgetArea.gadgetToolbar.removeAction).toHaveBeenCalledWith(action);
    });
    
    it("handles the navigateurl event", function() {
      spyOn(gadgetArea, 'createModal').andCallThrough();
      var spyCallback = jasmine.createSpy('callbackSpy');
      mockContainer.fireNavigateUrl(undefined, 'sidebar', undefined, undefined, spyCallback);
      expect(gadgetArea.createModal).toHaveBeenCalledWith('URL', 'sidebar');
      expect(spyCallback).toHaveBeenCalledWith(jasmine.any(Element));
    });
    
    it("handles the navigategadget event", function() {
      spyOn(gadgetArea, 'createModal').andCallThrough();
      var spyCallback = jasmine.createSpy('callbackSpy');
      mockContainer.fireNavigateGadget({}, undefined, undefined, 'sidebar', undefined, undefined, spyCallback);
      expect(gadgetArea.createModal).toHaveBeenCalledWith('Gadget', 'sidebar');
      expect(spyCallback).toHaveBeenCalledWith(jasmine.any(Element));
      mockContainer.fireNavigateGadget({"modulePrefs" : {
        "title" : "test title"
      }}, undefined, undefined, 'sidebar', undefined, undefined, spyCallback);
      expect(gadgetArea.createModal).toHaveBeenCalledWith('test title', 'sidebar');
      expect(spyCallback).toHaveBeenCalledWith(jasmine.any(Element));
    });
    
    it("handles the navigateee event", function() {
      spyOn(gadgetArea, 'createModal').andCallThrough();
      var spyCallback = jasmine.createSpy('callbackSpy');
      mockContainer.fireNavigateEE(undefined, {}, 'sidebar', undefined, undefined, spyCallback);
      expect(gadgetArea.createModal).toHaveBeenCalledWith('Embedded Experiences', 'sidebar');
      expect(spyCallback).toHaveBeenCalledWith(jasmine.any(Element));
      mockContainer.fireNavigateEE(undefined, {"modulePrefs" : {
        "title" : "test title"
      }}, 'sidebar', undefined, undefined, spyCallback);
      expect(gadgetArea.createModal).toHaveBeenCalledWith('test title', 'sidebar');
      expect(spyCallback).toHaveBeenCalledWith(jasmine.any(Element));
    });
    
    it("handles the destroyelement event", function() {
      spyOn(gadgetArea, 'createModal').andCallThrough();
      var spyCallback = jasmine.createSpy('callbackSpy');
      mockContainer.fireNavigateEE(undefined, {}, 'sidebar', undefined, undefined, spyCallback);
      spyOn(gadgetArea.gadgetModal, 'hide').andReturn(undefined);
      var mockSite = jasmine.createSpy('mockSite');
      mockContainer.fireDestroyElement(mockSite);
      expect(gadgetArea.gadgetModal.hide).toHaveBeenCalledWith(mockSite)
    });
    
    it("handles the navigateforactions event", function() {
      spyOn(gadgetArea, 'reRenderGadget').andReturn(undefined);
      var params = jasmine.createSpy('params');
      mockContainer.fireNavigateForActions('http://example.com/gadget.xml', params);
      expect(gadgetArea.reRenderGadget).toHaveBeenCalledWith(params);
    });
    
    it("can render a gadget", function() {
      spyOn(gadgetArea, 'closeOpenSite').andCallThrough();
      var siteSpy = jasmine.createSpy('site');
      spyOn(gadgetArea, 'createSite').andReturn(siteSpy);
      var params = {"param1" : "value1"};
      var deferred = jasmine.createSpyObj('defferred', ['then']);
      deferred.then.andCallFake(function(callback) {
        var metadata = {
          "http://example.com/gadget.xml" : {
            "key" : "value"
          }
        };
        callback(metadata);
      });
      spyOn(mockContainer, 'renderGadget').andReturn(deferred);
      spyOn(gadgetArea.gadgetToolbar, 'setGadgetMetadata');
      gadgetArea.renderGadget('http://example.com/gadget.xml', params);
      var loading = query('.progress-striped', gadgetArea.domNode)[0];
      expect(domClass.contains(loading, 'hide')).toEqual(false);
      expect(mockContainer.renderGadget).toHaveBeenCalledWith('http://example.com/gadget.xml', siteSpy, params);
      expect(deferred.then).toHaveBeenCalled();
      expect(gadgetArea.gadgetToolbar.setGadgetMetadata).toHaveBeenCalledWith({"key" : "value"});
    });
    
    it("can render an embedded experience", function() {
      spyOn(gadgetArea, 'closeOpenSite').andCallThrough();
      var siteSpy = jasmine.createSpy('site');
      spyOn(gadgetArea, 'createSite').andReturn(siteSpy);
      var params = {"param1" : "value1"};
      var deferred = jasmine.createSpyObj('defferred', ['then']);
      deferred.then.andCallFake(function(callback) {
        var results = {
          "metadata" : {
            "http://example.com/gadget.xml" : {
              "key" : "value"
            }
          }
        };
        callback(results);
      });
      spyOn(mockContainer, 'renderEmbeddedExperience').andReturn(deferred);
      spyOn(gadgetArea.gadgetToolbar, 'setGadgetMetadata');
      gadgetArea.renderEmbeddedExperience('http://example.com/gadget.xml', "{\"context\" : \"123\"}");
      var loading = query('.progress-striped', gadgetArea.domNode)[0];
      expect(domClass.contains(loading, 'hide')).toEqual(false);
      expect(mockContainer.renderEmbeddedExperience).toHaveBeenCalledWith({
        "context" : "123",
        "gadget" : "http://example.com/gadget.xml"
      }, jasmine.any(Element));
      expect(deferred.then).toHaveBeenCalled();
      expect(gadgetArea.gadgetToolbar.setGadgetMetadata).toHaveBeenCalledWith({"key" : "value"});
    });
    
    it("can rerender a gadget", function() {
      var mockSiteHolder = jasmine.createSpyObj('siteHolder', ['getUrl']);
      mockSiteHolder.getUrl.andCallFake(function() {
        return 'http://example.com/gadget.xml';
      })
      var mockSite = jasmine.createSpyObj('site', ['getActiveSiteHolder']);
      mockSite.getActiveSiteHolder.andCallFake(function() {
        return mockSiteHolder;
      });
      gadgetArea.site = mockSite;
      spyOn(gadgetArea, 'renderGadget').andReturn(undefined);
      gadgetArea.reRenderGadget({"key" : "value"});
      expect(gadgetArea.renderGadget).toHaveBeenCalledWith('http://example.com/gadget.xml', {"key" : "value"});
    });
    
    it("can create a gadget site", function() {
      var mockSite = jasmine.createSpy('mockSite');
      var container = jasmine.createSpyObj('container', ['newGadgetSite']);
      container.newGadgetSite.andCallFake(function() {
        return mockSite;
      });
      spyOn(mockContainer, 'getContainer').andCallFake(function() {
        return container;
      });
      var site = gadgetArea.createSite();
      expect(site).toEqual(mockSite);
      expect(container.newGadgetSite).toHaveBeenCalledWith(jasmine.any(Element));
    });
    
    it("can close an open gadget site", function() {
      var mockSiteHolder = jasmine.createSpyObj('siteHolder', ['getUrl']);
      mockSiteHolder.getUrl.andCallFake(function() {
        return 'http://example.com/gadget.xml';
      })
      var mockSite = jasmine.createSpyObj('site', ['getActiveSiteHolder']);
      mockSite.getActiveSiteHolder.andCallFake(function() {
        return mockSiteHolder;
      });
      gadgetArea.site = mockSite;
      var container = jasmine.createSpyObj('container', ['unloadGadget', 'closeGadget']);
      spyOn(mockContainer, 'getContainer').andCallFake(function() {
        return container;
      });
      gadgetArea.closeOpenSite();
      expect(container.unloadGadget).toHaveBeenCalledWith('http://example.com/gadget.xml');
      expect(container.closeGadget).toHaveBeenCalledWith(mockSite);
    });
    
    it("can update the security token", function() {
      var container = jasmine.createSpyObj('container', ['updateContainerSecurityToken']);
      spyOn(mockContainer, 'updateContainerSecurityToken').andCallThrough();
      gadgetArea.updateContainerSecurityToken('123', 320);
      expect(mockContainer.updateContainerSecurityToken).toHaveBeenCalledWith('123', 320);
    });
  });
});