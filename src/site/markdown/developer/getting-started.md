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
Getting Started
====================

So you want to contribute to the OpenSocial Explorer? Great!  Here is how you get started.

Setting Up Your Development Environment
---------------------

### Installing a JDK
If you don't already have a JDK installed you will need one.  The OpenSocial Explorer requires Java 1.6 or newer.  You can download a JDK directly from [Oracle](http://www.oracle.com/technetwork/java/javase/downloads/index.html) or use another implementation.

### Installing Git 
You will need to do is install [Git](http://git-scm.com/) if you don't already have it installed.  If you are new to Git, GitHub provides some good getting started documentation in their [help section](https://help.github.com/).  Atlassian also provides a good [tutorial](http://atlassian.com/git/) on getting started with Git, especially if you are familiar with SVN.

### Installing Maven
The OpenSocial Explorer uses [Maven](http://maven.apache.org/) to build and run tests on the code.  You will need to [download](http://maven.apache.org/download.cgi) and install Maven.  You might find it useful to add Maven's bin directory to your PATH so you can run Maven from anywhere.  The [Maven Users Centre](http://maven.apache.org/users/index.html) provides some good getting started documentation if you are not familiar with Maven. 

Getting And Running The Code
---------------------

Obviously you are here because you want to modify and hopefully contribut the code, so the first thing you need is the code. To do this you should [fork](https://help.github.com/articles/fork-a-repo) the OpenSocial Explorer repository.  After you fork the code you need to clone your fork.

    $ git clone git@github.com:gitusername/explorer.git

 After cloning the code all you need to do is cd to the directory and then kick off Maven.

    $ cd explorer
    $ mvn clean package -P run

 This will first build the OpenSocial Explorer and then deploy the WAR produced by the build to a Jetty server.  Now all you have to do is open your favorite browser and navigate to [http://localhost:8080](http://localhost:8080).  When you make changes to the code all you have to do is rerun the Maven command above to test them out.


 Contributing Code
---------------------

 We will welcome all contributions to the OpenSocial Explorer.  So if you want to fix a bug, add a feature, enhance the documentation, bring it on!  Once you have made the changes you want to contribute in your fork submit a [pull request](https://help.github.com/articles/using-pull-requests) to let the committers know you want to pull some changes back into the repo.  If the community agrees that the changes are acceptable the pull request will be merged into the repo.