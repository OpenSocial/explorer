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
Writing Unit Tests
====================

One thing we will require of all contributions to the OpenSocial Explorer is that there are accompanying unit tests for code changes.  For the Java code we use [JUnit 4](http://junit.org/) and for JavaScript we use [Jasmine](http://pivotal.github.com/jasmine/).

Java Unit Tests
---------------------

There is nothing special about the way we use JUnit in the OpenSocial Explorer.  We follow standard Maven conventions by placing our unit tests in each module's tests folder.  In addition to JUnit we use a library called [EasyMock](http://www.easymock.org/) and an extension to EasyMock called [PowerMock](https://code.google.com/p/powermock/).  Both of these libraries allow developers to mock up certain pieces of functionality when unit testing.  This allows for more complete unit tests since you are able to easy exerciese pieces of your code which might be hard to do otherwise.

JavaScript Unit Tests
---------------------

Unit testing JavaScript code is a relatively new, but necessary technique.  Unforunately Maven was originally intended only for Java projects so native support for JavaScript and unit testing your JavaScript is not provided out of the box.  Luckily there are people who have written plugins to help out ;)  In the OpenSocial Explorer we use Jasmine to unit test our JavaScript.  More specifically we use the [Jasmine Maven Plugin](http://searls.github.com/jasmine-maven-plugin/) to do the integration of Jasmine into our Maven builds.

This plugin is configured in the POM of the opensocial-explorer-webcontent module.  We provide our own testing [template](https://github.com/OpenSocial/explorer/blob/master/opensocial-explorer-webcontent/src/test/resources/DojoSpecRunner.htmltemplate) for running the tests.  We do this because we want to make sure that we can properly configure Dojo so we can test our AMD modules.  In actuallity this template is almost exactly the same as the one [provided by default with the Jasmine Maven Plugin for Require.js](http://searls.github.com/jasmine-maven-plugin/spec-runner-templates.html) AMD modules as noted in the comments at the top of our template.

### Jasmine Configuration

In the configuration of the Jasmine plugin we do a few things.  First we exclude all the source files.  This may seem odd at first but since we are testing AMD modules they should be loaded by the AMD loader and not Jasmine itself.  We then include all the JavaScript test files but our loader will load them asynchronously instead of including them in the page directly.  Lastly we include two JavaScript files into the page.  The first one, [jasmine-test-bootstrap.js](https://github.com/OpenSocial/explorer/blob/master/opensocial-explorer-webcontent/src/test/resources/jasmine-test-bootstrap.js), provides our configuration for Dojo.  The second is Dojo itself.

### Testing Your AMD Modules

To test your AMD module create a new JavaScript file in opensocial-explorer-webcontent/src/test/javascript.  Your JavaScript file should look like this

    define(['modules/path/MyModule'], function(MyModule)) {
      describe('My super module', function() {
        it('can do amazing things', function() {
          //Test that your module can do amazing things
        });
      });
    });

The key here is that your tests start with a define call to load the module(s) you will be testing.  You can then easily run your tests using a simple Maven command.

    $ cd opensocial-explorer-webcontent
    $ mvn jasmine:bdd

This should output something like

    ....
    Server started--it's time to spec some JavaScript! You can run your specs as you develop by visiting this URL in a web browser: 
    
    http://localhost:8234
    
    The server will monitor these two directories for scripts that you add, remove, and change:
    
    source directory: src/main/javascript
    
    spec directory: src/test
    
    Just leave this process running as you test-drive your code, refreshing your browser window to re-run your specs. You can kill the server with Ctrl-C when you're done.

To run your tests just open a browser and go to http://localhost:8234.  You can then continue to make changes to your test and just refresh the page to run them.  After you are done you want to make sure you build the opensocial-explorer-webcontent module to make sure the tests pass in headless mode as well.

    $ cd opensocial-explorer-webcontent
    $ mvn



