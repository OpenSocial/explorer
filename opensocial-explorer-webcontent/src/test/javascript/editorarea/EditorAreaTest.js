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
    var editorArea;
    runs(function() {
      require(['modules/widgets/editorarea/EditorArea'], function(EditorArea) {
        editorArea = EditorArea.getInstance();
      });
    });
    
    waitsFor(function() {
      return editorArea != null;
    });
    
    runs(function() {
      spyOn(editorArea, 'getGadgetSpecService').andReturn({
        getDefaultGadgetSpec : function(callbacks) {
          var data = {
                  gadgetResource : {
                    name : "gadget.xml",
                    content : "some content"
                  }
          };
          callbacks.success(data);
        }
      });
      spyOn(editorArea, 'renderGadget').andReturn(undefined);
      document.getElementById('testDiv').appendChild(editorArea.domNode);
      editorArea.startup();
      expect(editorArea.renderGadget).toHaveBeenCalled();
      expect(editorArea.getEditorTabs().tabs.length).toEqual(1);
      editorArea.destroy();
    });
  });
  
  it("can be started with an error", function() {
    var editorArea;
    runs(function() {
      require(['modules/widgets/editorarea/EditorArea'], function(EditorArea) {
        editorArea = EditorArea.getInstance();
      });
    });
    
    waitsFor(function() {
      return editorArea != null;
    });
    
    runs(function() {
      spyOn(editorArea, 'getGadgetSpecService').andReturn({
        getDefaultGadgetSpec : function(callbacks) {
          callbacks.error();
        }
      });
      spyOn(editorArea, 'renderGadget').andReturn(undefined);
      document.getElementById('testDiv').appendChild(editorArea.domNode);
      editorArea.startup();
      expect(editorArea.renderGadget).not.toHaveBeenCalled();
      expect(editorArea.getEditorTabs()).toBeUndefined();
      editorArea.destroy();
    });
  });
  
  it("can display any spec with an id", function() {
    var editorArea;
    runs(function() {
      require(['modules/widgets/editorarea/EditorArea'], function(EditorArea) {
        editorArea = EditorArea.getInstance();
      });
    });
    
    waitsFor(function() {
      return editorArea != null;
    });
    
    runs(function() {
      spyOn(editorArea, 'getGadgetSpecService').andReturn({
        getDefaultGadgetSpec : function(callbacks) {
          var data = {
                  gadgetResource : {
                    name : "gadget.xml",
                    content : "some content"
                  }
          };
          callbacks.success(data);
        },
        getGadgetSpec : function(id, callbacks) {
          var data = {
                  gadgetResource : {
                    name : "gadget.xml",
                    content : "some content"
                  }
          };
          callbacks.success(data);
        }
      });
      spyOn(editorArea, 'renderGadget').andReturn(undefined);
      document.getElementById('testDiv').appendChild(editorArea.domNode);
      editorArea.startup();
      editorArea.displaySpec('1234');
      expect(editorArea.renderGadget.calls.length).toEqual(2);
      editorArea.destroy();
    });
  });
  
  it("can handle an error when displaying a spec with an id", function() {
    var editorArea;
    runs(function() {
      require(['modules/widgets/editorarea/EditorArea'], function(EditorArea) {
        editorArea = EditorArea.getInstance();
      });
    });
    
    waitsFor(function() {
      return editorArea != null;
    });
    
    runs(function() {
      spyOn(editorArea, 'getGadgetSpecService').andReturn({
        getDefaultGadgetSpec : function(callbacks) {
          var data = {
                  gadgetResource : {
                    name : "gadget.xml",
                    content : "some content"
                  }
          };
          callbacks.success(data);
        },
        getGadgetSpec : function(id, callbacks) {
          callbacks.error();
        }
      });
      spyOn(editorArea, 'renderGadget').andReturn(undefined);
      document.getElementById('testDiv').appendChild(editorArea.domNode);
      editorArea.startup();
      expect(editorArea.renderGadget.calls.length).toEqual(1);
      expect(editorArea.getEditorTabs().tabs.length).toEqual(1);
      editorArea.destroy();
    });
  });
});