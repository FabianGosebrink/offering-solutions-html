---
title: Moving from TravisCI to GitHub Actions
date: 2021-01-05
tags: ['hugo', 'github']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to write about how you can move from TravisCI to GitHub Actions. Together with [DamienBod](https://twitter.com/damien_bod?lang=en) I am maintaining an Angular library for OIDC and OAuth2 [angular-auth-oidc-client](https://github.com/damienbod/angular-auth-oidc-client). In this blog post I want to describe why and how I migrated from TravisCI to GitHub Actions.

## TOC

- [TL;DR](#tl;dr)
- [Why moving?](#why-moving?)
- [The current TravisCI build](#the-current-travisci-build)
- [The GitHub Action](#the-github-action)
- [Adding a task for schematics](#adding-a-task-for-schematics)
- [Adding Code Coverage](#adding-code-coverage)
- [Complete Example](#complete-example)

![github actions animation](https://cdn.offering.solutions/img/articles/2021-01-05/Github-action-3.gif)

## TL;DR

[Complete Example](#complete-example)

Find the moving-to-github-actions-commit here [Moving to GitHub actions](https://github.com/damienbod/angular-auth-oidc-client/commit/6589b7d19772bf541dac995a0101f8c2de385f8b) and the adding-code-coverage-commit here [adding code coverage](https://github.com/damienbod/angular-auth-oidc-client/commit/85629a40ba5678c9e2b062194c67bd7efabd0e98)

## Why moving?

In the beginning of November 2020 TravisCI announced that they will change their pricing plan which made me read their new announcement. I found out that TravisCI is providing a free amount of minutes to spend on open source projects because TravisCI found out their systems suffer from misusage.

```
When your credit allotment runs out - we’d love for you to consider which of our plans will meet your needs.
 - We will be offering an allotment of OSS minutes that will be reviewed and allocated on a case by case basis. Should you want to apply for these credits please open a request with TravisCI support stating that you’d like to be considered for the OSS allotment. Please include:
 - Your account name and VCS provider (like travis-ci.com/github/[your account name] )
 - How many credits (build minutes) you’d like to request (should your run out of credits again you can repeat the process to request more or discuss a renewable amount)
Usage will be tracked under your account information so that you can better understand how many credits/minutes are being used
```

Taken from [https://blog.travis-ci.com/2020-11-02-travis-ci-new-billing](https://blog.travis-ci.com/2020-11-02-travis-ci-new-billing)

As an OSS maintainer I got loads of work to do keeping the projects up to date and I do not want to spend my time watching how many build minutes I already have used and send emails. I knew about a thing called `GitHub Actions` and I wanted to learn it anyway. So with moving from TravisCI to GitHub Actions I have my complete CI/CD in one place and do not have to rely on a third party CI/CD provider anymore, I learned something new and did not have to worry about build minutes.

This is why I started.

## The current TravisCI build

The current build was doing the following steps in sequence

1. Preparing the environment by installing node, the @angular/cli and code coverage tools
2. Linting the lib
3. Testing the lib
4. Make a production build of the lib

As we had issues with installing the lib I added the following steps to make sure our lib can be installed

5. Creating a new empty angular project with the angular cli
6. Installing the built lib in it

and to be even more covered I added the steps

7. Testing the new angular project with the lib
8. Make a production build of the new angular project

In the end we wanted to check our code coverage with coveralls and display that in a badge at our [Readme.md](https://github.com/damienbod/angular-auth-oidc-client/blob/main/README.md)

Existing TravisCI `*.yaml` file

```
sudo: required
dist: trusty
addons:
    chrome: stable
language: node_js
node_js:
    - '12'
before_install:
    - npm i npm@^6 -g
    - npm install -g @angular/cli
    - npm install codecov -g
install:
    - npm install
script:
    - npm run lint-lib
    - npm run test-lib-ci
    - npm run build-lib-prod
    - cd ../..
    - ls
    - ng new testProject
    - cd ./testProject
    - npm install ../damienbod/angular-auth-oidc-client/dist/angular-auth-oidc-client
    - npm test -- --watch=false --browsers=ChromeHeadless
    - npm run build -- --prod
before_script:
    - export DISPLAY=:99.0
    - sh -e /etc/init.d/xvfb start
    - sleep 3
after_success:
    - cd ..
    - npm run coveralls

```

## The GitHub Action

First I added a new `build.yaml` file to place my action in.

```
├── .github
    └── workflows
        └── build.yml    // <- add this file
├── [...]
...
```

After this we give it a name and want to listen to the `main` branch including the pull requests:

```
name: angular-auth-oidc-client-build

on:
    push:
        branches:
            - main
    pull_request:
        types: [opened, synchronize, reopened, closed]
        branches:
            - main
```

Now we define the `build_job` which runs on `ubuntu-latest`.

```
jobs:
    build_job:
        runs-on: ubuntu-latest
        name: Build Job
        steps:
            ...
```

As a first step we check out the files and install node in version 12 on the system.

```
...
steps:
    - uses: actions/checkout@v2
      with:
          submodules: true

    - name: Setup Node.js 12
      uses: actions/setup-node@v1
      with:
          node-version: 12
```

Next, let us install the dependencies with `npm install`, lint the frontend with `npm run lint-lib` and test the lib with `npm run test-lib-ci`

```
- name: Installing Dependencies
  run: sudo npm install

- name: Linting Frontend
  run: sudo npm run lint-lib

- name: Testing Frontend
  run: sudo npm run test-lib-ci
```

For the testing I had to add a new browser with no sandbox `ChromeHeadlessNoSandbox` to my `karma.conf.js` which is called with the `test-lib-ci` task in the `package.json`

```
test-lib-ci": "ng test angular-auth-oidc-client --watch=false --browsers=ChromeHeadlessNoSandbox --code-coverage",
```

```js
module.exports = function (config) {
  config.set({
    // ...
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    // ...
  });
};
```

In the end, let us build the lib with a production build `build-lib-prod`

```
- name: Building Frontend
  run: sudo npm run build-lib-prod
```

Now, let us add a step which creates a new AngularCLI project, installs the lib we built, tests the project and makes a production build of the app.

For this we can pipe all the operations to combine it in a single task:

```
- name: Create new Angular Project and install lib in it, test it and build it
  run: |
      cd ..
      sudo npm install -g @angular/cli
      echo 'Creating new angular project'
      sudo ng new testProject --skip-git
      cd testProject
      sudo npm install ../angular-auth-oidc-client/dist/angular-auth-oidc-client
      npm test -- --watch=false --browsers=ChromeHeadless
      sudo npm run build -- --prod
```

If that works, we are very far!

## Adding a task for schematics

In this task we want to check if the schematics are working and an app can be built when added something with the schematics. We are using schematics to add an auth module to our app and include it in our `AppModule`. When adding the lib with the `ng add ...` command using specific schematics we can also pass all the parameters we have in a single command as parameter.

We create a new Angular project as in the previous step but this time use the schematics to add the lib to our project with the parameters, then test and build the app.

```
sudo ng add ../angular-auth-oidc-client/dist/angular-auth-oidc-client --stsUrlOrTenantId "my-sts-url" --flowType "OIDC Code Flow PKCE using iframe silent renew"
```

```
- name: Create new Angular Project and use the schematics to add a module
  run: |
      cd ..
      sudo npm install -g @angular/cli
      sudo ng new testProjectSchematic --skip-git
      cd testProjectSchematic
      sudo ng add ../angular-auth-oidc-client/dist/angular-auth-oidc-client --stsUrlOrTenantId "my-sts-url" --flowType "OIDC Code Flow PKCE using iframe silent renew"
      npm test -- --watch=false --browsers=ChromeHeadless
      sudo npm run build -- --prod
```

## Adding Code Coverage

Last thing to do is adding the code coverage to check if this changed with a PR. I am using [coveralls](https://coveralls.io/) for this which is free for open source projects.

In the `karma.conf.js` a `lcov.info` file was created with

```js
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    //..
    coverageReporter: {
      dir: require('path').join(
        __dirname,
        '../../coverage/angular-auth-oidc-client'
      ),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcov' }],
    },
    //..
  });
};
```

With the task this file is present as well and with the actions [Coveralls GitHub Action](https://github.com/coverallsapp/github-action) we can use this already created file and publish and view our code coverage.

I am placing it between the testing and the building of the lib. We are using a variable called `secrets.github_token` which you already have. You do not need to add it to your secrets of this repository. You can use it right away. Be sure to provide the correct path to `path-to-lcov`. In our case, this is `'./coverage/angular-auth-oidc-client/lcov.info'`.

```

- name: Testing Frontend
  run: sudo npm run test-lib-ci



#### NEW COVERAGE PART
- name: Coveralls
  uses: coverallsapp/github-action@master
  with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      path-to-lcov: './coverage/angular-auth-oidc-client/lcov.info'

- name: Coveralls Finished
  uses: coverallsapp/github-action@master
  with:
      github-token: ${{ secrets.github_token }}
      parallel-finished: true
#### END NEW COVERAGE PART


- name: Building Frontend
  run: sudo npm run build-lib-prod

```

And that is it!

Until then:

Stay tuned

Fabian

## Complete Example

See the action on [GitHub](https://github.com/damienbod/angular-auth-oidc-client/blob/main/.github/workflows/build.yml)
