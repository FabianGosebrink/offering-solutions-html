---
title: Using Auth0 in Angular with NgRx
date: 2021-02-01
tags: ['auth', 'angular', 'ngrx']
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to show how we can add Auth0 authentication into an Angular app when using state management with NgRx.

We are going to look how you can place authentication with Auth0 in an Angular app to provide a login and a logout and going a little beyond the incredibly good tutorial [The Complete Guide to Angular User Authentication with Auth0](https://auth0.com/blog/complete-guide-to-angular-user-authentication/). Also there is already a blog post I am happy to link to: [NgRx Authentication Tutorial](https://auth0.com/blog/ngrx-authentication-tutorial/). In this blog we are starting from the beginning and refer to the next syntax in NgRx and maybe an alternative way. I recommend giving the resources a read, they really helped me a lot.

However, let us start.

![Login Logout in the sample app](https://cdn.offering.solutions/img/articles/2021-02-03/login-logout.gif#responsive)

Code can be found here [https://github.com/FabianGosebrink/auth0-angular-ngrx/](https://github.com/FabianGosebrink/auth0-angular-ngrx/)

## TOC

- [Adding the App in Auth0](#adding-the-app-in-auth0)
- [Creating the Angular app and install the dependencies](#creating-the-angular-app-and-install-the-dependencies)
- [Adding the Auth service abstraction](#adding-the-auth-service-abstraction)
- [Including AuthModule](#including-authmodule)
- [Adding NgRx](#adding-ngrx)
- [Adding the Actions](#adding-the-actions)
- [Adding the reducer and the state](#adding-the-reducer-and-the-state)
- [Adding the effects](#adding-the-effects)
- [Providing the state to the module](#providing-the-state-to-the-module)
- [Adding the selectors](#adding-the-selectors)
- [Building the Component](#building-the-component)

## Adding the App in Auth0

Before we start we should add our new Angular app in the portal of [Auth0](https://auth0.com/).

First create an account and add your application in the dashboard of Auth0. Be sure to select `Single page Web Application` as we are doing an Angular app next.

![Auth0 creating a single page app](https://cdn.offering.solutions/img/articles/2021-02-03/auth0-app.jpg#responsive)

Once this is created and we know that our Angular app will run on the domain `http(s)://localhost:4200` locally be sure to add these urls into the correct fields of Auth0. I am adding both, http and https, here. in case that that I switch to https I do not have to get that entries changed again.

![Auth0 adding all domains](https://cdn.offering.solutions/img/articles/2021-02-03/allowed-urls.jpg#responsive)

On the same page where we add the allowed urls on top there is a chapter for the `Basic Information`. We need the values `ClientId` and `Domain` from there and place it in our Angular application next.

## Creating the Angular app and install the dependencies

We can create the Angular app with

```
ng new auth0-angular-ngrx
```

After creating let us install the Angular helpers from Auth0 `@auth0/auth0-angular`.

```
npm install @auth0/auth0-angular
```

## Adding the Auth service abstraction

As Auth0 is a third party lib here I like to create an abstraction for this. Auth0 provides us an incredibly good API where to write a wrapper for is no big effort.

So we can add a file called `auth.service.ts` and place it in root (or where ever you want to, for the sake of simplicity we get it into root now).

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

  getToken$(): Observable<string> {
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

In the effects later we will use the `AuthenticationService` to communicate with Auth0.

## Including AuthModule

We must include the `AuthModule` from `@auth0/auth0-angular` and pass in the information we have like our `clientId` and our `domain`. You can find both of it in your dashboard on Auth0 in the `Basic Information` area right on top of the app.

```
import { NgModule } from '@angular/core';
import { AuthModule } from '@auth0/auth0-angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AuthModule.forRoot({
      domain: '<your domain>',
      clientId: '<your client id>',
      redirectUri: window.location.origin,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

```

## Adding NgRx

To add NgRx we must add the dependencies `@ngrx/store` and `@ngrx/effects` first.

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

For the actions we will create a file called `auth.actions.ts` and add the first action to trigger the login called `login`, a corresponding action for completeness called `loginComplete`, same for `logout` and `logoutComplete`. When Auth0 redirects back to our application we need a trigger to tell the state that is must be changed, where an action `checkAuth` is introduced for.

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

To build that into code we can define an interface in the reducer file we have to create `auth.reducer.ts` in the `store` folder and add our state as an interface.

```
.
├── src
│   ├── app
│   │   ├── store
│   │   │   ├── auth.actions.ts
│   │   │   ├── auth.reducer.ts
│   └── ...
├── ...
```

```ts
import { Action, createReducer, on } from '@ngrx/store';

export interface AuthState {
  userProfile: any;
  isLoggedIn: boolean;
}

export const initialState: AuthState = {
  userProfile: null,
  isLoggedIn: false,
};

const authReducerInternal = createReducer(
  initialState
  /* */
);

export function authReducer(
  state: AuthState | undefined,
  action: Action
): AuthState {
  return authReducerInternal(state, action);
}
```

The `AuthState` is the representation of the value the `auth` property has in our state. This reducer only takes care about anything that goes on _inside_ of the `auth` property.

We are setting the `initialState` and create the reducer getting passed the `initialState`. What we must do is adding the state manipulation when a specific action comes in.

If the login is completed with the action `loginComplete` we want to add the profile we received and the `isLoggedIn` is set, too. When the action `logoutComplete` is being thrown, we reset `userProfile` to `null` and `isLoggedIn` to `false`.

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

## Adding the effects

We are using effects for the asynchronous work to do when we are trying to manipulate the state after async actions like an http request have finished.

There are three actions to listen to: the `login`, the `logout` and the `checkAuth` action which updates the state after redirecting.

```
.
├── src
│   ├── app
│   │   ├── store
│   │   │   ├── auth.actions.ts
│   │   │   ├── auth.effects.ts
│   │   │   ├── auth.reducer.ts
│   └── ...
├── ...
```

```ts
@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthenticationService
  ) {}

  // effects go here
}
```

The `login` effect will only call the `authService.login()` action and won't dispatch any other action then.

```ts
login$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(fromAuthActions.login),
      tap(() => this.authService.login())
    ),
  { dispatch: false }
);
```

We will throw the `checkAuth` action when we are getting redirected from Auth0 to our app again. The service from Auth0 got updated then with the latest information which we must collect and add to our state: `isLoggedIn$` and `user$` are the properties we want to collect and update the state with.
If `isLoggedIn` resolves to `true` - which should be the case after the redirect - we can return a `loginComplete` action. Otherwise, we reset the state with a `logoutComplete` action.

```ts
login$ = createEffect(/* ... */);

checkAuth$ = createEffect(() =>
  this.actions$.pipe(
    // If an action with the type 'checkAuth' occurs in the actions$ stream...
    ofType(fromAuthActions.checkAuth),
    // return an observable including the latest info from 'isLoggedIn' and 'userProfile'
    switchMap(() =>
      combineLatest([this.authService.isLoggedIn$, this.authService.user$])
    ),
    // Take it out and return the appropriate action based on if logged in or not
    switchMap(([isLoggedIn, profile]) => {
      if (isLoggedIn) {
        return of(fromAuthActions.loginComplete({ profile, isLoggedIn }));
      }

      return of(fromAuthActions.logoutComplete());
    })
  )
);
```

The `logout` action calls the `authService.logout()` method and returns the `logoutComplete` again.

```ts
logout$ = createEffect(() =>
  this.actions$.pipe(
    ofType(fromAuthActions.logout),
    tap(() => this.authService.logout()),
    switchMap(() => of(fromAuthActions.logoutComplete()))
  )
);
```

## Providing the state to the module

Until here we have not told our application module about our state yet. Like said already, we want our state to be.

```
{
    auth: {
        isLoggedIn,
        userProfile
    }
}
```

Which is exactly what we provide our `StoreModule.forRoot()` in the `forRoot()` method:

```ts
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AuthEffects } from './store/auth.effects';
import { authReducer } from './store/auth.reducer';

@NgModule({
  imports: [
    StoreModule.forRoot({ auth: authReducer }), // State object here like described
    EffectsModule.forRoot([AuthEffects]),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

In addition to that we wire up the effects by passing them into the `forRoot()` method of the `EffectsModule` from `@ngrx/effects`.

## Adding the selectors

To make the consumption in the component clear we can build selectors which select exactly what we need from the state and provide it.

```
.
├── src
│   ├── app
│   │   ├── store
│   │   │   ├── auth.actions.ts
│   │   │   ├── auth.effects.ts
│   │   │   ├── auth.reducer.ts
│   │   │   └── auth.selectors.ts
│   └── ...
├── ...
```

We need to create a selector for the `isloggedIn` and for the `userProfile` property as well as getting the first step: the `auth` property from the state object we described.

```ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

// get the `auth` property from the state object
export const getAuthFeatureState = createFeatureSelector<AuthState>('auth');

// get the userProfile from the auth state
export const selectCurrentUserProfile = createSelector(
  getAuthFeatureState,
  (state: AuthState) => state.userProfile
);

// get the isLoggedIn from the auth state
export const selectIsLoggedIn = createSelector(
  getAuthFeatureState,
  (state: AuthState) => state.isLoggedIn
);
```

## Building the Component

The component consumes the selectors to consume the values in the state and dispatches the action `checkAuth()` when it is loaded to update the information in the state

```ts
import { select, Store } from '@ngrx/store';
import { checkAuth, login, logout } from './store/auth.actions';
import {
  selectCurrentUserProfile,
  selectIsLoggedIn,
} from './store/auth.selectors';

@Component({
  /* */
})
export class AppComponent implements OnInit {
  title = 'auth0-angular-ngrx';

  loggedIn$: Observable<boolean>;
  profile$: Observable<any>;

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.loggedIn$ = this.store.pipe(select(selectIsLoggedIn));
    this.profile$ = this.store.pipe(select(selectCurrentUserProfile));

    this.store.dispatch(checkAuth());
  }

  logout() {
    this.store.dispatch(logout());
  }

  login() {
    this.store.dispatch(login());
  }
}
```

It also provides two methods to `login` and `logout`. As we have done all the work before the component looks very clean.

In the template we can now use the information as needed

```html
<div>
  <div *ngIf="loggedIn$ | async as loggedIn; else loginContent">
    <p>
      <button (click)="logout()">Logout</button>
      is logged in {{ loggedIn }}
    </p>
    <div *ngIf="profile$ | async as profile">
      <img [src]="profile.picture" />
      <pre>{{ profile | json }}</pre>
    </div>
  </div>

  <ng-template #loginContent
    ><button (click)="login()">Login</button></ng-template
  >
</div>
```

And that is it.

The result can be seen on GitHub [https://github.com/FabianGosebrink/auth0-angular-ngrx/](https://github.com/FabianGosebrink/auth0-angular-ngrx/)
