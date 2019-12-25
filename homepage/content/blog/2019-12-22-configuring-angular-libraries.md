---
title: How to configure Angular libraries
date: 2019-12-21
tags: ['angular', 'libraries', 'configuration']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this article I want to explain two possible ways to configure Angular libraries.

With libraries we have a convenient way to seperate logic which is used multiple times across more than one application or libraries can define our architecture especially when working with a monorepo.

Libraries build a standalone codebase where complete modules with all its services, components etc. can be stored away and can be included into your Angular app.

This works pretty fine but if you want to make the libraries more flexible you can pass a configuration into that library to make the library work as you need it based on values the consuming application provides.

In the following blogpost I want to share two ways of configuring Angular Libraries and how that work in code.

## Preparation

First of all we can create a new Angular project with

```
ng new configuring-libraries --createApplication=false
```

The `--createApplication=false` creates only the workspace files but does not add an application on root level. This gives usmore flexibility and overwiew when working with libs and apps inside this workspace.

Now let us add an application with `ng generate app consumerApp` and a library with `ng generate library lib-to-configure`.