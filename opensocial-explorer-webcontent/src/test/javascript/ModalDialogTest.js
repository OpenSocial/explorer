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
describe('A ModalDialog widget', function(){
  it("can be hidden", function() {
    var dialog;
    runs(function() {
      require(['modules/widgets/ModalDialog'], function(ModalDialog) {
        dialog = new ModalDialog();
        dialog.startup();
      });
    })
    
    waitsFor(function() {
      return dialog !== undefined;
    });
    
    runs(function() {
      dialog.hide();
      expect(dialog.domNode.getAttribute('class')).toBe('modal hide fade');
    });
  });
  
  it("can be shown", function() {
    var dialog;
    runs(function() {
      require(['modules/widgets/ModalDialog'], function(ModalDialog) {
        dialog = new ModalDialog();
        dialog.startup();
      });
    })
    
    waitsFor(function() {
      return dialog !== undefined;
    });
    
    runs(function() {
      dialog.show();
      expect(dialog.domNode.getAttribute('class')).toBe('modal fade in');
    })
  });
  
  it("can change its title", function() {
    var dialog;
    var query;
    runs(function() {
      require(['modules/widgets/ModalDialog', 'dojo/query',
               'dojo/NodeList-manipulate', 'dojo/NodeList-dom'], function(ModalDialog, dojoQuery) {
        dialog = new ModalDialog();
        dialog.startup();
        query = dojoQuery;
      });
    })
    
    waitsFor(function() {
      return dialog !== undefined && query !== undefined;
    });
    
    runs(function() {
      dialog.setHeaderTitle('Test title');
      expect(query('div.modal-header h3', dialog.domNode).innerHTML()).toBe('Test title');
    });
  });
});