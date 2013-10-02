package org.opensocial.explorer.server.login;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.shindig.auth.SecurityTokenCodec;
import org.apache.shindig.config.ContainerConfig;
import org.apache.wink.json4j.JSONException;
import com.google.api.client.auth.openidconnect.IdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.Preconditions;
import com.google.inject.Inject;
import com.google.inject.name.Named;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class GoogleLoginServlet extends LoginServlet {
  private static final long serialVersionUID = -7170540545895008899L;
  private static final String CLASS = GoogleLoginServlet.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  private static final String GRANT_TYPE = "authorization_code";
  
  private String clientId;
  private String clientSecret;
  private String redirectUri;
  private String popupDestination;
  
  @Inject
  public void injectDependencies(SecurityTokenCodec codec,
                                 ContainerConfig config,
                                 @Named("explorer.googlelogin.clientid") String clientId,
                                 @Named("explorer.googlelogin.clientsecret") String clientSecret,
                                 @Named("explorer.googlelogin.redirecturi") String redirectUri,
                                 @Named("explorer.googlelogin.popupdestination") String popupDestination) {

    Preconditions.checkNotNull(clientId);
    Preconditions.checkNotNull(clientSecret);
    Preconditions.checkNotNull(redirectUri);
    Preconditions.checkNotNull(popupDestination);
    
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.popupDestination = popupDestination;
  }
  
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    String[] paths = getPaths(req);
    
    if (paths.length == 0) {
      resp.sendError(HttpServletResponse.SC_NOT_FOUND,
              "Path must be one of \"googleLogin/popup\" or \"googleLogin/token\"");
    }
    
    // Redirect to Google Login for authentication.
    if("popup".equals(paths[0])) {
      resp.sendRedirect(this.popupDestination);
    }
    
    // Callback from Google Servers after user has accepted or declined access.
    if("token".equals(paths[0])) {
      // If user clicked 'Decline', close the popup.
      if (req.getParameter("error") != null) {
        this.closePopup(resp);
     // Else, we verify the response from Google, obtain the user's ID, and generate a security token to OSE.
      } else {
        String authCode = req.getParameter("code");
        GoogleIdToken idToken = this.requestToken(authCode); // POST to exchange one-time auth code for idToken.
        String userId = idToken.getPayload().getSubject();
        
        if(this.verifyToken(idToken)) {
          this.returnSecurityToken(userId, resp);
        } else {
          resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Invalid response token");
        }
      }
    }
  }
  
  private GoogleIdToken requestToken(String authCode) throws IOException {
    final String method = "requestToken";
    GoogleIdToken userIdToken = null;
    try {
      HttpClient client = HttpClientBuilder.create().build();
      HttpPost httppost = this.constructPostRequestBody(authCode);
      HttpResponse response = client.execute(httppost);
      
      String idToken = this.parseResponseToJson(response).getString("id_token");
      userIdToken = GoogleIdToken.parse(new JacksonFactory(), idToken);
    } catch (JSONException e) {
      LOG.logp(Level.SEVERE, CLASS, method, e.getMessage(), e);
    }
    return userIdToken;
  }
  
  private HttpPost constructPostRequestBody(String authCode) throws UnsupportedEncodingException {
    List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>();
    nameValuePairs.add(new BasicNameValuePair("code", authCode));
    nameValuePairs.add(new BasicNameValuePair("client_id", this.clientId));
    nameValuePairs.add(new BasicNameValuePair("client_secret", this.clientSecret));
    nameValuePairs.add(new BasicNameValuePair("redirect_uri", this.redirectUri));
    nameValuePairs.add(new BasicNameValuePair("grant_type", GRANT_TYPE));
    
    HttpPost httppost = new HttpPost("https://accounts.google.com/o/oauth2/token");
    httppost.setEntity(new UrlEncodedFormEntity(nameValuePairs));
    
    return httppost;
  }
  
  private boolean verifyToken(GoogleIdToken userIdToken) {
    IdTokenVerifier verifier = new IdTokenVerifier.Builder()
    .setIssuer("accounts.google.com")
    .setAudience(Arrays.asList(this.clientId))
    .build();
    
    return verifier.verify(userIdToken);
  }
}
