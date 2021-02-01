---
title: Using Auth0 in Angular with NgRx
date: 2021-02-03
tags: ['auth', 'angular', 'ngrx']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to show how we can add Auth0 authentication into an Angular app when using state management with NgRx. 

We are going to look how you can place authentication with Auth0 in an Angular app to provide a login and a logout and going a little beyond the incredibly good tutorial [The Complete Guide to Angular User Authentication with Auth0](https://auth0.com/blog/complete-guide-to-angular-user-authentication/). Also there is already a blog post I am happy to link to: [NgRx Authentication Tutorial](https://auth0.com/blog/ngrx-authentication-tutorial/). In this blog we are starting from the beginning and refer to the next syntax in NgRx and maybe an alternative way. I definitely recommend to give the resources a read, they really helped me a lot.

However, let us start.

Code can be found here [https://github.com/FabianGosebrink/auth0-angular-ngrx/](https://github.com/FabianGosebrink/auth0-angular-ngrx/)

## Adding the App in Auth0

Before we start we should add our new Angular app in the portal of [Auth0](https://auth0.com/).

There fore create an account and add your application in the dashboard of Auth0. Be sure to select `Single page WebApplication` as we are doing an Angular app next.

![Auth0 creating a singla epage app](https://cdn.offering.solutions/img/articles/2021-02-03/auth0-app.jpg)

Once this is created and we know that our Angular app will run on the domain `http(s)://localhost:4200` be sure to add these urls into the correct fields of Auth0. I am adding both, http and https, here. Just that when I switch to https I do not have to get that entries changed again.

![Auth0 adding all domains](https://cdn.offering.solutions/img/articles/2021-02-03/allowed-urls.jpg)

That was it for the Auth0 configuration. On the same page where we add the allowed urls on top there is a chapter for the `Basic Information`. We need the values `ClientId` and `domain` values from there to use it in our Angular application next. 

## Creating the Angular app and install the dependencies

We can create the Angular app like normal with

```
ng new auth0-angular-ngrx
```

After creating let us install the Angular helpers from Auth0 `@auth0/auth0-angular`.

```
npm install @auth0/auth0-angular
```

## Adding the Auth service abstraction

As Auth0 is a third party lib here I like to create an abstraction for this. Auth0 provides us an incredibly good API where to write a wrapper for is no big effort.

So we can add a file called `auth.service.ts` and place it in root (or where ever you want to, just for the sake of simplicity we get it into root now).

```
.
├── src
│   ├── app
│   │   ├── ...
│   │   ├── app.module.ts
│   │   └── auth.service.ts // <<< ADD THIS!
│   ├── ...
├── ...
```


```ts
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(public authService: AuthService) {}

  get isLoggedIn$(): Observable<boolean> {
    return this.authService.isAuthenticated$;
  }

  get token$(): Observable<string> {
    return this.authService.getAccessTokenSilently();
  }

  get user$(): Observable<any> {
    return this.authService.user$;
  }

  login(): void {
    this.authService.loginWithRedirect();
  }

  logout(): void {
    this.authService.logout({ returnTo: document.location.origin });
  }
}
```

Inside of our app (in the effects later) we will use the `AuthenticationService` to communicate with Auth0.

## Adding NgRx

Let us add the NgRx dependencies `@ngrx/store` and `@ngrx/effects` first.

```
ng add @ngrx/store@latest
```

```
ng add @ngrx/effects@latest
```

After having done this we can create a folder in the root called `store` where we place all the NgRx related files in. 

```
.
├── e2e
│   ├── ...
├── src
│   ├── app
│   │   ├── store // <<< ADD THIS!
│   │   │   └── ... 
│   │   ├── ...
│   ├── ...
├── ...
...
```

## Adding the Actions

For the actions we will create a file called `auth.actions.ts` and add the first action to trigger the login called `login`, a corresponding action for completeness called `loginComplete`, same for `logout` and `logoutComplete`. When Auth0 redirects back to our application we need a trigger to tell the state that is has to be changed, where an action `checkAuth` is introduced for.

```ts
import { createAction, props } from '@ngrx/store';

export const checkAuth = createAction('[Auth] checkAuth');
export const login = createAction('[Auth] login');
export const loginComplete = createAction(
  '[Auth] loginComplete',
  props<{ profile: any; isLoggedIn: boolean }>()
);

export const logout = createAction('[Auth] logout');
export const logoutComplete = createAction('[Auth] logoutComplete');
```

```
.
├── src
│   ├── app
│   │   ├── store
│   │       └── auth.actions.ts
│   └── ...
├── ...
```

## Adding the reducer and the state

The state of our application will be an object with a property called `auth` and the values `userProfile` and `isLoggedIn`.

```
{
    auth: {
        isLoggedIn,
        userProfile
    }
}
```

To build that into code we can define an interface in the reducer file we have to create `auth.reducer.ts` in the `store` folder.

```ts
import { Action, createReducer, on } from '@ngrx/store';

export const featureName = 'auth';

export interface AuthState {
  userProfile: any;
  isLoggedIn: boolean;
}

export const initialState: AuthState = {
  userProfile: null,
  isLoggedIn: false,
};

const authReducerInternal = createReducer(
  initialState,
  /* */
);

export function authReducer(
  state: AuthState | undefined,
  action: Action
): AuthState {
  return authReducerInternal(state, action);
}

```

The `AuthState` is the representation of the value the `auth` property has in our state. We will define the complete state object we described later. This reducer only takes care about anything that goes on *inside* of the `auth` property. 

We are setting the `initialState` and create the reducer getting passed the `initialState`. What we have to do is adding the state manipulation when a specific action comes in.

If the login is complete with the action `loginComplete`, we want to add the profile we received and the `isLoggedIn` is set, too. When the action `logoutComplete` is being thrown, we reset `userProfile` to `null` and `isLoggedIn` to `false`.

```ts
import { Action, createReducer, on } from '@ngrx/store';
import * as authActions from './auth.actions';

// all states and interfaces

const authReducerInternal = createReducer(
  initialState,

  on(authActions.loginComplete, (state, { profile, isLoggedIn }) => {
    return {
      ...state,
      userProfile: profile,
      isLoggedIn,
    };
  }),

  on(authActions.logoutComplete, (state, {}) => {
    return {
      ...state,
      userProfile: null,
      isLoggedIn: false,
    };
  })
);

// export functions

```

