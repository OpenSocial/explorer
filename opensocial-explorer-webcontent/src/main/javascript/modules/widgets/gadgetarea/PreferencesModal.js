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
 * A modal window that serves as a UI for the Preferences Gadget example.
 *
 * @module explorer/widgets/gadgetarea/PreferencesModal
 * @augments module:explorer/widgets/ModalDialog
 * @requires module:explorer/widgets/controlgroups/BooleanControlGroup
 * @requires module:explorer/widgets/controlgroups/StringControlGroup
 * @requires module:explorer/widgets/controlgroups/EnumControlGroup
 * @requires module:explorer/widgets/controlgroups/ListControlGroup
 */
define(['dojo/_base/declare',  '../ModalDialog', 'dojo/query', 'dojo/dom-construct',
        '../controlgroups/StringControlGroup', '../controlgroups/BooleanControlGroup', 
        '../controlgroups/EnumControlGroup', '../controlgroups/ListControlGroup', 'dojo/on', 
        'dojo/topic', 'dojo/_base/event', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ModalDialog, query, domConstruct, StringControlGroup, BooleanControlGroup, EnumControlGroup, 
            ListControlGroup, on, topic, event) {
  return declare('PreferencesModalWidget', [ ModalDialog ], {

    constructor : function() {
      this.controlGroups = {};
      this.prefsChangedListeners = [];
      var self = this;
      this.showHandle = topic.subscribe('org.opensocial.explorer.prefdialog.show', function(){
        self.show();
      });
      this.hideHandle = topic.subscribe('org.opensocial.explorer.prefdialog.hide', function(){
        self.hide();
      });
    },

    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/gadgetarea/PreferencesModal#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate : function() {
      var form = domConstruct.create('div', {"class" : "form-horizontal"}),
      self = this,
      closeBtn = domConstruct.create('button', {"class" : "btn", "innerHTML" : "Close"}),
      saveBtn = domConstruct.create('button', {"class" : "btn btn-primary", "innerHTML" : "Save"}),
      footer = query('.modal-footer', this.domNode);
      query('.modal-body', this.domNode).append(form);
      on(closeBtn, 'click', function(e) {
        self.hide();
        event.stop(e);
      });
      on(saveBtn, 'click', function(e) {
        self.hide();
        self.notifyPrefsChangedListeners.call(self);
        event.stop(e);
      });
      footer.append(saveBtn);
      footer.append(closeBtn);
    },

    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/gadgetarea/PreferencesModal#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      this.setHeaderTitle('Preferences');
      this.inherited(arguments);
    },

    /**
     * Adds the prefs gadget's metadata to the modal.
     *
     * @memberof module:explorer/widgets/gadgetarea/PreferencesModal#
     * @params {Object} prefs - The prefs object in a gadget's metadata.
     */
    addPrefsToUI : function(prefs) {
      query('.form-horizontal > *', this.domNode).remove();
      //TODO we probably need to destroy the widgets created as well
      for(var key in prefs) {
        if(prefs.hasOwnProperty(key)) {
          var pref = prefs[key];
          this.addPrefToUI(pref);
        }
      }
    },

    /**
     * Adds each pref in prefs to the modal.
     *
     * @memberof module:explorer/widgets/gadgetarea/PreferencesModal#
     * @params {Object} prefs - The prefs object in a gadget's metadata.
     */
    addPrefToUI : function(pref) {
      var controlGroup;
      if(pref.dataType === 'BOOL') {
        controlGroup = new BooleanControlGroup(pref);
      } else if(pref.dataType === 'ENUM') {
        controlGroup = new EnumControlGroup(pref);
      } else if(pref.dataType === 'STRING') {
        controlGroup = new StringControlGroup(pref);
      } else if(pref.dataType === 'LIST') {
        controlGroup = new ListControlGroup(pref);
      }
      if(controlGroup) {
        var form = query('.modal-body .form-horizontal', this.domNode);
        form.append(controlGroup.domNode);
        controlGroup.startup();
        this.controlGroups[pref.name] = controlGroup;
      }
    },

    /**
     * Adds each pref in prefs to the modal.
     *
     * @memberof module:explorer/widgets/gadgetarea/PreferencesModal#
     * @params {Object} prefs - The prefs object in a gadget's metadata.
     */
    notifyPrefsChangedListeners : function() {
      if(!this.isValid()) {
        return;
      }
      var prefs = {};
      for(var key in this.controlGroups) {
        if(this.controlGroups.hasOwnProperty(key)) {
          prefs[this.controlGroups[key].name] = this.controlGroups[key].getValue();
        }
      }
      for(var j = 0; j < this.prefsChangedListeners.length; j++) {
        this.prefsChangedListeners[j](prefs);
      }
    },

    /**
     * Gets the prefs from the control groups.
     *
     * @memberof module:explorer/widgets/gadgetarea/PreferencesModal#
     * @returns {Object} The prefs object assembled from the control groups.
     */
    getPrefs : function() {
      var prefs = {};
      for(var key in this.controlGroups) {
        if(this.controlGroups.hasOwnProperty(key)) {
          prefs[this.controlGroups[key].name] = this.controlGroups[key].getValue();
        }
      }
      return prefs;
    },

    /**
     * Checks whether the prefs' fields are valid (has values).
     *
     * @memberof module:explorer/widgets/gadgetarea/PreferencesModal#
     * @returns {Boolean} Whether or not the fields are valid.
     */
    isValid : function() {
      //TODO go through and validate each field to make sure that the required prefs have values
      return true;
    },

    /**
     * Adds a listener function to the instance variable prefsChangedListeners.
     *
     * @memberof module:explorer/widgets/gadgetarea/PreferencesModal#
     * @param {Function} listener - A callback function that updates the prefs and rerenders the gadget.
     */
    addPrefsChangedListener : function(listener) {
      this.prefsChangedListeners.push(listener);
    },

    /**
     * Sets each control group that exists in a spec's prefs.
     *
     * @memberof module:explorer/widgets/gadgetarea/PreferencesModal#
     * @param {Object} prefs - The prefs object in a gadget's metadata.
     */
    setPrefs : function(prefs) {
      for(var key in prefs) {
        if(prefs.hasOwnProperty(key)) {
          var controlGroup = this.controlGroups[key];
          if(controlGroup) {
            controlGroup.setValue(prefs[key]);
          }
        }
      }
    },

    /**
     * Destroys the PreferencesModal.
     *
     * @memberof module:explorer/widgets/gadgetarea/PreferencesModal#
     */
    destroy : function() {
      this.showHandle.remove();
      this.hideHandle.remove();
      this.inherited(arguments);
    }
  });
});