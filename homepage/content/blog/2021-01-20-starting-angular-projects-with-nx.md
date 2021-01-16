---
title: Starting Angular Projects with Nx
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

before we start you can find parts of those information on [nx.dev](https://nx.dev/) and - although it is a little older - in this book here [Enterprise Monorepo Angular Patterns, by Nitin Vericherla & Victor Savkin.](https://go.nrwl.io/angular-enterprise-monorepo-patterns-new-book)

## How to start an Angular project with nx

To get an nx workspace running the nx team provided us a very neat way to start using the `npx create-nx-workspace` command.

After answering a few questions

PICTURE1

PICTURE2

We are facing an empty workspace like this.

```
.
├── .vscode
│   └── extensions.json
├── apps
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
├── .gitignore
├── .prettierignore
├── .prettierrc
├── nx.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.base.json
└── workspace.json
```
