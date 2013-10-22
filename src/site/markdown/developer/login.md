<!--
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
-->
Logging in
====================
The intention of the Login feature is for users to be able to save their OpenSocial Explorer
session while they are logged in, including any new specs or services that they have created.
Presently, there are three ways of logging in - Google OpenID, Google OAuth, and Facebook OAuth.
Google OAuth and Facebook OAuth require app client registration in order for the OSE to be able 
to use the particular platform's APIs ask users for their information.

Regardless of login method, a security token is generated from the user information obtained 
from user authorization or authentication. This token is the unique identifier of the user.
As a developer, you must configure the app client information for these login methods in explorer.properties
in order to use the login features. Currently, the login portion of the [explorer.properties](https://github.com/OpenSocial/explorer/blob/master/java/server/config/opensocial-explorer.properties)
file looks like this:

	#GoogleLogin details
	explorer.googlelogin.clientid=<insert client id here>
	explorer.googlelogin.clientsecret=<insert client secret here>
	explorer.googlelogin.redirecturi=<insert redirect uri here>
	explorer.googlelogin.popupdestination=<insert popup destination here>
	
	#FacebookLogin details
	explorer.facebooklogin.clientid=<insert client id here>
	explorer.facebooklogin.clientsecret=<insert client secret here>
	explorer.facebooklogin.redirecturi=<insert redirect uri here>
	explorer.facebooklogin.popupdestination=<insert popup destination here>

###Facebook OAuth Login
---------------------
You can register for a Facebook app at [Facebook Developers](https://developers.facebook.com/apps).
Once registered, set the Site URL in the App Dashboard to your development environment's URL, usually http://localhost:8080.

Now you can fill in the Facebook section of [explorer.properties](https://github.com/OpenSocial/explorer/blob/master/java/server/config/opensocial-explorer.properties):
enter the App Id and App Secret from the dashboard into clientid and clientsecret.
By default, the redirecturi is the endpoint served by the Facebook Login servlet: /facebookLogin/token.
If you need to change the endpoint, modify the [Facebook login servlet](https://github.com/OpenSocial/explorer/blob/master/java/server/src/main/java/org/opensocial/explorer/server/login/FacebookLoginServlet.java)
file accordingly as well as the [web.xml](https://github.com/OpenSocial/explorer/blob/master/java/server/src/main/webapp/WEB-INF/web.xml).

The popup destination is the url of the popup window where the user enters their Facebook credentials, which is
https://www.facebook.com/dialog/oauth. However, you also need to provide some additional query parameters:

	redirect_uri=<insert redirect uri here>
	client_id=<insert redirect uri here>
	response_type=code
	
The url must be encoded or Facebook will not recognize it.

###Google OAuth Login

You can register for Google API access at [Google API Console](https://code.google.com/apis/console).
Click on Create Client ID, select web application, and use http://localhost:8080 for the hostname.

You can now fill out the Google section of [explorer.properties](https://github.com/OpenSocial/explorer/blob/master/java/server/config/opensocial-explorer.properties):
enter the given Client ID and Client secret.
By default, the redirecturi is the endpoint served by the Google Login servlet: /googleLogin/token.
Again, be sure to modify both the [Google login servlet](https://github.com/OpenSocial/explorer/blob/master/java/server/src/main/java/org/opensocial/explorer/server/login/GoogleLoginServlet.java) 
and [web.xml](https://github.com/OpenSocial/explorer/blob/master/java/server/src/main/webapp/WEB-INF/web.xml) if you need to change this.

Google's popup destination goes to https://accounts.google.com/o/oauth2/auth with the additional query parameters:

	scope=https://www.googleapis.com/auth/userinfo.profile
	redirect_uri=<insert redirect uri here>
	client_id=<insert redirect uri here>
	response_type=code
	approval_prompt=force

Don't forget to encode the url!

