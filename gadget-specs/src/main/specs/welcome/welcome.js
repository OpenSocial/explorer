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
function welcome() {
  var miniMessage = new gadgets.MiniMessage();
  miniMessage.createStaticMessage("Welcome to the OpenSocial Explorer!");
  miniMessage.createStaticMessage("Click on the tabs at the top to see all resources that a gadget is using, including HTML, CSS, and JavaScript.");
  miniMessage.createStaticMessage("Click on the samples in the navigator on the left to view other sample gadgets.");
}

gadgets.util.registerOnLoadHandler(welcome);