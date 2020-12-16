---
title: Running cypress tests in an Angular project with travis CI
date: 2018-06-01
tags: ['angular', 'endtoend', 'cypress', 'travisci']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  ['/blog/articles/2018/06/01/running-cypress-tests-in-angular-with-travis-ci/']
---

In the last blogpost I explained how to get started with cypress tests. The next step would be running these tests in a Continuous Integration and Continuous Delivery (CI and CD) environment. The advantage of this is that with every commit the tests are being executed automatically and you get feedback about wether your application is still doing good or not automatically.

[Travis CI](https://travis-ci.org/) is a very well known Continuous Integration Environment and is very common when working with OSS projects. The best thing about it is that it is free to use for an open source project.

## Preparations

To get started we need to modify our project.json a bit. Referring to [this demo](https://github.com/FabianGosebrink/cypress-angular-getting-started) we know that with

```javascript
"cypress:open": "concurrently \"ng serve\" \"cypress open\""
```

we can start our end to end testing to see what is going on with our application. The problem is that on CI/CD environments you do want to run everything only once and throw an error if at least one test is failing and you want to shut down the server and clean everything up when things have done good and you can continue to the next step in your build/release pipeline.

## Create a npm continuous integration command

I like using the abstraction of commands from the package.json `scripts` tag especially when it comes to CI. So we can add a command for now which - no matter which CI service in the end - will call and trigger our end to end tests.

```javascript
"cypress:ci": "<should do something>",
```

### Building the application

We want to test our production ready application. So the first script we will add is the `ng build --prod` command to get an application output we can test.

```javascript
"cypress:ci": "ng build --prod <should do something>",
```

### Starting the server to serve the app

Having done that we want to start an independent http-server which serves our application like a real webserver would do if a human would enter our site and click around. I am using [http-server](https://www.npmjs.com/package/http-server) a lot. Installed globally it has a nice and easy cli which we can use to run our webserver whereever we want to. We can install it for our project and access it via a `script` tag then. Knowing that our application will build into the folder `dist/cypressTest` in our case we can start a webserver and give the path as an command line argument. Lets create a new script tag for that:

```javascript
"cypress:ci": "ng build --prod <should do something>",
"start:ci": "http-server ./dist/cypressTest -a localhost -p 8000 -c-1"
```

So `http-server ./dist/cypressTest` is starting the server at our required path. With `-a localhost` we can specify the IP which is going to be used. This is localhost or 127.0.0.1 in this case. As a port we sepcify `-p 8000` and because we do a lot of reloading we are disabling the cache with `-c-1`.

> Remember we told cypress to load localhost:8000 in our tests. `cy.visit('http://localhost:8000');`

### Starting cypress

So we are building our application now and are running a webserver on travis ci so cypress is able to access it (like a user would do it) and can test it. The `cypress open` command _opens_ cypress and keeps it open (who would have thought ;-). What we need however is a command to run all the tests we implemented once and shut down then. We can use the `cypress run` command. [doc](https://docs.cypress.io/guides/guides/command-line.html#Run-tests). So lets create a script tag for that as well:

```javascript
"cypress:ci": "ng build --prod <should do something>",
"start:ci": "http-server ./dist/cypressTest -a localhost -p 8000 -c-1",
"cypress:run": "cypress run",
```

### Getting the pieces together (I of II)

Let us stick a few pieces together so far: We can let run cypress and start the tests, we can build our application and start a webserver to serve our app to cypress. We only have to concatenate it for our main CI command Travis CI has to call in the end:

```javascript
"cypress:ci": "ng build --prod && start:ci && cypress:run",
"start:ci": "http-server ./dist/cypressTest -a localhost -p 8000 -c-1",
"cypress:run": "cypress run",
```

The `&&` is running one command after the other when the current one is finished. But starting a webserver never finishes really. It is started and will run until you shut it down. On CI environments you want to shut down _after_ all the test ran and you want it to happen automatically. So we need something to run commands in parallel and will stop after automatically.

### Running commands in parallel

Running commands in parallel can be done with the npm package [npm-run-all](https://www.npmjs.com/package/npm-run-all). The command `run-p` does exactly that: Running npm commands in parallel. After installing it let us use this one to help us out:

```javascript
"cypress:ci": "ng build --prod && run-p start:ci cypress:run",
"start:ci": "http-server ./dist/cypressTest -a localhost -p 8000 -c-1",
"cypress:run": "cypress run",
```

With that we are building our application in prod mode (thanks to the angular cli) and start our webserver and cypress in parallel. But how do we shut down if everything went well?

### Getting the pieces together (II of II)

Taking a look at the documentation from [run-all](https://github.com/mysticatea/npm-run-all/blob/HEAD/docs/npm-run-all.md) we can see that the `-r` or `--race` can _"kill all tasks when a task finished with zero"_. Cool! Exactly what we need. So lets use this one:

```javascript
"scripts": {
...
"cypress:run": "cypress run",
"cypress:ci": "ng build --prod && run-p --race start:ci cypress:run",
"start:ci": "http-server ./dist/cypressTest -a localhost -p 8000 -c-1"
},
```

Cool. Now we need to tell travis to call exactly that command `cypress:ci` which we use to tigger all our tests.

## Connecting your project to Travis CI

To get travis going to need to connect your project with travis once you logged in and added you repository. If you have done that you can add a `travis.yml` file into your project on root level with the following content:

```javascript
language: node_js
node_js:

-   "8.9"
    cache:
    directories: - ~/.npm - node_modules
    install:
-   npm install
    script:
-   npm run cypress:ci
```

First, we set the language to node_js defining the version afterwards. The `install` tasks are a plain `npm install` to install all dependencies. After doing that travisCI should automatically call `npm run cypress:ci` which is the command from our package.json.

If you connected your github repository to travis and added this file with the next check in the build should automatically trigger and your cypress tests should run automatically.

![CypressTravis](https://cdn.offering.solutions/img/articles/2018-06-01/cypress-travis.gif)

HTH

Fabian
