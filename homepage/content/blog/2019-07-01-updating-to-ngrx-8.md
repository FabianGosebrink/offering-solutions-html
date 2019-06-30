---
title: Updating to ngrx 8
date: 2019-06-07
tags: ['cloudflare', 'azure', 'hugo']
draft: true
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blogpost I want to describe how I updated an Angular Project using ngrx to the latest version ngrx 8.

Github: [angular-ngrx-todo](https://github.com/FabianGosebrink/angular-ngrx-todo)

I started updating the project with [update.angular.io](update.angular.io) and came to update the store with

```
ng update @ngrx/store
```

This will lift your version of `@ngrx/store` and `@ngrx/effects` to version 8

Before:

```
"@ngrx/effects": "^7.3.0",	   
"@ngrx/store": "^7.3.0",
```

After:

```
"@ngrx/effects": "^8.0.1",
"@ngrx/store": "^8.0.1",
```