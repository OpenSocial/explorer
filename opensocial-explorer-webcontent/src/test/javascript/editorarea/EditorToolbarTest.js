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
define(['explorer/widgets/editorarea/EditorToolbar', 'dojo/query', 'dojo/dom-class',
  'dojo/NodeList-manipulate', 'dojo/NodeList-dom'], function(EditorToolbar, query, domClass){
  describe('An EditorToolbar widget', function() {
    var editorArea;
    beforeEach(function() {
      var div = document.createElement("div");
      div.style.display = 'none';
      div.id = 'testDiv';
      document.body.appendChild(div);
    });
  
    afterEach(function() {
      document.body.removeChild(document.getElementById('testDiv'));
    });

    it("can respond to a render gadget click", function() {
      var editorToolbar = new EditorToolbar();
      spyOn(editorToolbar, "emit").andCallThrough();
      document.getElementById('testDiv').appendChild(editorToolbar.domNode);
      editorToolbar.renderGadgetButton.click();
      expect(editorToolbar.emit).toHaveBeenCalledWith("renderGadgetClick");
      editorToolbar.destroy();
    });

    it("can respond to a render ee gadget click", function() {
      var editorToolbar = new EditorToolbar();
      spyOn(editorToolbar, "emit").andCallThrough();
      document.getElementById('testDiv').appendChild(editorToolbar.domNode);
      editorToolbar.renderEEButton.click();
      expect(editorToolbar.emit).toHaveBeenCalledWith("renderEEClick");
      editorToolbar.destroy();
    });

    it('can set the title in the editor toolbar', function() {
      var editorToolbar = new EditorToolbar();
      document.getElementById('testDiv').appendChild(editorToolbar.domNode);
      editorToolbar.setTitle('testing');
      expect(query('.brand', this.domNode)[0].innerHTML).toEqual('testing');
      editorToolbar.destroy();
    });

    it('can show and hide the embedded experiences button', function() {
      var editorToolbar = new EditorToolbar();
      document.getElementById('testDiv').appendChild(editorToolbar.domNode);
      editorToolbar.showRenderEEButton();
      expect(domClass.contains(editorToolbar.renderEEButton, 'hide')).toEqual(false);
      editorToolbar.hideRenderEEButton();
      expect(domClass.contains(editorToolbar.renderEEButton, 'hide')).toEqual(true);
      editorToolbar.destroy();
    })
  });
});