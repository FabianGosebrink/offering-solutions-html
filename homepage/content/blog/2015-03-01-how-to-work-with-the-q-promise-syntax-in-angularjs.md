---
title: How to work with the q promise syntax in AngularJS
date: 2015-03-01
tags: ['angularjs']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  [
    '/blog/articles/2015/03/01/how-to-work-with-the-q-promise-syntax-in-angularjs/',
  ]
---

In this blog post I want to show you how to work with the q promise syntax in AngularJS

#### The "Then(success/error)"-Syntax

If you are developing with **angularJs** you have to work with promises angular gives to you. Its the syntax you have when you can react with a "then(success/error)" on it. And if you work with this syntax you will notice that its very mighty because it is one very clean way to react to your server responses or whatever in case of an error. So the "then(success/error)"-syntax is giving you error handling out of the box. You get the promise and react on it in case of a good or an error result.

Very cool, hm?

```javascript
$http.get('/here/goes/my/Api').then(
  function (result) {
    // Success
  },
  function () {
    // Error
  }
);
```

#### Structure which tiers that have no clue!

Working client-side also needs structure and architecture to get to all these files and their responsibilities. This means: Giving your application modularity, making several single responsibilities to your controller, perhaps modal-controllers and working with repositories (which are also called "*services" or "*dataservices" or whatever. I use to call the repositories because on the client side its where i get the data from. I will handle this in a special blog post by the time.

The thing is: We have different levels ob abstraction and the "then(success/error)" syntax can be used once. Once we received a promise, we can react in a positive or a negative way on it. And thats it. Our tier calling a method which uses the promise has no idea id the success was good or not. because it was already resolved.

An example:

Repository:

```javascript
$http.get('/here/goes/my/Api').then(
  function (result) {
    // Success
    return 'good';
  },
  function () {
    // Error
    return 'bad';
  }
);
```

and your controller could be like:

```javascript
function loadMyData() {
  var result = myRepository.getSomeData($routeParams.id);

  if (result == 'good') {
    //Success
  }
  if (result == 'bad') {
    //Error
  }
}
```

So the controller does not have an idea about the promise anymore. It only has the variables to work with. And this is ugly. In fact: We are losing our promise as soon as we return something else. Here this is in the repository (or (data)service)

#### The solution

The solutions for this brings us the q-syntax. With this syntax we are able to keep our promise to the upcoming layers. So we are calling our webAPI, angular gives us a promise via the http-syntax (seen above). And we do not reject hardcoded data, but we keep the promise and make it returning either good or bad depending on which case it has.

```javascript
app.factory("myRepository", ["$http", "$q", function ($http, $q) {
...
var _getMyData = function () {
        var deferred = $q.defer();

        $http.get("here/goes/my/api")
          .then(function (result) {
              // Successful
              deferred.resolve(result);
          },
          function () {
              // Error
              deferred.reject();
          });

        return deferred.promise;
    };
...
}
```

So the \$q-sign gives us the possibility to access our promise and store it in a variable called "deferred" here. And in case of an error, we keep this promise alive, resolving it positively and on top of that we are passing our data in it which shall be available to whoever is going to resolve this promise from the outside. This is what "deferred.resolve(result);" does. But in case of an error we reject the promise. So again: We are keeping it, but we are telling the caller "This promise was not resolved positive". In the last line we are returning our promise.

The advantage now is that an outside caller can react on it with the same syntax he already knows, the "then(success/error)"-thing. Because this function shown above returns a normal promise!

```javascript
function getMyData() {
    myRepository.getMyData(...)
        .then(function(result) {
                // success
                $scope.myResultData = result.data;
            },
            function() {
                //error
                $scope.errorMessage = "Bad bad bad";
            });
};
```

So this is way better than the error handling with any strings or bools or whatever.

Hope you enjoyed reading.

Regards

Fabian
