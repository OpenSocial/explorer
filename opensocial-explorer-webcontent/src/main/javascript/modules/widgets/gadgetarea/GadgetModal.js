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
 * A modal window that displays the results of the open-views gadget example.
 *
 * @module explorer/widgets/gadgetarea/GadgetModal
 * @augments module:explorer/widgets/ModalDialog
 */
define(['dojo/_base/declare',  '../ModalDialog', 'dojo/query', 'dojo/dom-class', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, ModalDialog, query, domClass) {
  return declare('GadgetModalWidget', [ ModalDialog ], {

    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/gadgetarea/GadgetModal#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate : function() {
      if(this.viewTarget === 'TAB') {
        domClass.add(this.domNode, 'tab');  
        domClass.add(this.domNode, 'gadgetModal');
      } else if( this.viewTarget === 'SIDEBAR') {
        domClass.add(this.domNode, 'sidebar');
        domClass.add(this.domNode, 'gadgetModal');
      }
    },

    /**
     * Called right after widget is added to the dom. See link for more information.
     *
     * @memberof module:explorer/widgets/gadgetarea/GadgetModal#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    startup : function() {
      this.setHeaderTitle(this.title);
      this.inherited(arguments);
    },

    /**
     * Gets the domNode of the gadget that is rendered in the iframe of the GadgetModal.
     *
     * @memberof module:explorer/widgets/gadgetarea/GadgetModal#
     * @return {Object} The domNode of the gadget.
     */
    getGadgetNode : function() {
      return query('.modal-body', this.domNode)[0];
    },

    /**
     * Removes the modal when the user exits out of it.
     *
     * @memberof module:explorer/widgets/gadgetarea/GadgetModal#
     * @param {Object} opt_site
     */
    hide : function(opt_site) {
      var site = opt_site;
      if(!site) {
        site = this.container.getGadgetSiteByIframeId_(query('.modal-body > iframe')[0].getAttribute('id'));
      }
      this.container.closeGadget(site);
      this.inherited(arguments);
      this.destroy();
    }
  });
});