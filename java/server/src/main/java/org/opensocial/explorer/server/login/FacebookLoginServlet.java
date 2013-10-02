package org.opensocial.explorer.server.login;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import com.google.api.client.util.Preconditions;
import com.google.inject.Inject;
import com.google.inject.name.Named;

public class FacebookLoginServlet extends LoginServlet {
  private static final long serialVersionUID = -802771005653805080L;
  private static final String CLASS = FacebookLoginServlet.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  private static final String GRANT_TYPE = "client_credentials";
  
  private String clientId;
  private String clientSecret;
  private String redirectUri;
  private String popupDestination;
  
  @Inject
  public void injectDependencies(@Named("explorer.facebooklogin.clientid") String clientId,
                                 @Named("explorer.facebooklogin.clientsecret") String clientSecret,
                                 @Named("explorer.facebooklogin.redirecturi") String redirectUri,
                                 @Named("explorer.facebooklogin.popupdestination") String popupDestination) {
    
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
              "Path must be one of \"facebookLogin/popup\" or \"facebookLogin/token\"");
    }
    
    // Redirect to Google Login for authentication.
    if("popup".equals(paths[0])) {
      resp.sendRedirect(this.popupDestination);
    }
    
    // Callback from Facebook Servers after user has accepted or declined access.
    if("token".equals(paths[0])) {
      // If user clicked 'Decline', close the popup.
      if (req.getParameter("error") != null) {
        this.closePopup(resp);
      // Else, we verify the response from Facebook, obtain the user's ID, and generate a security token to OSE.
      } else {
        String authCode = req.getParameter("code");
        String appToken = this.requestAppToken(resp);
        String accessToken = this.requestToken(authCode, resp);
        JSONObject verification = this.inspectToken(accessToken, appToken, resp);
        
        if(this.verifyToken(verification, resp)) {
          String userId = this.getVerificationData(verification, "user_id", resp);
          Preconditions.checkNotNull(userId);
          this.returnSecurityToken(userId, resp);
        } else {
          resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Invalid response token");
        } 
      }
    }
  }
  
  private String requestToken(String authCode, HttpServletResponse servletResponse) throws IOException {
    HttpClient client = HttpClientBuilder.create().build();
    HttpGet httpget = this.constructGetRequestEndpoint(authCode, servletResponse);
    HttpResponse response = client.execute(httpget);
    Map<String, String> queryPairs = this.splitQuery(response);

    if(queryPairs.containsKey("error")) {
      servletResponse.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error getting access token");
    }

    return queryPairs.get("access_token");
  }
  
  private String requestAppToken(HttpServletResponse servletResponse) throws IOException {
    final String method = "requestAppToken";
    HttpClient client = HttpClientBuilder.create().build();
    URI uri = null;
    try {
      uri = new URIBuilder()
                       .setScheme("https")
                       .setHost("graph.facebook.com")
                       .setPath("/oauth/access_token")
                       .setParameter("client_id", this.clientId)
                       .setParameter("client_secret", this.clientSecret)
                       .setParameter("grant_type", GRANT_TYPE)
                       .build();
    } catch (URISyntaxException e) {
      LOG.logp(Level.SEVERE, CLASS, method, e.getMessage(), e);
      servletResponse.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error constructing app token request");
    }
    
    HttpGet httpget = new HttpGet(uri);
    HttpResponse response = client.execute(httpget);
    
    Map<String, String> queryPairs = this.splitQuery(response);
    if(queryPairs.containsKey("error")) {
      servletResponse.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error getting app token");
    }
    return queryPairs.get("access_token");
  }

  private HttpGet constructGetRequestEndpoint(String authCode, HttpServletResponse servletResponse) throws IOException {
    final String method = "constructGetRequestEndpoint";
    URI uri = null;
    try {
      uri = new URIBuilder()
              .setScheme("https")
              .setHost("graph.facebook.com")
              .setPath("/oauth/access_token")
              .setParameter("client_id", this.clientId)
              .setParameter("redirect_uri", this.redirectUri)
              .setParameter("client_secret", this.clientSecret)
              .setParameter("code", authCode)
              .build();
    } catch (URISyntaxException e) {
      LOG.logp(Level.SEVERE, CLASS, method, e.getMessage(), e);
      servletResponse.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error constructing token request");
    }
    
    return new HttpGet(uri);
  }

  private JSONObject inspectToken(String inputToken, String accessToken, HttpServletResponse servletResponse) throws IOException {
    final String method = "inspectToken";
    HttpClient client = HttpClientBuilder.create().build();
    URI uri = null;
    JSONObject inspectedResponse = null;
    try {
      uri = new URIBuilder()
      .setScheme("https")
      .setHost("graph.facebook.com")
      .setPath("/debug_token")
      .setParameter("input_token", inputToken)
      .setParameter("access_token", accessToken)
      .build();
      
      HttpGet httpget = new HttpGet(uri);
      HttpResponse response = client.execute(httpget);
      inspectedResponse = this.parseResponseToJson(response);
    } catch (Exception e) {
      LOG.logp(Level.SEVERE, CLASS, method, e.getMessage(), e);
      servletResponse.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error verifying token");
    }

    return inspectedResponse;
  }
  
  private boolean verifyToken(JSONObject verification, HttpServletResponse servletResponse) throws IOException {
    return this.getVerificationData(verification, "is_valid", servletResponse).equals("true");
  }
  
  private String getVerificationData(JSONObject verification, String key, HttpServletResponse servletResponse) throws IOException {
    final String method = "getVerificationData";
    String value = null;
    try {
      JSONObject data = verification.getJSONObject("data");
      if(key.equals("is_valid")) {
        value = data.getString("is_valid");
      }
      
      if(key.equals("user_id")) {
        value = data.getString("user_id");
      }
    } catch (JSONException e) {
      LOG.logp(Level.SEVERE, CLASS, method, e.getMessage(), e);
      servletResponse.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing verification");
    }

    return value;
  }
}