/*
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
 */
package org.opensocial.explorer.server.openid;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shindig.auth.SecurityTokenCodec;
import org.apache.shindig.config.ContainerConfig;
import org.apache.wink.json4j.JSONException;
import org.apache.wink.json4j.JSONObject;
import org.openid4java.discovery.Identifier;
import org.opensocial.explorer.specserver.servlet.ExplorerInjectedServlet;

import com.google.inject.Inject;
import com.google.inject.Singleton;

/**
 * A servlet that handles requests for OpenID including receiving the OpenID discovery URL from the
 * client and handling login callbacks from the OpenID provider.
 * 
 * <pre>
 * GET /openid/authrequest?openid_identifier=<OpenID discovery url>
 * - Initiate an OpenID auth request using the given OpenID discovery url
 * - Upon success this will return a redirect to the client
 * - Upon failure it will return a 500 status code with the error
 * 
 * GET /openid/openidcallback
 * - The callback URL for an OpenID provider.  
 * - Clients should not hit this URL directly; rather, they will be redirected to it after a successful call to /openid/authrequest.
 * 
 * GET /openid/providers
 * - Returns a list of OpenID providers supported by the server from which users can choose in order to login with OpenID
 * </pre>
 */
@Singleton
public class OpenIDServlet extends ExplorerInjectedServlet {

  private static final long serialVersionUID = 7461268606887180514L;
  private static final String CLASS = OpenIDServlet.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  private static final String CONTAINER = "ose"; // FIXME: Don't hardcode this.
  private OpenIDConsumer consumer;
  private SecurityTokenCodec codec;
  private OpenIDProviderStore providerStore;
  @Inject
  public void injectDependencies(OpenIDConsumer consumer, SecurityTokenCodec codec,
          OpenIDProviderStore providerStore, ContainerConfig config) {
    checkInitialized();
    this.codec = codec;
    this.consumer = consumer;
    this.providerStore = providerStore;
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
          IOException {
    String[] paths = getPaths(req);
    if (paths.length == 0) {
      resp.sendError(HttpServletResponse.SC_NOT_FOUND,
              "Path must be one of \"openidcallback\", \"authrequest\", or \"providers\"");
    }

    if ("openidcallback".equals(paths[0])) {
      // Service the callback      
      Identifier identifier = this.consumer.verifyResponse(req);
      returnIdentifier(identifier, resp);
      return;
    }

    if ("authrequest".equals(paths[0])) {
      // Service the authrequest from the client.  This will send a redirect upon success.
      String discoveryUrl = req.getParameter("openid_identifier");
      this.consumer.authRequest(discoveryUrl, req, resp);
      return;
    }
    
    if ("providers".equals(paths[0])) {
      returnProviders(resp);
      return;
    }
  }
  
  private void returnProviders(HttpServletResponse resp) throws IOException {
    final String method = "returnProviders";
    PrintWriter writer = null;
    JSONObject providersObj = new JSONObject();
    Set<OpenIDProvider> providers = providerStore.getProviders();
    try {
      for(OpenIDProvider provider : providers) {
        providersObj.put(provider.getId(), provider.toJson());
      }
      resp.setContentType(JSON_CONTENT_TYPE);
      writer = resp.getWriter();
      writer.print(providersObj.toString());
    } catch (JSONException e) {
      LOG.logp(Level.WARNING, CLASS, method, e.getMessage(), e);
    } finally {
      if(writer != null) {
        writer.flush();
      }
    }
  }

  private void returnIdentifier(Identifier identifier, HttpServletResponse resp) throws IOException {
    final String method = "returnResource";
    PrintWriter writer = null;
    try {
      JSONObject obj = new JSONObject();
      // We shouldn't ever need to send this to the client. The security token is all it needs for now.
      // obj.put("openid", identifier.getIdentifier());
      obj.put("securityToken", this.codec.encodeToken(new OpenIDSecurityToken(identifier, CONTAINER)));
      obj.put("securityTokenTTL", this.codec.getTokenTimeToLive(CONTAINER));
      String content = obj.toString();
      resp.setContentType(HTML_CONTENT_TYPE);

      // FIXME: Write some code to automatically close the popup and provide a link for the user to close it.
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
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    } finally {
      if (writer != null) {
        writer.flush();
      }
    }
  }
}
