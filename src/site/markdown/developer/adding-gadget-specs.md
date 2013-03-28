<!--
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
-->
Adding New Gadget Specs
====================

The whole point of the OpenSocial Explorer is to provide sample gadgets for developers to learn how to build OpenSocial gadgets, so adding new gadget specs will be a common operation.  All of the gadget specs live in the gadget-specs module and are packaged into a Jar file.  Each spec in this module has its own folder containing all the resources for that sample gadget.  In addition specs may be grouped into categories by creating sub-directories.

The simplest gadget spec will have at least two files, a gadget XML file and then a file called spec.json.  The XML file is the actual gadget XML.  The spec.json file is a file we use to identify all the resources for a given gadget spec.  The spec.json file must have a JSON object containing the following properties.

*   <b>title:</b> A string that is a title for the sample.  It will be used in the spec navigator in the OpenSocial Explorer.
*   <b>gadget:</b> A string that is the name of the gadget XML file.  This should include the file extension, which is always .xml.  For example &quot;myGadget.xml&quot;.
*   <b>htmlFiles:</b> An array of strings that point to HTML files references by the gadget.  This is an optional parameter.  For example [&quot;example1.html&quot;, &quot;example2.html&quot;].
*   <b>jsFiles:</b>  An array of strings that point to JavaScript files referenced by the gadget or any of the HTML files.  This is an optional parameter.  For example [&quot;example.js&quot;, &quot;example2.js&quot;].
*   <b>cssFiles:</b> An array of strings that point to CSS files referenced by the gadget or any of the HTML files.  This is an optional parameter.  For example [&quot;example1.css&quot;, &quot;example2.css&quot;].
*   <b>isDefault:</b> A boolean indicating whether the gadget is the default gadget to be shown when the OpenSocial Explorer is opened.  There should only be one spec that has the value set to true.

Here is a sample spec.json

    {
      "isDefault" : true,
      "gadget" : "gadget.xml",
      "htmlFiles" : ["welcome.html"],
      "cssFiles" : ["welcome.css"],
      "jsFiles" : ["welcome.js"],
      "title" : "Welcome"
    }

When a new spec is added you need to add a reference to it in [specs.txt file](https://github.com/OpenSocial/explorer/blob/master/gadget-specs/src/main/specs/specs.txt), so we know which specs should be loaded.