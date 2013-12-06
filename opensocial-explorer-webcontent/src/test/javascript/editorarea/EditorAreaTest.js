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
define(['explorer/widgets/editorarea/EditorArea', 'explorer/gadget-spec-service', 'dojo/Deferred'], 
    function(EditorArea, gadgetSpecService, Deferred){
  describe('An EditorArea widget', function() {
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);

      var editor = jasmine.createSpyObj('editor', ['addLineClass', 'on', 'getValue', 'refresh']);
      window.CodeMirror = jasmine.createSpyObj('CodeMirror', ['fromTextArea']);
      window.CodeMirror.fromTextArea.andReturn(editor);
    });

    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
      window.CodeMirror = undefined;
    });

    it("can be started", function() {
      var editorArea = new EditorArea();
      spyOn(gadgetSpecService, 'getDefaultGadgetSpec').andCallFake(function() {
        var dfd = new Deferred();
        var data = {
            gadgetResource : {
              name : "gadget.xml",
              content : "some content"
            },
            id: "testing"
        };
        dfd.resolve(data);
        return dfd;
      });
      spyOn(editorArea, 'emit').andCallThrough();
      document.getElementById('testDiv').appendChild(editorArea.domNode);
      editorArea.startup();
      expect(editorArea.emit).toHaveBeenCalledWith("renderGadget", "testing");
      expect(editorArea.getEditorTabs().tabs.length).toEqual(1);
      editorArea.destroy();
    });

    it("can be started with an error", function() {
      var editorArea = new EditorArea();
      spyOn(gadgetSpecService, 'getDefaultGadgetSpec').andCallFake(function() {
        var dfd = new Deferred();
        dfd.reject();
        return dfd;
      });
      spyOn(editorArea, 'emit').andCallThrough();
      document.getElementById('testDiv').appendChild(editorArea.domNode);
      editorArea.startup();
      expect(editorArea.emit).not.toHaveBeenCalled();
      expect(editorArea.getEditorTabs()).toBeUndefined();
      editorArea.destroy();
    });

    it("can display any spec with an id", function() {
      var editorArea = new EditorArea();
      spyOn(gadgetSpecService, 'getDefaultGadgetSpec').andCallFake(function() {
        var dfd = new Deferred();
        var data = {
            gadgetResource : {
              name : "gadget.xml",
              content : "some content"
            },
            id: "1234"
        };
        dfd.resolve(data);
        return dfd;
      });
      spyOn(gadgetSpecService, 'getGadgetSpec').andCallFake(function(id) {
        var dfd = new Deferred();
        var data = {
            gadgetResource : {
              name : "gadget.xml",
              content : "some content"
            },
            id: "1234"
        };
        dfd.resolve(data);
        return dfd;
      });
      spyOn(editorArea, 'emit').andCallThrough();
      document.getElementById('testDiv').appendChild(editorArea.domNode);
      editorArea.startup();
      editorArea.displaySpec('1234');
      expect(editorArea.emit).toHaveBeenCalledWith("renderGadget", "1234");
      editorArea.destroy();
    });

    it("can handle an error when displaying a spec with an id", function() {
      var editorArea = new EditorArea();
      spyOn(gadgetSpecService, 'getDefaultGadgetSpec').andCallFake(function() {
        var dfd = new Deferred();
        var data = {
            gadgetResource : {
              name : "gadget.xml",
              content : "some content"
            },
            id: "1234"
        };
        dfd.resolve(data);
        return dfd;
      });
      spyOn(gadgetSpecService, 'getGadgetSpec').andCallFake(function(id) {
        var dfd = new Deferred();
        dfd.reject();
        return dfd;
      });
      spyOn(editorArea, 'emit').andCallThrough();
      document.getElementById('testDiv').appendChild(editorArea.domNode);
      editorArea.startup();
      expect(editorArea.emit.calls.length).toEqual(1);
      expect(editorArea.getEditorTabs().tabs.length).toEqual(1);
      editorArea.destroy();
    });
  });
});