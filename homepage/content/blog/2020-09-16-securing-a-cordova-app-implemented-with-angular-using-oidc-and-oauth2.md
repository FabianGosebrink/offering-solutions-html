---
title: Securing a Cordova App Implemented with Angular Using OIDC and OAuth2
date: 2020-08-09
tags: ['aspnetcore', 'angular', 'cordova', 'crossplatform']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to show how to upload files from an Angular application over an ASP.NET Core WebAPI to an Azure Blob Storage and save them there. Using an Azure Blob Storage for this is very easy and cheap as well so it is a perfect candidate not to pollute your App Service and store files there but use a dedicated system for this. In this blog post we will see how we can create the Azure Blob Storage in the Azure Portal, add the appropriate services into an ASP.NET Core WebAPI and add an Angular Client to upload the files.
