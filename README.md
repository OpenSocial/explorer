OpenSocial Explorer
========

About
-------------

The OpenSocial Explorer is a tool to help developers learn how to build OpenSocial gadgets.  The goal of the OpenSocial Explorer is to demonstrate how to use all the features and APIs that are part of the OpenSocial specification.  Besides the samples, the OpenSocial Explorer has an editor which allows developers to tweak the gadget to learn more about the specific features and APIs the sample is demonstrating.  After modifying the sample the OpenSocial Explorer allows developers to re-render the gadget to see how the changes effect the sample.

Getting Started
-------------

    git clone git@github.com:OpenSocial/explorer.git
    cd explorer
    mvn clean package -P run

Open your favorite browser and navigate to http://localhost:8080, then click Explore in the navigation bar.