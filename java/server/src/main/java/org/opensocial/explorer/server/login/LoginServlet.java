package org.opensocial.explorer.server.login;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletResponse;

import org.apache.shindig.auth.SecurityTokenCodec;
import org.apache.wink.json4j.JSONObject;
import org.opensocial.explorer.server.openid.OpenIDSecurityToken;
import org.opensocial.explorer.specserver.servlet.ExplorerInjectedServlet;

import com.google.inject.Inject;

public abstract class LoginServlet extends ExplorerInjectedServlet {
  private static final long serialVersionUID = 8540523171562319098L;
  private static final String CLASS = LoginServlet.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  protected static final String CONTAINER = "ose";
  protected SecurityTokenCodec codec;
  
  public LoginServlet() {
    super();
  }
  
  @Inject
  public void injectDependencies(SecurityTokenCodec codec) {
    checkInitialized();
    
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
  
  protected void returnSecurityToken(String id, HttpServletResponse resp) throws IOException {
    final String method = "returnSecurityToken";
    PrintWriter writer = null;
    try {
      resp.setContentType(HTML_CONTENT_TYPE);
      JSONObject obj = new JSONObject();
      obj.put("securityToken", this.codec.encodeToken(new OpenIDSecurityToken(id, CONTAINER)));
      obj.put("securityTokenTTL", this.codec.getTokenTimeToLive(CONTAINER));
      String content = obj.toString();
      
      writer = resp.getWriter();
      writer.print(
          "<html>" +
            "<head>" +
              "<script type='text/javascript'>" +
                "var evt = document.createEvent('Event');" +
                "evt.initEvent('myEvent', true, true);" +
                "document.responseObj = " + content + ";" +
                "window.opener.document.dispatchEvent(evt);" +
              "</script>" +
            "</head>" +
            "<body></body>" +
          "</html>");
    } catch (Exception e) {
      LOG.logp(Level.WARNING, CLASS, method, e.getMessage(), e);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error generating security token");
    } finally {
      if (writer != null) {
        writer.flush();
      }
    }
  }
}
