---
title: Architecting Angular Projects with Nx
date: 2021-01-05
tags: ['nx', 'angular']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to write down one possible way to start and architecture Angular projects using the [nx](https://nx.dev). I know that there are a lot of guides and even books out there but just to have it written down in one place for me with all the current commands I am using building bigger Angular applications I am creating this blog post.

What we are going to look at is

- How to start a project
- How to separate your application
- What the commands for the separation are

And during this read we are going to learn how nx is helping us getting a nice and readable structure into our project which is extendable and easy to follow along with.

Before we start you can find parts of those information on [nx.dev](https://nx.dev/) and - although it is a little older - in this book here [Enterprise Monorepo Angular Patterns, by Nitin Vericherla & Victor Savkin.](https://go.nrwl.io/angular-enterprise-monorepo-patterns-new-book). I really recommend to read the book and take the knowledge before reading this article here. Much of the content in the article is based on what is written in the book. Trust me, it is incredibly good and redefines how Angular applications are being made. Read it now. Thank me later.

## How to start an Angular project with nx

To get an nx workspace running the nx team provided us a very neat way to start using the

```
npx create-nx-workspace@latest
```

command. We can choose the Angular template which will add one app automatically for us right from the start.

After answering a few questions

PICTURE1

We are facing an empty workspace like this.

```
.
├── .vscode
│   └── extensions.json
├── apps
│   ├── my-app
│   │   ├── ...
│   ├── my-app-e2e
│   │   ├── ...
│   └── .gitkeep
├── libs
│   └── .gitkeep
├── node_modules
│   └── ...
├── tools
│   ├── generators
│   │   └── .gitkeep
│   └── tsconfig.tools.json
├── .editorconfig
├── .eslintrc.json
├── .gitignore
├── .prettierignore
├── .prettierrc
├── angular.json
├── decorate-angular-cli.js
├── jest.config.js
├── jest.preset.js
├── nx.json
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.base.json
```

which has one Angular application `my-app` in it.

The name of the project is either to be found in the `angular.json` as a property on the json

```
{
  "version": 1,
  "projects": {
    "my-app": { }, // <-- project name
    "my-app-e2e": { }, // <-- project name
  },
  // ...
  "defaultProject": "my-app"
}

```

Or it can be found in the `nx.json` file

```
{
  // ...
  "projects": {
    "my-app": { }, // <-- project name
    "my-app-e2e": { } // <-- project name
  }
}

```

Both files are getting updated automatically if you add a new project with an ng or nx command.

## Adding Applications

In the future you can add new Angular applications with

```
nx generate @nrwl/angular:app my-second-app
```

etc.

After answering a few questions again the app is being added to the `apps` folder for you.

You can configure all the commands to use your specific tools for testing (`karma` `jasmine` or `jest`) or end to end testing (`cypress` or `protractor`). We are running with the latest tools here.

## Rethinking Libraries
