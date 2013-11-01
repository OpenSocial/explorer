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
 * The location menu.
 *
 * @module explorer/widgets/gadgetarea/LocationMenuItem
 * @augments explorer/widgets/MenuItemWidget
 * @augments dijit/_WidgetsInTemplateMixin
 * @see {@link module:explorer/widgets/MenuItemWidget|MenuItemWidget Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 */
define(['dojo/_base/declare', '../MenuItemWidget', 'dijit/_WidgetsInTemplateMixin',
        'dojo/text!./../../templates/LocationMenuItem.html',
        'dojo/on', 'dojo/topic', 'dojo/query', 'dojo/NodeList-manipulate', 
        'dojo/NodeList-dom'],
        function(declare, MenuItemWidget, WidgetsInTemplateMixin, template, on, topic, query) {
  return declare('LocationMenuItemWidget', [ MenuItemWidget, WidgetsInTemplateMixin ], {
    templateString : template,

    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/gadgetarea/LocationMenuItem#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      var self = this;
      on(this.sideMenuOption.domNode,'click', function(e) {
        query('div.editor').removeClass('topBottom');
        query('div.result').removeClass('topBottom');
        query('.CodeMirror-scroll').removeClass('topBottom');
        topic.publish("refreshEditors");
      });
      on(this.bottomMenuOption.domNode,'click', function(e) {
        query('div.editor').addClass('topBottom');
        query('div.result').addClass('topBottom');
        query('.CodeMirror-scroll').addClass('topBottom');
        topic.publish("refreshEditors");
      });
    },
  });
});