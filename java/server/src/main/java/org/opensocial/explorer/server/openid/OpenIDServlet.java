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
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.wink.json4j.JSONObject;
import org.openid4java.discovery.Identifier;
import org.opensocial.explorer.specserver.servlet.ExplorerInjectedServlet;

import com.google.inject.Inject;

/**
 * A servlet that handles requests for OpenID including receiving the OpenID discovery URL from the
 * client and handling login callbacks from the OpenID provider.
 * 
 * <pre>
 * GET /openid/authrequest?url=<OpenID discovery url>
 * - Initiate an OpenID auth request using the given OpenID discovery url
 * - Upon success this will return a redirect to the client
 * - Upon failure it will return a 500 status code with the error
 * 
 * GET /openid/openidcallback
 * - The callback URL for an OpenID provider.  
 * - Clients should not hit this URL directly; rather, they will be redirected to it after a successful call to /openid/authrequest.
 * </pre>
 */
public class OpenIDServlet extends ExplorerInjectedServlet {

  private static final long serialVersionUID = 7461268606887180514L;
  private static final String CLASS = OpenIDServlet.class.getName();
  private static final Logger LOG = Logger.getLogger(CLASS);
  private static transient OpenIDConsumer consumer;

  @Inject
  public void setOpenIDConsumer(OpenIDConsumer consumer) {
    checkInitialized();
    OpenIDServlet.consumer = consumer;
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
          IOException {

    String[] paths = getPaths(req);
    if (paths.length == 0) {
      resp.sendError(HttpServletResponse.SC_NOT_FOUND,
              "Path must be one of \"openidcallback\" or \"authrequest\"");
    }

    if ("openidcallback".equals(paths[0])) {
      // Service the callback
      Identifier identifier = this.consumer.verifyResponse(req);
      returnIdentifier(identifier, resp);
      return;
    }

    if ("authrequest".equals(paths[0])) {
      // Service the authrequest from the client.  This will send a redirect upon success.
      String discoveryUrl = req.getParameter("url");
      this.consumer.authRequest(discoveryUrl, req, resp);
      return;
    }
  }

  private void returnIdentifier(Identifier identifier, HttpServletResponse resp) throws IOException {
    final String method = "returnResource";
    PrintWriter writer = null;
    try {

      JSONObject obj = new JSONObject();
      obj.put("openid", identifier.getIdentifier());
      String content = obj.toString();
      resp.setContentLength(content.length());
      resp.setContentType(JSON_CONTENT_TYPE);

      writer = resp.getWriter();
      writer.print(content);
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
