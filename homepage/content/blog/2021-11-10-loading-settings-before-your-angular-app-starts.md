---
title: Loading configuration before your angular App Starts
date: 2021-11-10
tags: ["angular"]
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blogpost I want to describe two different way how to load your settings before your Angular application starts. Although there has been articles already about this I want to point out two different ways of solving the issue as I see this as an reappearing issue in the Angular world.

## The Problem

The problem comes with the apporach of building your application once and deploying it everywhere, which means to all stages you are working with. Let this be DEV, STAGE and PROD for this case. What we NOT want to do is using the `environment.xxx.ts` files for building our application for each stage explicitly. That would mean that we have different builds on each environment and with this the issue that we might see errors on the stages which we have not seen on the stages before. This is why it is so important to build one artifact and deploy it everywhere.

But the different stages need different settings. On DEV maybe I want to have a different loglevel than on STAGE or PROD. So how to achieve this when implementing the Angular app only once?

We have to find a mechanism which loads the settings and bootstraps then application afterwards.

## Using the `APP_INITIALIZER`

The [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) from Angular provides the ability to load things before your app starts. Which might fill your needs in this case. Since the [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) also supports Observables it got even more handy and easier to use.

```ts
function initializeAppFactory(httpClient: HttpClient): () => Observable<any> {
  return () => httpClient.get("https://someUrl.com/api/settings").pipe(...);
}

@NgModule({
  imports: [BrowserModule, HttpClientModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [HttpClient],
      multi: true,
    },
  ],
})
export class AppModule {}
```

The problem with this approach is that when you have a module in the `imports` array which has a `forRoot(...)` method and you want to pass some data into it which is loaded in the [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) you have a chicken-egg-problem: The `AppModule` needs to gather all modules in the `imports` array, and therefore also execute the `forRoot(...)`s, if any, but the info to pass into the `forRoot(...)`s can only be gatherred when the [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) has fired. But to fire this, the `forRoot(...)` has to have the info first, etc.

## Using the fetch api

Let's get a step back and see what we want to do. So before the complete app starts we want to ask for our data to have them present and the time angular kicks in and bootstraps. This is
