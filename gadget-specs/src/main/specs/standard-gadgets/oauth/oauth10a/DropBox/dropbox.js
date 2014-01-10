gadgets.util.registerOnLoadHandler(function(){
  fetchAccountInfo();
});

function fetchAccountInfo() {
  var params = {};
  var url = 'https://api.dropbox.com/1/account/info';
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
  params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH;
  //REMEMBER The value here must match the service name in the gadget XML
  params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "DropBox";

  gadgets.io.makeRequest(url, function (response) {
    if(response.errors.length == 0){
      if(response.oauthApprovalUrl){
        var onOpen = function() {};
        var onClose = function() {
          showLoading();
          fetchAccountInfo();
        };
        var popup = new gadgets.oauth.Popup(response.oauthApprovalUrl,
        null, onOpen, onClose);
        var onclick = popup.createOpenerOnClick();
        displayAuthorizeMessage(onclick);
      } else if(response.data) {
        displayAccountInfo(response.data);
      }
    } else{
      showError(response);
    }       
  }, params);
};

function showLoading() {
  document.getElementById('authorize').style.display = 'none';
  document.getElementById('loading').style.display = 'block';
}

function displayAuthorizeMessage(onClick) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('accountInfo').style.display = 'none';
  document.getElementById('authorizeLink').onclick = onClick;
  document.getElementById('authorize').style.display = 'block';
  gadgets.window.adjustHeight();
};

function displayAccountInfo(accountData) {
  document.getElementById('authorize').style.display = 'none';
  document.getElementById('loading').style.display = 'none';
  document.getElementById('accountInfo').style.display = 'block';
  document.getElementById('name').innerHTML = accountData.display_name;
  document.getElementById('country').innerHTML = accountData.country;
  document.getElementById('email').innerHTML = accountData.email;
};

function showError(response) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'block';
  document.getElementById('errorText').innerHTML = gadgets.json.stringify(response);
};