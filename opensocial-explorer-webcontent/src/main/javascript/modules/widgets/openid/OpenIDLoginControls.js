/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/query', 'dojo/text!./../../templates/OpenIDLogin.html',
        'dojo/dom', 'dojo/dom-class', 'dojo/_base/lang', 'dojo/on',
        'dojo/request/xhr', 'dojo/NodeList-manipulate', 'dojo/NodeList-dom'],
        function(declare, WidgetBase, TemplatedMixin,
                query, template, dom, domClass, lang, on, xhr) {
            return declare('ModalDialogWidget', [ WidgetBase, TemplatedMixin ], {
                templateString : template,
                
                initialize : false,
                
                postCreate : function() {
//                  this.init('openid_identifier');
                },
                
                show : function() {
                  if (!this.initialized) {
                    this.init('openid_identifier');
                    this.initialized = true;
                  }
                },
                
                // From here onwards came from openid-jquery.js and has bee modified to work for Dojo
                version : '1.3', // version constant
                demo : false,
                demo_text : null,
                cookie_expires : 6 * 30, // 6 months.
                cookie_name : 'openid_provider',
                cookie_path : '/',

                img_path : 'libs/openid-selector/images/',
                locale : 'en', // is set in openid-<locale>.js
                sprite : 'en', // usually equals to locale, is set in
                // openid-<locale>.js
                signin_text : 'Sign-In', // text on submit button on the form
                all_small : false, // output large providers w/ small icons
                no_sprite : false, // don't use sprite image
                image_title : 'log in with {provider}', // for image title

                input_id : null,
                provider_url : null,
                provider_id : null,

                /**
                 * Class constructor
                 * 
                 * @return {Void}
                 */
                init : function(input_id) {
                  providers = lang.mixin({}, providers_large, providers_small);
                  var openid_btns = query('#openid_btns', this.domNode);
                  this.input_id = input_id;
                  query('#openid_choice', this.domNode).style('display', 'block')
                  //query('#openid_input_area', this.domNode).empty();
                  var i = 0;
                  // add box for each provider
                  for (id in providers_large) {
                    box = this.getBoxHTML(id, providers_large[id], (this.all_small ? 'small' : 'large'), i++);
                    openid_btns.append(box);
                    on(query('.' + id, this.domNode), 
                       'click', 
                        dojo.hitch(this, 'signin', id, false)
                    );
                  }
                  if (providers_small) {
                    openid_btns.append('<br/>');
                    for (id in providers_small) {
                      box = this.getBoxHTML(id, providers_small[id], 'small', i++);
                      openid_btns.append(box);
                    }
                  }
                  var box_id = this.readCookie();
                  if (box_id) {
                    this.signin(box_id, true);
                  }
                },

                /**
                 * @return {String}
                 */
                getBoxHTML : function(box_id, provider, box_size, index) {
                  if (this.no_sprite) {
                    var image_ext = box_size == 'small' ? '.ico.gif' : '.gif';
                    return '<a title="' + this.image_title.replace('{provider}', provider["name"]) + '" href="#"'
                        + ' style="background: #FFF url(' + this.img_path + '../images.' + box_size + '/' + box_id + image_ext + ') no-repeat center center" '
                        + 'class="' + box_id + ' openid_' + box_size + '_btn"></a>';
                  }
                  var x = box_size == 'small' ? -index * 24 : -index * 100;
                  var y = box_size == 'small' ? -60 : 0;
                  return '<a title="' + this.image_title.replace('{provider}', provider["name"]) + '" href="#"'
                      + ' style="background: #FFF url(' + this.img_path + 'openid-providers-' + this.sprite + '.png); background-position: ' + x + 'px ' + y + 'px" '
                      + 'class="' + box_id + ' openid_' + box_size + '_btn"></a>';
                },

                /**
                 * Provider image click
                 * 
                 * @return {Void}
                 */
                signin : function(box_id, onload) {
                  var provider = providers[box_id];
                  if (!provider) {
                    return;
                  }
                  this.highlight(box_id);
                  this.setCookie(box_id);
                  this.provider_id = box_id;
                  this.provider_url = provider['url'];
                  // prompt user for input?
                  if (provider['label']) {
                    this.useInputBox(provider);
                  } else {
                    //query('#openid_input_area', this.domNode).empty();
                    if (!onload) {
                      this.submit();
                    }
                  }
                },

                /**
                 * Sign-in button click
                 * 
                 * @return {Boolean}
                 */
                submit : function() {
                  var url = this.provider_url;
                  if (url) {
                    url = url.replace('{username}', query('#openid_username').val());
                    this.setOpenIdUrl(url);
                  }
                  if (this.demo) {
                    alert(this.demo_text + "\r\n" + document.getElementById(this.input_id).value);
                    return false;
                  }
                  if (url.indexOf("javascript:") == 0) {
                    url = url.substr("javascript:".length);
                    eval(url);
                    return false;
                  }
                  // FIXME: Do the open id popup stuff here
                  return true;
                },

                /**
                 * @return {Void}
                 */
                setOpenIdUrl : function(url) {
                  var hidden = document.getElementById(this.input_id);
                  if (hidden != null) {
                    hidden.value = url;
                  } else {
                    query('#openid_form', this.domNode).append('<input type="hidden" id="' + this.input_id + '" name="' + this.input_id + '" value="' + url + '"/>');
                  }
                },

                /**
                 * @return {Void}
                 */
                highlight : function(box_id) {
                  // remove previous highlight.
                  var highlight = query('#openid_highlight', this.domNode);
                  if (highlight.length > 0) {
                    highlight.replaceWith(query('#openid_highlight a')[0]);
                  }
                  // add new highlight.
                  query('.' + box_id).wrap('<div id="openid_highlight"></div>');
                },

                setCookie : function(value) {
                  var date = new Date();
                  date.setTime(date.getTime() + (this.cookie_expires * 24 * 60 * 60 * 1000));
                  var expires = "; expires=" + date.toGMTString();
                  document.cookie = this.cookie_name + "=" + value + expires + "; path=" + this.cookie_path;
                },

                readCookie : function() {
                  var nameEQ = this.cookie_name + "=";
                  var ca = document.cookie.split(';');
                  for ( var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ')
                      c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) == 0)
                      return c.substring(nameEQ.length, c.length);
                  }
                  return null;
                },

                /**
                 * @return {Void}
                 */
                useInputBox : function(provider) {
                  var input_area = query('#openid_input_area');
                  var html = '';
                  var id = 'openid_username';
                  var value = '';
                  var label = provider['label'];
                  var style = '';
                  if (label) {
                    html = '<p>' + label + '</p>';
                  }
                  if (provider['name'] == 'OpenID') {
                    id = this.input_id;
                    value = 'http://';
                    style = 'background: #FFF url(' + this.img_path + 'openid-inputicon.gif) no-repeat scroll 0 50%; padding-left:18px;';
                  }
                  html += '<input id="' + id + '" type="text" style="' + style + '" name="' + id + '" value="' + value + '" />'
                      + '<input id="openid_submit" type="submit" value="' + this.signin_text + '"/>';
                  input_area.empty();
                  input_area.append(html);
                  query(id).focus();
                },

                setDemoMode : function(demoMode) {
                  this.demo = demoMode;
                }
            });
});