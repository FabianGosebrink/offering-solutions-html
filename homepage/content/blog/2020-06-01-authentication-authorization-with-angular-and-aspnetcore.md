---
title: Authentication in Angular with Ngrx and ASP.NET Core
date: 2020-06-01
tags: ['angular', 'authentication', 'authorization', 'ngrx', 'aspnetcore']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to describe how you can add authentication and authorization in your Angular app using NgRx. we are using an ASP.NET Core backend to get our secret data from and a custom STS which we ask for the authentication and the id token as well as an access token.

This is a follow up post of [Authentication and Authorization with Angular and ASP.NET Core using OIDC and OAuth2](https://offering.solutions/blog/articles/2020/05/18/authentication-and-authorization-with-angular-and-asp.net-core-using-oidc-and-oauth2/) so if you want to get into the complete setup you might give this blog post a shot first :-) We will build this one basically up on the app which was mentioned in the references blog post.

In this pst we are gonna focus on the configuration and the Angular Application itself using NgRx.

> Disclaimer: In this blog we will use an Angular library which I wrote some parts of. But the principles are best practice and uses a standard which can be applied to any Angular application no matter what libraries you use.

The code can be found here [https://github.com/FabianGosebrink/angular-oauth2-oidc-sample/tree/master/client/angular-oidc-oauth2-ngrx](https://github.com/FabianGosebrink/angular-oauth2-oidc-sample/tree/master/client/angular-oidc-oauth2-ngrx)

## Adding the stores

We will add two stores to the sample angular application: one for holding the authentication state `auth` and one for providing and getting the data, called `data`.

We can add a folder to the root and call it `store` placing two folders in it called `auth` and `data` to have a nice separation of the different parts of our store.

Both folders get a barrel file `index.ts` to export what is needed. And the main `store` folder gets a barrel file, too to keep things nice and clean.

```
.
├── store
│   ├── auth
│   │   └── index.ts
│   ├── data
│   │   └── index.ts
│   └── index.ts
...
```

## Adding the auth actions

We will add a few actions here to get along with the authentication. Basically to keep it simple we will add actions for `checkAuth`, `login` and `logout` with the appropriate complete actions.

```ts
import { createAction, props } from '@ngrx/store';

export const checkAuth = createAction('[Auth] checkAuth');
export const checkAuthComplete = createAction(
  '[Auth] checkAuthComplete',
  props<{ isLoggedIn: boolean }>()
);
export const login = createAction('[Auth] login');
export const loginComplete = createAction(
  '[Auth] loginComplete',
  props<{ profile: any; isLoggedIn: boolean }>()
);
export const logout = createAction('[Auth] logout');
export const logoutComplete = createAction('[Auth] logoutComplete');
```

These are the actions we are gonna use. `loginComplete` is carrying the profile as well as if the user is logged in or not and if the `checkAuthComplete` kicks in we provide the value if the user is logged in or not.

The actions are placed in a file `auth.actions.ts` lying in the `store/auth` folder.

## Creating the auth state and reducer

Before we can define the reducer we have to define the state which holds the properties for authentication we need in our app. To keep it simple we start with a `isLoggedIn` property and a property holding the userProfile `profile`. The name of the feature is called `auth` and so is the property on the state object of our app. We will expose this as a variable here as well.

```ts
export const authFeatureName = 'auth';

export interface AuthState {
  profile: any;
  isLoggedIn: boolean;
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  profile: null,
};
```

Now we can build the reducer right underneath this code and place it in a file called `auth.reducer.ts` which is placed right beside the actions file in the `store/auth` folder.

We change our state when the login is complete (action `loginComplete`) and when the user wants to logout (action `logout`).

```ts
import { createReducer, on, Action } from '@ngrx/store';
import * as authActions from './auth.actions';

export const authFeatureName = 'auth';

export interface AuthState {
  profile: any;
  isLoggedIn: boolean;
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  profile: null,
};

const authReducerInternal = createReducer(
  initialAuthState,

  on(authActions.loginComplete, (state, { profile, isLoggedIn }) => {
    return {
      ...state,
      profile,
      isLoggedIn,
    };
  }),
  on(authActions.logout, (state, {}) => {
    return {
      ...state,
      profile: null,
      isLoggedIn: false,
    };
  })
);

export function authReducer(state: AuthState | undefined, action: Action) {
  return authReducerInternal(state, action);
}
```

In the end we are exporting the `authReducer` with a function.
