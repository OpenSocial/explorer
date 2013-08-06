function welcome() {
  var miniMessage = new gadgets.MiniMessage();
  miniMessage.createStaticMessage("Welcome to the OpenSocial Explorer!");
  miniMessage.createStaticMessage("Click on the tabs at the top to see all resources that a gadget is using, including HTML, CSS, and JavaScript.");
  miniMessage.createStaticMessage("Click on the samples in the navigator on the left to view other sample gadgets.");
}

gadgets.util.registerOnLoadHandler(welcome);