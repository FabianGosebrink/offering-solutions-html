---
title: Angular Security Lib angular-auth-oidc-client Released in V12
date: 2021-07-09
tags: ['angular', 'security']
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

With this blog post I want to share the news that we released the Angular Security Lib [Angular Auth OIDC Client](https://github.com/damienbod/angular-auth-oidc-client) in V12.

{{< tweet 1411759432007049217 >}}

## What is the lib about

The library helps you to implement a complete security feature within your angular application by encapsulating all important aspects when it comes to handle the tokens and provide them to your app. Further the library provides functionality to handle your tokens and your logins. The library is not limited to one specific security token service but supports all modern OIDC providers such as [Identity Server](https://duendesoftware.com/), [Auth0](https://auth0.com/), [Keycloak](https://www.keycloak.org/), [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/), etc. It also cares about the silent renew of the token either with an iFrame (nay) or with refresh tokens in case your Token Server supports this (yay).

You can configure the lib to your needs and if you change the provider you change the config. Thats it.

## Links

- [npm](https://www.npmjs.com/package/angular-auth-oidc-client)
- [GitHub](https://github.com/damienbod/angular-auth-oidc-client)
- [Changelog](https://github.com/damienbod/angular-auth-oidc-client/blob/main/CHANGELOG.md)

## A few personal words about this

In the last half a year nearly all my free time went into this library. Weekends, mornings and afternoons. Maintaining this library is my biggest way to contribute to OSS. I have written every line of this lib always discussing and reflecting with [Damien Bod](https://github.com/damienbod) who is one of the greatest security experts out there. Damien's knowledge in this topic seems endless and without Damien I could have never pushed this library as I did in the past. I learned tons about security but still feel that I know nothing at all 😀

What I have learned and am still learning is how you manage to do Open Source when it is more than a "fun project". Take care of the release versions, think about what changes mean to your users, how to write documentation, how to write samples, how to do better reviews, PRs etc. All of that improved. Also discussing ideas when you do a public API and not a user interface or software in a "normal" customer project. For Example: If you want to fix a typo in a property which is public - this is a breaking change 😀 In a closed source project for a customer you would fix it and move along. This different view, the improvement of the technique using issues, PRs, collaborating with the community over GitHub was impressive and helped me so much in my everyday software routine. I wouldn't miss it for the world.

## What is new in V12

We improved a lot in V12 as you can also see on the [Features for V12](https://github.com/damienbod/angular-auth-oidc-client/issues/1050). I only want to mention the biggest features here.

### New Configuration

As libraries normally get configured with the `forRoot(...)` method until V12 we have not supported this configuration method. As the library supports having a static config you can pass into the `forRoot(...)` method, getting your configuration from an http source is supported as well. You can not pass a config in the `forRoot(...)` method if you do not have it at the app start, so we moved the [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) into the library and wrapped it in loaders. So with the `StsConfigHttpLoader` passing a promise you can load your configuration from an HTTP source and map it and with the classic `forRoot(...)` method you can pass any static config you like or multiple ones.

```ts
import { NgModule } from '@angular/core';
import { AuthModule } from 'angular-auth-oidc-client';
// ...

@NgModule({
  // ...
  imports: [
    // ...
    AuthModule.forRoot({
      config: {
        /* your config here */
      },
    }),
  ],
  // ...
})
export class AppModule {}
```

or

```ts
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {
  AuthModule,
  StsConfigHttpLoader,
  StsConfigLoader,
} from 'angular-auth-oidc-client';
import { map } from 'rxjs/operators';

export const httpLoaderFactory = (httpClient: HttpClient) => {
  const config$ = httpClient
    .get<any>(`https://...`)
    .pipe(
      map((customConfig: any) => {
        return {
          /* your config mapping here */
        };
      })
    )
    .toPromise();

  return new StsConfigHttpLoader(config$);
};

@NgModule({
  imports: [
    AuthModule.forRoot({
      loader: {
        provide: StsConfigLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [AuthModule],
})
export class AuthConfigModule {}
```

[Bootstrapping the lib](https://nice-hill-002425310.azurestaticapps.net/docs/migrations/v11-to-v12#bootstrapping-the-lib)

### Unified return types

Something that really bothered me all the time was that we not had unified return types. You were getting back different result whether you logged in with a popup or you logged in automatically. If you were checking the auth you got back if you are authenticated but not the rest of the data which you might need, like the access token or the current users information the provider sent you. You always had to do multiple calls to get all that important information. So I improved this.

No matter if you are checking the auth with `checkAuth(...)`, `checkAuthIncludingServer(...)` or refresh the session with `forceRefreshSession(...)`, you always get back the most important information in a unified interface

```ts
export interface LoginResponse {
  isAuthenticated: boolean;
  userData: any;
  accessToken: string;
  idToken: string;
  configId: string;
  errorMessage?: string;
}
```

With this information you have everything you need with one go.

### Improved the documentation

We knew that we would have breaking changes in this version (hence the major version increase) and we wanted to make the migration from V11 to V12 to be documented as good as we could. Further - although we do the best we can - the complete setup of security on the client side in an Single Page Applications is a complex topic. Every situation is different, every use case seems to be different and every configuration is as well. With the lib we try to cover as much as we can and try to apply a unified interface for this. To help people getting along with the lib and finding help for themselves we moved to documentation to [Docosaurus](https://docusaurus.io/) and fixed all the markdown files that they can be displayed in a way you could read it. We had a big table for the configuration before which we removed and made different chapters out of it for the sake of readability etc.

You can find the new documentation hosted on an Azure Static App here: [Documentation](https://nice-hill-002425310.azurestaticapps.net/docs/intro). It also has a dark mode 😉

We added a [migration](https://nice-hill-002425310.azurestaticapps.net/docs/migrations/v11-to-v12) chapter to make the migration easier. Hoping we mentioned every change. We also tried to add [Samples](https://nice-hill-002425310.azurestaticapps.net/docs/samples/samples) for every possible use case.

### Multiple IDPs

The most important feature for V12 was the support for multiple Identity Providers. So if you have one application and need to handle two or more access tokens because you have to access multiple APIs with different access tokens you can do this now. This was a change which was the biggest and where the most effort went in. We had to rethink every method but as we already did breaking changes and planned V12, we included this one.

So you can pass an array of configs into the `forRoot(...)` method.

```ts
@NgModule({
  imports: [
    AuthModule.forRoot({
      config: [
        {
          // config1...
        },
        {
          // config2...
        },
        {
          // config3...
        },
        //...
      ],
    }),
  ],
  exports: [AuthModule],
})
export class AuthConfigModule {}
```

Each config gets a `configId` which you can set or wil be set by the lib. This `configId` can be used to get the access tokens for example.

```ts
const token = this.oidcSecurityService.getAccessToken('configId');
```

### What else?

We also improved the logging messages in the console to make it easier to see _which_ config is logging some information and we also unified the return type of the `isAuthenticated$` and `userData$` streams to not being confused when you run with single or multiple configs.

Also we realized that the auto login is a feature which is heavily used. So we improved the samples there.

You can get all changes from the changelog on [GitHub](https://github.com/damienbod/angular-auth-oidc-client/blob/main/CHANGELOG.md).

## What to expect in future versions?

I think we will first try to see how this lib evolves and try to make it as stable as it can be. We have a good state now imho but with every day we see that the lib is used in another use case or some different way of usage is needed. So stability is one thing we would like to focus at. This is one of the most important things.

We also want to improve the thought of "How to implement a feature" by including the thought of "How do I as a user want to use it in the end" which drives your API design a lot. When designing features I asked myself this question a lot of times. Because I wanted to have it as uncomplicated to use as possible. We want to take away complexity and try to improve this more and more in the future.

We want to improve the documentation as well. If there is an issue which could be solved with better documentation we have to do a task for improving this or improve the documentation right away.

The samples could need a brush. This is not on top of my list but it is on my list to put the samples in a better shape. Visually and code-based.

Further we are currently at 94% coverage with testing. This is a good number but we would like to improve it more and more. Without starting a discussion about how this number is used we are really taking care that all code paths are being tested, and this number or the coverage with the tools helps us a lot to see what is untested.

Last but not least maybe we should think about a logo for the lib. Maybe I will get to this in the future, but seeing a visual logo for this lib would be really nice.

I will leave you with that thoughts and hope this helped.

Thanks

Fabian
