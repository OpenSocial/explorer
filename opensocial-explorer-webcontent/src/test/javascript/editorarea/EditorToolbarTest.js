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
define(['modules/widgets/editorarea/EditorToolbar', 'dojo/query', 'dojo/dom-class',
  'dojo/NodeList-manipulate', 'dojo/NodeList-dom'], function(EditorToolbar, query, domClass){
  describe('An EditorToolbar widget', function() {
    var editorArea;
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);

      editorArea = jasmine.createSpyObj('editorArea', ['renderGadget', 'getGadgetSpec',
        'renderEmbeddedExperience']);
      editorArea.getGadgetSpec.andCallFake(function() {
        return {"gadget" : "gadget.xml"};
      });
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
    });

    function createSpecServiceSpy() {
      var specService = jasmine.createSpyObj('specService', ['createNewGadgetSpec']);
      specService.createNewGadgetSpec.andCallFake(function(gadgetSpec, callbacks) {
        callbacks.success({"id" : "abc123"});
      });
      return specService;
    };

    function createErrorSpecServiceSpy() {
        var specService = jasmine.createSpyObj('specService', ['createNewGadgetSpec']);
        specService.createNewGadgetSpec.andCallFake(function(gadgetSpec, callbacks) {
          callbacks.error();
        });
        return specService;
    };

    function createEditorToolbar(specService) {
      var editorToolbar = new EditorToolbar({'editorArea' : editorArea});
      spyOn(editorToolbar, 'getGadgetSpecService').andCallFake(function() {
        return specService;
      });
      document.getElementById('testDiv').appendChild(editorToolbar.domNode);
      editorToolbar.startup();
      return editorToolbar;
    };

    it("can render a gadget", function() {
      var specService = createSpecServiceSpy();
      var editorToolbar = createEditorToolbar(specService);
      document.getElementById('renderBtn').click();
      expect(editorArea.renderGadget).toHaveBeenCalledWith('abc123');
      expect(specService.createNewGadgetSpec).toHaveBeenCalledWith({"gadget" : "gadget.xml"}, jasmine.any(Object));
      editorToolbar.destroy();
    });

    it("can handle an error when rendering a gadget", function() {
      var specService = createErrorSpecServiceSpy();
      var editorToolbar = createEditorToolbar(specService);
      document.getElementById('renderBtn').click();
      expect(editorArea.renderGadget).not.toHaveBeenCalled();
      expect(specService.createNewGadgetSpec).toHaveBeenCalledWith({"gadget" : "gadget.xml"}, jasmine.any(Object));
      editorToolbar.destroy();
    });

    it("can render an embedded experience", function() {
      var specService = createSpecServiceSpy();
      var editorToolbar = createEditorToolbar(specService);
      document.getElementById('renderEEBtn').click();
      expect(editorArea.renderEmbeddedExperience).toHaveBeenCalledWith('abc123');
      expect(specService.createNewGadgetSpec).toHaveBeenCalledWith({"gadget" : "gadget.xml"}, jasmine.any(Object));
      editorToolbar.destroy();
    });

    it("can handle an error when rendering an embedded experience", function() {
      var specService = createErrorSpecServiceSpy();
      var editorToolbar = createEditorToolbar(specService)
      document.getElementById('renderEEBtn').click();
      expect(editorArea.renderEmbeddedExperience).not.toHaveBeenCalled();
      expect(specService.createNewGadgetSpec).toHaveBeenCalledWith({"gadget" : "gadget.xml"}, jasmine.any(Object));
      editorToolbar.destroy();
    });

    it('can set the title in the editor toolbar', function() {
      var specService = createSpecServiceSpy();
      var editorToolbar = createEditorToolbar(specService);
      editorToolbar.setTitle('testing');
      expect(query('.brand', this.domNode)[0].innerHTML).toEqual('testing');
      editorToolbar.destroy();
    });

    it('can show and hide the embedded experiences button', function() {
      var specService = createSpecServiceSpy();
      var editorToolbar = createEditorToolbar(specService);
      editorToolbar.showEEButton();
      expect(domClass.contains('renderEEBtn', 'hide')).toEqual(false);
      editorToolbar.hideEEButton();
      expect(domClass.contains('renderEEBtn', 'hide')).toEqual(true);
      editorToolbar.destroy();
    })
  });
});