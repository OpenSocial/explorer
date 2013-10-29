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
define(['explorer/widgets/gadgetarea/LocationMenuItem', 'dojo/dom-construct',
        'dojo/topic', 'dojo/dom-class'], function(LocationMenuItem, domConstruct, topic, domClass){
  describe('A LocationMenuItem widget', function() {
    
    beforeEach(function() {      
      var div = domConstruct.create('div', {id : "testDiv"});
      editor = domConstruct.create('div', {id : "editor", class : "editor"});
      result = domConstruct.create('div', {id : "result", class : "result"});
      codeMirror = domConstruct.create('div', {id : "codeMirror", class : "CodeMirror-scroll"});
      domConstruct.place(editor, div, 'last');
      domConstruct.place(result, div, 'last');
      domConstruct.place(codeMirror, div, 'last');
      document.body.appendChild(div);
      
      locationMenu = new LocationMenuItem();
      domConstruct.place(locationMenu.domNode, div, 'last');
      locationMenu.startup();
    });
  
    afterEach(function() {
      locationMenu.destroy();
      document.body.removeChild(document.getElementById('testDiv'));
    });
  
    it("can move the result to the side", function() {
      domClass.add(editor, 'topBottom');
      domClass.add(result, 'topBottom');
      domClass.add(codeMirror, 'topBottom');
      var refreshed = false;
      var handle = topic.subscribe("refreshEditors", function() {
        refreshed = true;
      });
      runs(function() {
        locationMenu.sideMenuOption.domNode.click();
      });
      
      waitsFor(function() {
        return refreshed;
      }, "The refreshEditors topic was not published.", 750);
      
      runs(function() {
        expect(domClass.contains(editor, 'topBottom')).toBeFalsy();
        expect(domClass.contains(result, 'topBottom')).toBeFalsy();
        expect(domClass.contains(codeMirror, 'topBottom')).toBeFalsy();
        handle.remove();
      });
    });
    
    it("can move the result to the bottom", function() {
      var refreshed = false;
      var handle = topic.subscribe("refreshEditors", function() {
        refreshed = true;
      });
      runs(function() {
        locationMenu.bottomMenuOption.domNode.click();
      });
      
      waitsFor(function() {
        return refreshed;
      }, "The refreshEditors topic was not published.", 750);
      
      runs(function() {
        expect(domClass.contains(editor, 'topBottom')).toBeTruthy();
        expect(domClass.contains(result, 'topBottom')).toBeTruthy();
        expect(domClass.contains(codeMirror, 'topBottom')).toBeTruthy();
        handle.remove();
      });
    });
  });
});