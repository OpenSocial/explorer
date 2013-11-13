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
The OpenSocial Explorer uses [Maven](http://maven.apache.org/) to build and run tests on the code.  You will need to [download](http://maven.apache.org/download.cgi) and install Maven 3.0.x.  You might find it useful to add Maven's bin directory to your PATH so you can run Maven from anywhere.  The [Maven Users Centre](http://maven.apache.org/users/index.html) provides some good getting started documentation if you are not familiar with Maven.

Note that you must install Maven 3.0.x because the copy-maven-plugin we use is not compatible with the Maven 3.1.x.  Once the copy-maven-plugin is updated we should be able to support Maven 3.1.x.

Getting And Running The Code
---------------------

Obviously you are here because you want to modify and hopefully contribut the code, so the first thing you need is the code. To do this you should [fork](https://help.github.com/articles/fork-a-repo) the OpenSocial Explorer repository.  After you fork the code you need to clone your fork.

    $ git clone git@github.com:gitusername/explorer.git

 After cloning the code all you need to do is cd to the directory and then kick off Maven.

    $ cd explorer
    $ mvn clean package -P run

 This will first build the OpenSocial Explorer and then deploy the WAR produced by the build to a Jetty server.  Now all you have to do is open your favorite browser and navigate to [http://localhost:8080](http://localhost:8080).  When you make changes to the code all you have to do is rerun the Maven command above to test them out.


Eclipse Configuration
---------------------

### Using Tomcat
If you are using Eclipse you can also test and debug the OpenSocial Explorer using Tomcat.  Before you can do that you need to configure Tomcat in your Eclipse development environment.  There are several articles online which illustrate how to do this.  Here are some good ones.

*  [Adding Apache Tomcat Runtimes](http://help.eclipse.org/juno/index.jsp?topic=%2Forg.eclipse.jst.server.ui.doc.user%2Ftopics%2Ftwtomprf.html)
*  [Creating A Tomcat Server](http://help.eclipse.org/juno/index.jsp?topic=%2Forg.eclipse.jst.server.ui.doc.user%2Ftopics%2Ftomcat.html)

After you have added your Tomcat runtime and created a Tomcat server you need to add the OpenSocial Explorer module/web app.  To do this you need to [edit the server](http://help.eclipse.org/juno/index.jsp?topic=%2Forg.eclipse.jst.server.ui.doc.user%2Ftopics%2Ftomcat.html).  In the server editor click on the Modules tab at the bottom.  Then click on the Add External Web Module... button.  In the Add Web Module dialog click the Browse button and navigate to the opensocial-explorer-server-war projects target directory.  In the target directory select the opensocial-explorer-server-war-[version]-SNAPSHOT directory.  Save the changes in the server editor.  Now when you launch Tomcat from Eclipse you should be able to navigate to [http://localhost:8080](http://localhost:8080) and test the OpenSocial Explorer.

### Syncing Web Content Resournces
Eclipse users are used to being able to start a webapp in debug mode and use hot code replace to change code and immediately see their changes.  With the way the webapp is constructed for the OpenSocial Explorer this is not possible.  Since hot code replace does not work out of the box, making changes to the web app resources requires you to rerun the build.  To solve this problem we use an Eclipse plugin called [FileSync](http://andrei.gmxhome.de/filesync/index.html) and a [Maven plugin](http://mavenfilesync.googlecode.com/svn/trunk/maven-filesync-plugin/site/index.html) which generates the FileSync configuration files for the OpenSocial Explorer.  Follow the below instrcutions to setup your development environment.

1.)  Install the Eclipse FileSync plugin from the project update site.  See the [installation instructions](http://andrei.gmxhome.de/filesync/index.html) on the project website.

2.)  Then you need to run a mvn build of the OpenSocial Explorer which will generate the necessary configuration files.


    $ mvn clean package


3.)  Refresh the projects in your Eclipse workspace.  You should be able to right click on the opensocial-explorer-webcontent project and go to Properties -> File synchronization and see the synchronization settings for the web resources.  The first time you will have to enable File Synchronization in the project properties.

4a.)  Run the Jetty goal to start the server.  Note:  In testing file synchronization with the Jetty web container did not work on Windows, see 4b.  This is most likely do to Jetty locking the files on Windows.


    $ mvn clean package -P run

4b.)  On any OS, you can also configure Eclipse to launch the OpenSocial Explorer using Tomcat.  This works on Windows, unlike the Jetty option.  See above for details on how to configure a Tomcat debug environment in Eclipse.


5.)	  Now any changes you make in the opensocial-explorer-webcontent project will be synchronized with the webapp directory Jetty is using.


 Contributing Code
---------------------

 We will welcome all contributions to the OpenSocial Explorer.  So if you want to fix a bug, add a feature, enhance the documentation, bring it on!  Once you have made the changes you want to contribute in your fork submit a [pull request](https://help.github.com/articles/using-pull-requests) to let the committers know you want to pull some changes back into the repo.  If the community agrees that the changes are acceptable the pull request will be merged into the repo.