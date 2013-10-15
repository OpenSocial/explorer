package org.opensocial.explorer.server.login;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.message.BasicNameValuePair;
import org.apache.shindig.auth.SecurityTokenException;
import org.apache.shindig.common.uri.UriBuilder;
import org.apache.shindig.gadgets.GadgetException;
import org.apache.shindig.gadgets.http.HttpRequest;
import org.apache.shindig.gadgets.http.HttpResponse;
import org.apache.wink.json4j.JSONException;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.Preconditions;
import com.google.inject.Inject;
import com.google.inject.name.Named;

import org.apache.wink.json4j.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * A servlet that handles requests for logging in via Google OAuth, 
 * including handling login callbacks from the Google Authorization server.
 * 
 * <pre>
 * GET /googleLogin/popup
 * - This endpoint is reached from the client-side popup when the user clicks login. 
 * - This servlet sends back a redirect to Google's login and authorization page.
 * 
 * GET /googleLogin/token
 * - The callback URL from Google after the user has accepted or declined authorization.
 * 
 * - If the user has declined, Google returns an error parameter in the callback URL.
 * 1. In this case, we return some javascript code that closes the popup.
 * 
 * - If the user has accepted, Google returns a one-time auth code parameter in the callback URL.
 * 1. In this case, we make a POST back to Google with the auth code, and injected app information.
 * 2. Google will then return a JSON with an encrypted ID Token in exchange for the one time auth code.
 * 3. We unencrypt and verify this token using a Google's Java API to make sure the token is authentic.
 * 4. Once authenticated, we take the user ID from the token and generate a security token with it.
 * 5. Lastly, we return the security token client-side via some javascript, where it is also stored locally.
 * </pre>
 */
public class GoogleLoginServlet extends LoginServlet {
  private static final long serialVersionUID = -7170540545895008899L;
  private static final String GRANT_TYPE = "authorization_code";
  
  @Inject
  public void injectDependencies(@Named("explorer.googlelogin.clientid") String clientId,
                                 @Named("explorer.googlelogin.clientsecret") String clientSecret,
                                 @Named("explorer.googlelogin.redirecturi") String redirectUri,
                                 @Named("explorer.googlelogin.popupdestination") String popupDestination) {
    
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.popupDestination = popupDestination;
  }
  
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    try {
      String[] paths = getPaths(req);
       
      if (paths.length == 0) {
        resp.sendError(HttpServletResponse.SC_NOT_FOUND,
            "Path must be one of \"googleLogin/popup\" or \"googleLogin/token\"");
        return;
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
          Preconditions.checkNotNull(clientId);
          Preconditions.checkNotNull(clientSecret);
          Preconditions.checkNotNull(redirectUri);
          Preconditions.checkNotNull(popupDestination);
          
          HttpRequest googleRequest = this.constructGooglePostRequest(req);
          HttpResponse googleResponse = fetcher.fetch(googleRequest);
          JSONObject responseJSON = this.parseResponseToJson(googleResponse);
          if(responseJSON.has("error")) {
            throw new IllegalStateException();
          }
          
          String idToken = responseJSON.getString("id_token");
          GoogleIdToken userIdToken = GoogleIdToken.parse(new JacksonFactory(), idToken);
          GoogleIdToken.Payload googlePayload = userIdToken.getPayload();
          String userId = googlePayload.getSubject();
          
          if(googlePayload.getIssuer().equals("accounts.google.com") 
          && googlePayload.getAudience().equals(this.clientId)) {
            this.returnSecurityToken(userId, resp);
          } else {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Invalid response token");
          }
        }
      }
    } catch(GadgetException e) {
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error making POST request.");
    } catch(JSONException e) {
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing JSON response.");
    } catch(SecurityTokenException e) {
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error generating security token.");
    } catch(NullPointerException e) {
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Missing app client metadata.");
    } catch(IllegalStateException e) {
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error making token request.");
    }
  }
  
  private HttpRequest constructGooglePostRequest(HttpServletRequest req) throws UnsupportedEncodingException, IOException {
    String authCode = req.getParameter("code");
    
    HttpRequest googleRequest = new HttpRequest(new UriBuilder()
      .setScheme("https")
      .setAuthority("accounts.google.com")
      .setPath("/o/oauth2/token")
      .toUri());
    
    List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>();
    nameValuePairs.add(new BasicNameValuePair("code", authCode));
    nameValuePairs.add(new BasicNameValuePair("client_id", this.clientId));
    nameValuePairs.add(new BasicNameValuePair("client_secret", this.clientSecret));
    nameValuePairs.add(new BasicNameValuePair("redirect_uri", this.redirectUri));
    nameValuePairs.add(new BasicNameValuePair("grant_type", GRANT_TYPE));
    
    googleRequest.setMethod("POST");
    googleRequest.addHeader("Content-Type", "application/x-www-form-urlencoded");
    googleRequest.setPostBody(new UrlEncodedFormEntity(nameValuePairs).getContent());
    
    return googleRequest;
  }
}
