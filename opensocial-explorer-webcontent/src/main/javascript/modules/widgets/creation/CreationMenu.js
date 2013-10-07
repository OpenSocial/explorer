/**
 * A menu that has buttons for creating a new gadget or service.
 *
 * @module modules/widgets/creation/CreationMenu
 * @augments dijit/_WidgetBase
 * @augments dijit/_TemplatedMixin
 * @augments dijit/_WidgetsInTemplateMixin
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|WidgetBase Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_TemplatedMixin.html|TemplatedMixin Documentation}
 * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetsInTemplateMixin.html|WidgetsInTemplateMixin Documentation}
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 
        'modules/widgets/creation/CreationServiceModal', 'dojo/text!./../../templates/CreationMenu.html', 'dojo/on', 'dojo/topic'],
        function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, CreationServiceModal, template, on, topic) {
  return declare('CreationMenuWidget', [ WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
    templateString : template,
    
    /**
     * Called right before widget is added to the dom. See link for more information.
     *
     * @memberof module:modules/widgets/creation/CreationSpecModal#
     * @see {@link http://dojotoolkit.org/reference-guide/1.8/dijit/_WidgetBase.html|Dojo Documentation}
     */
    postCreate : function() {
      var self = this;
      on(this.addGadgetButton, 'click', function() {
        topic.publish("toggleCreationSpecModal");
      });
      
      on(this.addServiceButton, 'click', function() {
        self.serviceModal.show();
      });
    }
  });
});