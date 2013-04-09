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
Performing A Release
====================

We roughly follow the [Apache release process](http://www.apache.org/dev/release-publishing.html)
when performing a release for the OpenSocial Explorer.  There are a few prerequisites before being
able to perform a release:

1.  You need to be a committer.  Creating a release will involve pushing files to the GitHub repo so
you need to have permissions to do so. 
2.  You need to generate a public and private key in order to sign releases and add your public key
to the [KEYS](https://github.com/OpenSocial/explorer/blob/master/KEYS) file in the project.
3.  You need to have an account for the Sonatype OSS Repository.  Follow the steps in the
[user guide](https://docs.sonatype.org/display/Repository/Sonatype+OSS+Maven+Repository+Usage+Guide)
to create an account.  Then leave a comment on this 
[JIRA ticket](https://issues.sonatype.org/browse/OSSRH-5824) saying you want publishing rights
to the repository.

Requirement number one is obvious however requirement number two may seem a bit odd if your are not
experiences with open source projects.  At a very high level we want to sign all release artifacts
so that consumers can be somewhat confident that the artifacts are coming from a reliable source.
Apache has a very good [overview](http://www.apache.org/dev/release-signing.html) of the how and why
of doing this.  If you want to perform releases please read and follow their document first.

The OpenSocial Explorer should be consumable by other applications so we also publish our artifacts
to the Central Maven Repository for other Maven projects to easily consume.  Sonyatype has an open
source Maven repository which syncs with the Central Maven Repository that we use for hosting the
OpenSocial Explorer's artifacts.  The process for deploying artifacts to their repository is
documented in their 
[user guide](https://docs.sonatype.org/display/Repository/Sonatype+OSS+Maven+Repository+Usage+Guide).

The steps below specify how to perform a release.

0.  Modify Your Maven Settings
---------------------

The Sonatype OSS release process assumes you have some servers defined in your Maven settings
in order to upload release artifacts.  Open your Maven settings.xml file in ~/.m2 and add
the following servers.

    <settings>
      ...
      <servers>
        <server>
          <id>sonatype-nexus-snapshots</id>
          <username>your-jira-id</username>
          <password>your-jira-pwd</password>
        </server>
        <server>
          <id>sonatype-nexus-staging</id>
          <username>your-jira-id</username>
          <password>your-jira-pwd</password>
        </server>
      </servers>
      ...
    </settings>

The jira-id and jira-pwd are your JIRA user name and password you signed up with in step 3 
of the prequisites above.

1.  Open An Issue
---------------------

Open an [issue](https://github.com/OpenSocial/explorer/issues) used to track the release.

2. Create A Clone Of The Repository
---------------------
Create a clone of the repository to do your release work.  You may also use an existing clone 
of the repo if you have one.

     $ git clone git@github.com:OpenSocial/explorer.git     
     $ cd explorer

3.  Perform A Dry Run
---------------------
You want to do a dry run of the release first.  This will perform a release without checking in
any code or creating a tag.

    $ mvn release:prepare -DdryRun=true -Prelease

Running the release profile (-Prelease) is key in that it will also build the 
opensocial-explorer-assembly module and produce source and javadoc jar files.  This is kept out of
the normal build to reduce the overhead when doing development.  The release:prepare goal will 
create modified POM files for all the modules.  You will see multiple versions for each.

*  <b>pom.xml.tag:</b> The POM that will be checked in and associated with the tagged release.
This POM will have the current version specified in it with the SNAPSHOT tag removed.
*  <b>pom.xml.next:</b> The POM that will be checked in and will have the next version of the 
project.
*  <b>pom.xml.releaseBackup:</b> A backup unmodified version of the POM file.

It is good practice to review the changes made to the different POM files to make sure everything
apears correct.  You can easily do this with any diff tool.  The main things to look for is that
the versions and SCM elements are modified correctly.  If you find something that is wrong you
can clean the release by running 

    $ mvn release:clean

This will clean up all the POM files.  You can then go ahead and fix whatever is wrong and rerun
the dry run.

4.  Prepare The Release
---------------------
Once you are satisfied with the dry run you can prepare the release.

    $ mvn release:clean
    $ mvn release:prepare

<span class="label label-important">The release:prepare goal will actually check in the new POM 
files and tag the release in the GitHub repo.</span>

5.  Stage The Release
---------------------
You should now deploy the releases to the staging repository.

    $ mvn release:perform -Prelease

You should now be able to log into [Sonatype Nexus App](https://oss.sonatype.org) and click Staging
Repositories in the navigator on the left and find the release you just staged.  The artifacts 
in this staging repository will be the ones you and the rest of the community test with before
promoting the release.  It is easier to download the artifacts 
[here](https://oss.sonatype.org/content/groups/staging/org/opensocial/explorer/) 
than from the Nexus app.

6.  Let The Community Know
---------------------

Modify the issue you created in step 1 with a link to the staging artifacts and let the community
know that there is a new release candidate.  As long as no one finds any issues within 72 hours of staging
the release you may promote the release.

7a.  Promoting A Release
---------------------

Follow step 8a in the 
[Sonatype OSS User Guide](https://docs.sonatype.org/display/Repository/Sonatype+OSS+Maven+Repository+Usage+Guide)
to release the staged artifacts.  Once a staged release has been "closed" they will appear 
[here](https://oss.sonatype.org/content/groups/public/org/opensocial/explorer/).  Note that the 
Sonatype repository syncs with the Central Maven Repository every 2 hours so it may take up to
2 hours for the release to appear in the Central Maven Repository.

7b.  Dropping A Release
---------------------

It is not uncommon to find a problem with a staged release.  When you do you will need to drop the
release, fix the problem, and stage it again.  In step 8a of the [Sonatype OSS User Guide](https://docs.sonatype.org/display/Repository/Sonatype+OSS+Maven+Repository+Usage+Guide)
there is a description of how to drop a release as well.  This will remove all the staged artifacts
from the repository.

This is not the only thing you need to do though, remember Maven also created a tag for the release and
checked in changes to the POM files, we also need to undo those as well.  Luckily as long as you have not run
a release clean operation since performing the release, Maven can take case of undoing some of this
for you by using the 
[release rollback goal](http://maven.apache.org/maven-release/maven-release-plugin/examples/rollback-release.html).
You just have to run

    $ mvn release:rollback

<span class="label label-important">Currently this will not [undo](http://jira.codehaus.org/browse/MRELEASE-229) 
the tag Maven created in GitHub, that you will have to do yourself.</span>

8.  Update The Project Site
---------------------

After a new release is promoted you need to update the [project site](../developer/site.html).
More specifically links to the current release artifacts should be updated on the Downloads page.

9.  Close The Issue And The Milestone
---------------------

Close the issue you opened for the release and also close the milestone for the release.  Make sure you
create a milestone for the next release.

10.  Announce The Release
---------------------

We need to get the word out about the new release, here are some channels we can use to do that.

1.  [The OpenSocial Blog](http://blog.opensocial.org/)
2.  Twitter accounts, specifically the [OpenSocial](https://twitter.com/opensocial) one.
3.  The [OpenSocail Spec Google Group](https://groups.google.com/forum/?fromgroups#!forum/opensocial-and-gadgets-spec).



