function lookupTeam() {
  var index = document.getElementById('team').selectedIndex;
  var options = document.getElementById('team').options;
  var teamID = options[index].value;
  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  var url = 'http://www.nicetimeonice.com/api/teams/' + teamID;
  gadgets.io.makeRequest(url, function(response) {
    if (response.errors.length == 0) {
      var data = response.data;
      document.getElementById('teamID').innerHTML = data.teamID;
      document.getElementById('name').innerHTML = data.name;
      document.getElementById('conference').innerHTML = data.conference;
      document.getElementById('division').innerHTML = data.division;
      gadgets.window.adjustHeight();
    } else {
      gadgets.error('There was an error making the request.');
    }
  }, params);
}