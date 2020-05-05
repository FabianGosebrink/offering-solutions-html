---
title: Authentication & Authorization with OAuth2, OIDC with Angular and ASP.NET Core
date: 2020-05-03
tags: ['angular', 'authentication', 'authorization', 'aspnetcore']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to describe how you can add a login to your Angular App and secure it with OpenID Connect (OIDC) and OAuth2 to access an ASP.NET Core WebAPI.

> Disclaimer: In this blog we will use an Angular library which I wrote some parts of. The principles are best practice and uses a standard which can be applied to any Angular application no matter what libraries you use.

## The Situation

In this Scenario we have three parties playing with each other: On the one side we have the REST Api which we want to secure and only let the request come through which come from an authenticated source. This is in this case an ASP.NET Core WebAPI using the `[Authorize]` attribute to secure complete controllers or several methods.

On the other side we have the Single Page Application (SPA) which is an Angular Application in this case. It is responsible for sending the requests with all information needed to get it processes as REST is stateless and it talks to the REST backend we just mentioned.

The third player in this game is the Security Token Service (STS). In this case this is an ASP.NET Core MVC application which holds the configuration to connect the SPA with the REST Api.

So what we will implement is an Angular Client, who is redirected to the STS. The user is being asked for username and password, has to check all the information he wants to provide and gets two tokens. One for the identity (OpenID Connect - Id Token) and one the access to the REST API (Access Token, OAuth). After collection those tokens the SPA can add those tokens to the requests where needed and ask for protected data.

## The Security Token Server
