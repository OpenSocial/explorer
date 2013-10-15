package org.opensocial.explorer.server.login;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shindig.auth.SecurityTokenException;
import org.apache.shindig.common.uri.UriBuilder;
import org.apache.shindig.gadgets.GadgetException;
import org.apache.shindig.gadgets.http.HttpRequest;
import org.apache.shindig.gadgets.http.HttpResponse;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;

import com.google.api.client.util.Preconditions;
import com.google.inject.Inject;
import com.google.inject.name.Named;

/**
 * A servlet that handles requests for logging in via Facebook OAuth, 
 * including handling login callbacks from the Facebook Authorization server.
 * 
 * <pre>
 * GET /facebookLogin/popup
 * - This endpoint is reached from the client-side popup when the user clicks login. 
 * - This servlet sends back a redirect to Facebook's login and authorization page.
 * 
 * GET /googleLogin/token
 * - The callback URL from Facebook after the user has accepted or declined authorization.
 * 
 * - If the user has declined, Facebook returns an error parameter in the callback URL.
 * 1. In this case, we return some javascript code that closes the popup.
 * 
 * - If the user has accepted, Facebook returns a one-time auth code parameter in the callback URL.
 * 1. In this case, we make a GET back to Facebook with the auth code, and injected app information.
 * 2. Facebook returns an access token string in a query response.
 * 3. We then need to verify this access token, which also requires making another GET to Facebook for an app token.
 * 4. Facebook returns this app token in a query string response.
 * 5. Once we have both tokens, we make a GET to Facebook to verify the access token.
 * 6. This returns a JSON that has keys is_valid and user_id.
 * 7. If is_valid is true, we know that the token is authentic and are able to take the user_id and generate a security token.
 * 8. Lastly, we return the security token client-side via some javascript, where it is also stored locally.
 * </pre>
 */
public class FacebookLoginServlet extends LoginServlet {
  private static final long serialVersionUID = -802771005653805080L;
  private static final String GRANT_TYPE = "client_credentials";
  
  @Inject
  public void injectDependencies(@Named("explorer.facebooklogin.clientid") String clientId,
                                 @Named("explorer.facebooklogin.clientsecret") String clientSecret,
                                 @Named("explorer.facebooklogin.redirecturi") String redirectUri,
                                 @Named("explorer.facebooklogin.popupdestination") String popupDestination) {

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
            "Path must be one of \"facebookLogin/popup\" or \"facebookLogin/token\"");
        return;
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
          Preconditions.checkNotNull(clientId);
          Preconditions.checkNotNull(clientSecret);
          Preconditions.checkNotNull(redirectUri);
          Preconditions.checkNotNull(popupDestination);
          
          String authCode = req.getParameter("code");
          String accessToken = this.requestToken(authCode);
          String appToken = this.requestAppToken();
          JSONObject verification = this.inspectToken(accessToken, appToken);

          if(verification.has("data")) {
            JSONObject data = verification.getJSONObject("data");
            if(data.getBoolean("is_valid")) {
              String userId = data.getString("user_id");
              Preconditions.checkNotNull(userId);
              this.returnSecurityToken(userId, resp);
            } else {
              resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Invalid response token");
            }
          } else {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Bad response data");
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
    } catch(UnsupportedEncodingException e) {
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error generating encoded url.");
    } catch(IllegalStateException e) {
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error making token request.");
    }
  }
  
  private String requestToken(String authCode) throws IOException, GadgetException {
    HttpRequest facebookTokenRequest = new HttpRequest(new UriBuilder()
      .setScheme("https")
      .setAuthority("graph.facebook.com")
      .setPath("/oauth/access_token")
      .addQueryParameter("client_id", this.clientId)
      .addQueryParameter("redirect_uri", this.redirectUri)
      .addQueryParameter("client_secret", this.clientSecret)
      .addQueryParameter("code", authCode)
      .toUri());
    
    HttpResponse response = fetcher.fetch(facebookTokenRequest);
    Map<String, String> queryPairs = this.splitQuery(response);
    
    if(queryPairs.containsKey("error")) {
      throw new IllegalStateException();
    } else {
      return queryPairs.get("access_token");
    }
  }
  
  private String requestAppToken() throws IOException, GadgetException {
    HttpRequest facebookAppRequest = new HttpRequest(new UriBuilder()
    .setScheme("https")
    .setAuthority("graph.facebook.com")
    .setPath("/oauth/access_token")
    .addQueryParameter("client_id", this.clientId)
    .addQueryParameter("client_secret", this.clientSecret)
    .addQueryParameter("grant_type", GRANT_TYPE)
    .toUri());
    
    HttpResponse facebookResponse = fetcher.fetch(facebookAppRequest);
    
    Map<String, String> queryPairs = this.splitQuery(facebookResponse);
    if(queryPairs.containsKey("error")) {
      throw new IllegalStateException();
    } else {
      return queryPairs.get("access_token");
    }
  }

  private JSONObject inspectToken(String inputToken, String accessToken) throws IOException, GadgetException, JSONException {  
    HttpRequest facebookInspectRequest = new HttpRequest(new UriBuilder()
    .setScheme("https")
    .setAuthority("graph.facebook.com")
    .setPath("/debug_token")
    .addQueryParameter("input_token", inputToken)
    .addQueryParameter("access_token", accessToken)
    .toUri());
    
    HttpResponse response = fetcher.fetch(facebookInspectRequest);
    JSONObject responseJson = this.parseResponseToJson(response);
    return responseJson;
  }
}