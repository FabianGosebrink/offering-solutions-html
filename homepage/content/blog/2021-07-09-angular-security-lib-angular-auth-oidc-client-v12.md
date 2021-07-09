---
title: Angular Security Lib angular-auth-oidc-client Released in V12
date: 2021-07-09
tags: ['angular', 'security']
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

With this blog post I want to share the news that we just released the Angular Security Lib 'angular-auth-oidc-client' in V12.

{{< tweet 1411759432007049217 >}}

## What is the lib about

The library helps you to implement a complete security feature within your angular application by encapsulating all important aspects when it comes to handle the tokens and provide them to your app. Further the app provides functionality to manage your tokens and your logins. The library is not limited to one specific security token service but supports all modern OIDC providers such as [Identity Server](https://duendesoftware.com/), [Auth0](https://auth0.com/), [Keycloak](https://www.keycloak.org/), [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/), etc. It also cares about the silent renew of the token either with an iFrame (nay) or with refresh tokens in case your TOken Server supports this (yay).

You can configure the lib to your needs and if you change the provider you change the config. Thats it.

## Links

- [npm](https://www.npmjs.com/package/angular-auth-oidc-client)
- [GitHub](https://github.com/damienbod/angular-auth-oidc-client)
- [Changelog](https://github.com/damienbod/angular-auth-oidc-client/blob/main/CHANGELOG.md)

## What is new in V12

We improved a lot in V12 as you can also see on the [Features for V12](https://github.com/damienbod/angular-auth-oidc-client/issues/1050). I just want to mention the biggest features here

### New Configuration

As libraries normally get configured with the `forRoot(...)` method until V12 we have not supported this configuration method. As the library supports having a static config you can just pass into the `forRoot(...)` method, getting your configuration from an http source is supported as well. You can not pass a config in the `forRoot(...)` method if you do not have it at the app start, so we moved the [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) into the library and wrapped it in loaders. So with the `StsConfigHttpLoader` passing a promise you can load your configuration from an HTTP source and map it and with the classic `forRoot(...)` method you can pass any static config you like or multiple ones.

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

We knew that we would have breaking changes in this version (hence the major version increase) and we wanted to make the migration from V11 to V12 to be documented as good as we could. Further - although we do the best we can - the complete setup of security on the client side in an SPA is a complex topic.

### Multiple IDPs

Supporting multiple IDPs

### What to expect in future version?

Stability
Taking away complxity
Better documentation If you ahve a question, we forgot to document it
Better samples
