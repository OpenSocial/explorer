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
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.shindig.common.Nullable;
import org.apache.shindig.common.servlet.Authority;
import org.openid4java.OpenIDException;
import org.openid4java.consumer.ConsumerException;
import org.openid4java.consumer.ConsumerManager;
import org.openid4java.consumer.VerificationResult;
import org.openid4java.discovery.DiscoveryInformation;
import org.openid4java.discovery.Identifier;
import org.openid4java.message.AuthRequest;
import org.openid4java.message.AuthSuccess;
import org.openid4java.message.ParameterList;
import org.openid4java.message.ax.AxMessage;
import org.openid4java.message.ax.FetchRequest;
import org.openid4java.message.ax.FetchResponse;
import org.openid4java.message.sreg.SRegMessage;
import org.openid4java.message.sreg.SRegRequest;
import org.openid4java.message.sreg.SRegResponse;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

/**
 * OpenID consumer implemenation based on the SampleConsumer provided by OpenID4Java.
 * http://code.google.com/p/openid4java/wiki/SampleConsumer
 * 
 */
@Singleton
public class OpenIDConsumer {

  private final String returnToUrl;
  private final ConsumerManager manager;

  @Inject
  public OpenIDConsumer(@Named("explorer.openid.callbackUrl") String openIDCallbackURL,
                        ConsumerManager manager, @Named("shindig.contextroot") String contextRoot,
                        Authority authority) throws ConsumerException {
    this.returnToUrl = openIDCallbackURL.replaceAll("%origin%", authority.getOrigin())
                                        .replaceAll("%contextRoot%", contextRoot);
    this.manager = manager;
  }

  // NOTE: The following methods have been adapted from
  // http://code.google.com/p/openid4java/wiki/SampleConsumer

  // --- placing the authentication request ---
  public boolean authRequest(String userSuppliedString, HttpServletRequest httpReq,
          HttpServletResponse httpResp) throws IOException {
    try {

      // --- Forward proxy setup (only if needed) ---
      // ProxyProperties proxyProps = new ProxyProperties();
      // proxyProps.setProxyName("proxy.example.com");
      // proxyProps.setProxyPort(8080);
      // HttpClientFactory.setProxyProperties(proxyProps);

      // perform discovery on the user-supplied identifier
      @SuppressWarnings("rawtypes")
      List discoveries = manager.discover(userSuppliedString);

      // attempt to associate with the OpenID provider
      // and retrieve one service endpoint for authentication
      DiscoveryInformation discovered = manager.associate(discoveries);

      // store the discovery information in the user's session
      httpReq.getSession().setAttribute("openid-disc", discovered);

      // obtain a AuthRequest message to be sent to the OpenID provider
      AuthRequest authReq = manager.authenticate(discovered, returnToUrl);

      // Attribute Exchange example: fetching the 'email' attribute
      FetchRequest fetch = FetchRequest.createFetchRequest();
      fetch.addAttribute("email", // attribute alias
              "http://schema.openid.net/contact/email", // type URI
              true); // required
      // attach the extension to the authentication request
      authReq.addExtension(fetch);

      // example using Simple Registration to fetching the 'email' attribute
      SRegRequest sregReq = SRegRequest.createFetchRequest();
      sregReq.addAttribute("email", true);
      authReq.addExtension(sregReq);

      // if (!discovered.isVersion2()) {
      // Option 1: GET HTTP-redirect to the OpenID Provider endpoint
      // The only method supported in OpenID 1.x
      // redirect-URL usually limited ~2048 bytes
      httpResp.sendRedirect(authReq.getDestinationUrl(true));
      return false;
      /*
       * } else { // Option 2: HTML FORM Redirection (Allows payloads >2048 bytes)
       * 
       * // RequestDispatcher dispatcher = //
       * getServletContext().getRequestDispatcher("formredirection.jsp"); //
       * httpReq.setAttribute("prameterMap", response.getParameterMap()); //
       * httpReq.setAttribute("destinationUrl", response.getDestinationUrl(false)); //
       * dispatcher.forward(request, response); return true; }
       */
    } catch (OpenIDException e) {
      // present error to the user
      throw new RuntimeException("wrap:" + e.getMessage(), e);
    }
  }

  // --- processing the authentication response ---
  public Identifier verifyResponse(HttpServletRequest httpReq) {
    try {
      // extract the parameters from the authentication response
      // (which comes in as a HTTP request from the OpenID provider)
      ParameterList response = new ParameterList(httpReq.getParameterMap());

      // retrieve the previously stored discovery information
      DiscoveryInformation discovered = (DiscoveryInformation) httpReq.getSession().getAttribute(
              "openid-disc");

      // extract the receiving URL from the HTTP request
      StringBuffer receivingURL = httpReq.getRequestURL();
      String queryString = httpReq.getQueryString();
      if (queryString != null && queryString.length() > 0)
        receivingURL.append("?").append(queryString);

      // verify the response; ConsumerManager needs to be the same
      // (static) instance used to place the authentication request
      VerificationResult verification = manager.verify(receivingURL.toString(), response,
              discovered);

      // examine the verification result and extract the verified identifier
      Identifier verified = verification.getVerifiedId();
      if (verified != null) {
        AuthSuccess authSuccess = (AuthSuccess) verification.getAuthResponse();

        HttpSession session = httpReq.getSession(true);
        session.setAttribute("openid_identifier", authSuccess.getIdentity());

        if (authSuccess.hasExtension(AxMessage.OPENID_NS_AX)) {
          FetchResponse fetchResp = (FetchResponse) authSuccess
                  .getExtension(AxMessage.OPENID_NS_AX);
          session.setAttribute("emailFromFetch", fetchResp.getAttributeValues("email").get(0));
        }
        if (authSuccess.hasExtension(SRegMessage.OPENID_NS_SREG)) {
          SRegResponse sregResp = (SRegResponse) authSuccess
                  .getExtension(SRegMessage.OPENID_NS_SREG);
          session.setAttribute("emailFromSReg", sregResp.getAttributeValue("email"));
        }
        return verified; // success
      }
    } catch (OpenIDException e) {
      // present error to the user
      throw new RuntimeException("wrap:" + e.getMessage(), e);
    }

    return null;
  }
}
