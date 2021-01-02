---
title: Moving from TravisCI to GitHub Actions
date: 2021-01-03
tags: ['hugo', 'github']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to write about how you can move from TravisCI to GitHub Actions. Together with [DamienBod](https://twitter.com/damien_bod?lang=en) I am maintaining an Angular library for OIDC and OAuth2 [angular-auth-oidc-client](https://github.com/damienbod/angular-auth-oidc-client). In this blog post I want to describe why and how I migrated from TravisCI to GitHub Actions.

## TL;DR

[Complete Example](#complete-example)

## Why moving?

In the beginning of November 2020 TravisCI announced that they will change their pricing plan which made me read their new announcement. I found out that Travis is providing a free amount of minutes to spend on open source projects because TravisCI found out their systems suffer from abuse.

```
When your credit allotment runs out - we’d love for you to consider which of our plans will meet your needs.
 - We will be offering an allotment of OSS minutes that will be reviewed and allocated on a case by case basis. Should you want to apply for these credits please open a request with Travis CI support stating that you’d like to be considered for the OSS allotment. Please include:
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
5. Creating a new empty angular project with the angular cli
6. Installing the built lib in it

And as steps which were not 100% needed because the new angular project was not used by the app, I added the two following steps anyway:

7. Testing the new angular project with the lib
8. Make a production build of the new angular project

In the end we wanted to check our code coverage with coveralls and display that in a badge at our [Readme.md](https://github.com/damienbod/angular-auth-oidc-client/blob/main/README.md)

Existing TravisCI \*.yaml file

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

## Complete Example

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

jobs:
    build_job:
        if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
        runs-on: ubuntu-latest
        name: Build Job
        steps:
            - uses: actions/checkout@v2
              with:
                  submodules: true

            - name: Setup Node.js 12
              uses: actions/setup-node@v1
              with:
                  node-version: 12

            - name: Installing Dependencies
              run: sudo npm install

            - name: Linting Frontend
              run: sudo npm run lint-lib

            - name: Testing Frontend
              run: sudo npm run test-lib-ci

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

            - name: Building Frontend
              run: sudo npm run build-lib-prod

            - name: Create new Angular Project and install lib in it, test it and build it
              run: |
                  cd ..
                  echo '=== Current Directory ==='
                  ls
                  sudo npm install -g @angular/cli
                  echo 'Creating new angular project'
                  sudo ng new testProject --skip-git
                  cd testProject
                  echo '=== Current Directory ==='
                  ls
                  sudo npm install ../angular-auth-oidc-client/dist/angular-auth-oidc-client
                  npm test -- --watch=false --browsers=ChromeHeadless
                  sudo npm run build -- --prod

```
