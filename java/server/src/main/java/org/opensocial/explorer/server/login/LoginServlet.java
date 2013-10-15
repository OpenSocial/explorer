package org.opensocial.explorer.server.login;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletResponse;

import org.apache.shindig.auth.SecurityTokenCodec;
import org.apache.shindig.auth.SecurityTokenException;
import org.apache.shindig.gadgets.http.HttpFetcher;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.server.openid.OpenIDSecurityToken;
import org.opensocial.explorer.specserver.servlet.ExplorerInjectedServlet;

import com.google.inject.Inject;

public abstract class LoginServlet extends ExplorerInjectedServlet {
  private static final long serialVersionUID = 8540523171562319098L;
  private static final String CLASS = LoginServlet.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  protected static final String CONTAINER = "ose";
  protected HttpFetcher fetcher;
  protected SecurityTokenCodec codec;
  protected String clientId;
  protected String clientSecret;
  protected String redirectUri;
  protected String popupDestination;
  
  public LoginServlet() {
    super();
  }
  
  @Inject
  public void injectDependencies(HttpFetcher fetcher, SecurityTokenCodec codec) {
    checkInitialized();
    this.fetcher = fetcher;
    this.codec = codec;
  }
  
  protected void closePopup(HttpServletResponse resp) throws IOException {
    resp.setContentType(HTML_CONTENT_TYPE);
    PrintWriter writer = resp.getWriter();
    writer.print(
        "<html>" +
          "<head>" +
            "<script type='text/javascript'>window.close();</script>" +
          "</head>" +
          "<body></body>" +
        "</html>");
  }
  
  protected void returnSecurityToken(String id, HttpServletResponse resp) throws IOException, JSONException, SecurityTokenException {
      resp.setContentType(HTML_CONTENT_TYPE);
      JSONObject obj = new JSONObject();
      obj.put("securityToken", this.codec.encodeToken(new OpenIDSecurityToken(id, CONTAINER)));
      obj.put("securityTokenTTL", this.codec.getTokenTimeToLive(CONTAINER));
      String content = obj.toString();
      PrintWriter writer = resp.getWriter();
      writer.print(
          "<html>" +
            "<head>" +
              "<script type='text/javascript'>" +
                "var evt = document.createEvent('Event');" +
                "evt.initEvent('returnSecurityToken', true, true);" +
                "document.responseObj = " + content + ";" +
                "window.opener.document.dispatchEvent(evt);" +
              "</script>" +
            "</head>" +
            "<body></body>" +
          "</html>");
  }
}
