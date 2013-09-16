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

/**
 * Displays the code of a particular EditorTab.
 *
 * @module modules/widgets/editorarea/Editor
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/query', 'dojo/text!./../../templates/Editor.html',
        'dojo/json', 'dojo/dom-class', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, WidgetBase, TemplatedMixin, query, template, json, domClass) {
  return declare('EditorWidget', [ WidgetBase, TemplatedMixin ], {
    templateString : template,

    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:modules/widgets/editorarea/Editor#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      var textArea = query('textarea', this.domNode)[0];
      textArea.value = this.resource.content;
      this.editor = CodeMirror.fromTextArea(textArea, {
        mode: this.mode,
        lineNumbers: true,
        lineWrapping: true
      });
      var hlLine = this.editor.addLineClass(0, "background", "activeline"),
      self = this;
      this.editor.on("cursorActivity", function() {
        var cur = self.editor.getLineHandle(self.editor.getCursor().line);
        if (cur !== hlLine) {
          self.editor.removeLineClass(hlLine, "background", "activeline");
          hlLine = self.editor.addLineClass(cur, "background", "activeline");
        }
      });
    },

    /**
     * Shows the Editor.
     *
     * @memberof module:modules/widgets/editorarea/Editor#
     */
    show : function() {
      domClass.remove(this.domNode, 'hide');
      this.refresh();
    },

    /**
     * Hides the Editor.
     *
     * @memberof module:modules/widgets/editorarea/Editor#
     */
    hide : function() {
      domClass.add(this.domNode, 'hide');
    },

    /**
     * Gets the content of the CodeMirror
     *
     * @memberof module:modules/widgets/editorarea/Editor#
     * @returns {String} Content of CodeMirror
     */
    getContent : function() {
      return this.editor.getValue();
    },

    /**
     * Refreshes the CodeMirror.
     *
     * @memberof module:modules/widgets/editorarea/Editor#
     */
    refresh : function() {
      this.editor.refresh();
    }
  });
});