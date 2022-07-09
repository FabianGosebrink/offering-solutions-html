---
title: How to modularize your angular application
date: 2015-03-17
tags: ["angularjs", "modules"]
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  ["/blog/articles/2015/03/17/how-to-modularize-your-angular-application/"]
---

In this blog post I want to show you a way on how to modularize your angular application in a way I did it so far. Enjoy reading :)

Due to the fact that angular.js gets more and more important you are forced to think about a nice architecture to develop easy. Especially if you develop in mulitple teams.

Well one of the killer features for me in angular is its modularization. Even when you are starting an app you realize that the whole app is nothing else than a module.

```javascript
var app = angular.module("TestApp", [
  //...
]);
```

Now we could add all our services, and controllers to our defined app. Which would make them all accessable. Behind the scenes angularJS uses dependency injection to offer us our parts of our software and these services are singletons, so they are accessable everywhere out of the box.

![Folie30](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/02/Folie30.jpg)

But this is not a nice architecture and we are not using modularization. You do not have an overview of you application when you are using at your application.js file. You are using angularJS to build architectures, so lets do so!

Go and build a folder for every Module you want to create:

![Folders](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/02/Folders.png)

And register your services on these modules.

```javascript
var homeModule = angular.module("home.homeModule", ["ngRoute"]);

homeModule.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      controller: "home.controllers.homeController",
      templateUrl: "/app/Home/Templates/overview.html",
    })
    .otherwise({ redirectTo: "/" });
});
```

```javascript
"use strict";
homeModule.controller("home.controllers.homeController", [
  "$scope",
  "home.services.peopleService",
  "toaster",
  "cfpLoadingBar",
  function ($scope, peopleService, toaster, cfpLoadingBar) {
    //...
  },
]);
```

Then you have to load your modules in your app like this:

```javascript
var app = angular.module("TestApp", [
  "ngRoute",
  "ngResource",
  "toaster",
  "chieffancypants.loadingBar",

  "home.homeModule",
  "contact.contactModule",
]);
```

![How to modularize your angular application](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/02/Folie31.jpg)

With this you have your application divided in modules and you can add or remove the modules as you want with no effort. You can also easily see which modules your application is based on.

Regards

Fabian
