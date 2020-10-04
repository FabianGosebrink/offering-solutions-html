---
title: Securing an Electron App Implemented with Angular Using OIDC and OAuth2
date: 2020-09-17
tags: ['aspnetcore', 'angular', 'electron', 'crossplatform']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to explain how you can secure a Cordova app written in Angular with OIDC and OAuth2 using IdentityServer4 as the Secure Token Server. We will take a look at an Angular project created with the AngularCLI or the NxDevTools and then turn it into a Cordova app via the Cordova CLI to let it run on the mobile phone and set everything up that we can authenticate to get an identity token and an access token and navigate back to our app to consume a protected API. The result is a web app which can be compiled to be a mobile app or a web application which can run in a desktop browser and secured using OIDC Code flow with PKCE.

## What we will use
