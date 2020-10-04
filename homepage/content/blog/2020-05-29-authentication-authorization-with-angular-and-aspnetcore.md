---
title: Authentication in Angular with NgRx and ASP.NET Core
date: 2020-05-29
tags: ['angular', 'authentication', 'authorization', 'ngrx', 'aspnetcore']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to describe how you can add authentication and authorization in your Angular app using NgRx. We are using an ASP.NET Core backend to get our secure data from and a custom STS which we use for the authentication and the id token as well as an access token.

This is a follow up post of [Authentication and Authorization with Angular and ASP.NET Core using OIDC and OAuth2](https://offering.solutions/blog/articles/2020/05/18/authentication-and-authorization-with-angular-and-asp.net-core-using-oidc-and-oauth2/) so if you want to get into the complete setup you might give this blog post a shot first :-) We will build this one basically up on the app which was mentioned in the references blog post.

In this post we are gonna focus on the configuration and the Angular Application itself using NgRx.

> Disclaimer: In this blog we will use an Angular library which I wrote some parts of. But the principles are best practice and uses a standard which can be applied to any Angular application no matter what libraries you use.

The code can be found here [https://github.com/FabianGosebrink/angular-oauth2-oidc-sample/tree/master/client/angular-oidc-oauth2-ngrx](https://github.com/FabianGosebrink/angular-oauth2-oidc-sample/tree/master/client/angular-oidc-oauth2-ngrx)

## TOC

- [Adding the stores](#adding-the-stores)
- [Adding the auth actions](#adding-the-auth-actions)
- [Creating the auth state and reducer](#creating-the-auth-state-and-reducer)
- [Adding the auth service](#adding-the-auth-service)
- [Creating the auth effects](#creating-the-auth-effects)
- [Adding the auth selectors](#adding-the-auth-selectors)
- [Creating the store for data](#creating-the-store-for-data)
- [Building an app state](#building-an-app-state)
- [Registering the AppState on the AppModule](#registering-the-app-state-on-the-app-module)
- [Using the store in the application](#using-the-store-in-the-application)
  - [AppComponent](#app-component)
  - [ProtectedComponent](#protected-component)
  - [Adding the AuthGuard](#adding-the-auth-guard)
  - [Adding the Interceptor](#adding-the-interceptor)

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

Before we now head to the corresponding effects we have to add the service with methods the effects can call.

## Adding the auth service

Install the lib `angular-auth-oidc-client` with

```cmd
npm install angular-auth-oidc-client
```

Having done this we can create an `auth.service.ts` file in a `services` folder and abstract the usage of the library.

```ts
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private oidcSecurityService: OidcSecurityService) {}

  get isLoggedIn() {
    return this.oidcSecurityService.isAuthenticated$;
  }

  get token() {
    return this.oidcSecurityService.getToken();
  }

  get userData() {
    return this.oidcSecurityService.userData$;
  }

  checkAuth() {
    return this.oidcSecurityService.checkAuth();
  }

  doLogin() {
    return of(this.oidcSecurityService.authorize());
  }

  signOut() {
    this.oidcSecurityService.logoffAndRevokeTokens();
  }
}
```

Your folder should now look like this

```
.

├── services
│   ├── auth.service.ts
├── store
│   ├── auth
│   │   ├── auth.actions.ts
│   │   ├── auth.reducer.ts
│   │   └── index.ts
│   ├── data
│   │   └── index.ts
│   └── index.ts

```

Now we can build the effects for the authentication:

## Creating the auth effects

For the actions we have we will add the corresponding effects and inject the `AuthService` we just created. If we navigate away from our app to an external source (like the STS in this case when logging in and out) we have to config the actions with `{ dispatch: false }` to clarify that we will NOT return an action to the actions stream inside our app.

So when the action `login` is dispatched we react with calling `doLogin()` from our `AuthService`. as this redirects, we configure it with `{ dispatch: false }`

```ts
login$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(fromAuthActions.login),
      switchMap(() => this.authService.doLogin())
    ),
  { dispatch: false }
);
```

The `checkAuth` action is called everytime we want to check whether we are authenticated or not. It is also called when the application starts so we will react to that accordingly as well, returning the corresponding `...Complete` action.

```ts
checkauth$ = createEffect(() =>
  this.actions$.pipe(
    ofType(fromAuthActions.checkAuth),
    switchMap(() =>
      this.authService
        .checkAuth()
        .pipe(
          map((isLoggedIn) => fromAuthActions.checkAuthComplete({ isLoggedIn }))
        )
    )
  )
);

checkAuthComplete$ = createEffect(() =>
  this.actions$.pipe(
    ofType(fromAuthActions.checkAuthComplete),
    switchMap(({ isLoggedIn }) => {
      if (isLoggedIn) {
        return this.authService.userData.pipe(
          map((profile) =>
            fromAuthActions.loginComplete({ profile, isLoggedIn })
          )
        );
      }
      return of(fromAuthActions.logoutComplete());
    })
  )
);
```

If the `checkAuthComplete` action is returning `true` for `isLoggedIn` we are asking the service for the userData with `this.authService.userData` and return the `loginComplete` action with both `profile` and `isLoggedIn` on it. This gets handled by the reducer then and sets the state accordingly.

The `logout` action will call the `signOut` method on the `AuthService` and handle that event then. Putting it together these are our effects:

```ts
/* imports */

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  login$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromAuthActions.login),
        switchMap(() => this.authService.doLogin())
      ),
    { dispatch: false }
  );

  checkauth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuthActions.checkAuth),
      switchMap(() =>
        this.authService
          .checkAuth()
          .pipe(
            map((isLoggedIn) =>
              fromAuthActions.checkAuthComplete({ isLoggedIn })
            )
          )
      )
    )
  );

  checkAuthComplete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuthActions.checkAuthComplete),
      switchMap(({ isLoggedIn }) => {
        if (isLoggedIn) {
          return this.authService.userData.pipe(
            map((profile) =>
              fromAuthActions.loginComplete({ profile, isLoggedIn })
            )
          );
        }
        return of(fromAuthActions.logoutComplete());
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuthActions.logout),
      tap(() => this.authService.signOut()),
      map(() => fromAuthActions.logoutComplete())
    )
  );

  logoutComplete$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromAuthActions.logoutComplete),
        tap(() => this.router.navigate(['/']))
      ),
    { dispatch: false }
  );
}
```

So basically we have everything prepared now! What is missing are the selectors to get a nicer access to the values form our store.

## Adding the auth selectors

We just have two properties to provide here and we will wrap them in their according selectors. Place them in a file called `auth.selectors.ts` in the `store/auth` folder. We are using the `authFeatureName` variable now exposed by the reducer to create a featureSelector returning the auth part of the state we are interested in and then create the selectors for the specific properties.

```ts
import { AuthState, authFeatureName } from './auth.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const getAuthFeatureState = createFeatureSelector(authFeatureName);

export const selectIsAuthenticated = createSelector(
  getAuthFeatureState,
  (state: AuthState) => state.isLoggedIn
);

export const selectUserInfo = createSelector(
  getAuthFeatureState,
  (state: AuthState) => state.profile
);
```

The `index.ts` file is just exporting all the stuff we did.

```ts
export * from './auth.actions';
export * from './auth.effects';
export * from './auth.reducer';
export * from './auth.selectors';
```

```
.
├── services
│   ├── auth.service.ts
├── store
│   ├── auth
│   │   ├── auth.actions.ts
│   │   ├── auth.effects.ts
│   │   ├── auth.reducer.ts
│   │   ├── auth.selectors.ts
│   │   └── index.ts
│   ├── data
│   │   └── index.ts
│   └── index.ts
```

## Creating the store for data

Basically we are using the same files and techniques for getting the data from the server in the end using a `data.service.ts` which is also placed in the `services` folder. We are adding only one (two with the complete action) action inside the action file, a reducer, the effect for getting the http data and the selector for selecting the data from the state.

```ts
import { createAction, props } from '@ngrx/store';

export const getData = createAction('[Data] getData');
export const getDataComplete = createAction(
  '[Data] getDataComplete',
  props<{ data: any }>()
);
```

```ts
export class DataEffects {
  constructor(private actions$: Actions, private dataService: DataService) {}

  getData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromDataActions.getData),
      switchMap(() =>
        this.dataService
          .getData()
          .pipe(map((data) => fromDataActions.getDataComplete({ data })))
      )
    )
  );
}
```

```ts
export const dataFeatureName = 'data';

export interface DataState {
  data: any;
}

export const initialDataState: DataState = {
  data: null,
};

const dataReducerInternal = createReducer(
  initialDataState,

  on(dataActions.getDataComplete, (state, { data }) => {
    return {
      ...state,
      data,
    };
  })
);

export function dataReducer(state: DataState | undefined, action: Action) {
  return dataReducerInternal(state, action);
}
```

```ts
export const getDataFeatureState = createFeatureSelector(dataFeatureName);

export const selectData = createSelector(
  getDataFeatureState,
  (state: DataState) => state.data
);
```

and the `data.service.ts` is firing the http request and returning the observable.

```ts
@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private httpClient: HttpClient) {}

  getData() {
    return this.httpClient
      .get('https://localhost:5001/api/securevalues')
      .pipe(catchError((error) => of(error)));
  }
}
```

```
.
├── services
│   ├── auth.service.ts
│   └── data.service.ts
├── store
│   ├── auth
│   │   ├── auth.actions.ts
│   │   ├── auth.effects.ts
│   │   ├── auth.reducer.ts
│   │   ├── auth.selectors.ts
│   │   └── index.ts
│   ├── data
│   │   ├── data.actions.ts
│   │   ├── data.effects.ts
│   │   ├── data.reducer.ts
│   │   ├── data.selectors.ts
│   │   └── index.ts
│   └── index.ts
```

## Building an app state

The main barrel file `store/index.ts` is used to gather all the states and effects and to provide an app state to the `AppModule` which we can register.

```ts
import { authReducer, AuthEffects } from './auth';
import { DataEffects, dataReducer } from './data';

export * from './auth';
export * from './data';

export const appReducer = {
  auth: authReducer,
  data: dataReducer,
};

export const appEffects = [AuthEffects, DataEffects];
```

## Registering the AppState on the AppModule

We can register the appstate on the `AppModule` now with the `StoreModule` and `EffectsModule` as well as configure our authentication.

```ts
/* imports */
import { appReducer, appEffects } from './store'; // importing from `store/index.ts`

export function configureAuth(oidcConfigService: OidcConfigService) {
  return () =>
    oidcConfigService.withConfig({
      /*config*/
    });
}

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
    AuthModule.forRoot(),
    StoreModule.forRoot(appReducer),
    EffectsModule.forRoot(appEffects),
    HttpClientModule,
  ],
  providers: [
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configureAuth,
      deps: [OidcConfigService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

Now that the store is ready we have to use it in our app.

## Using the store in the application

To use the store in our app we added four components to our app.

- AppComponent (initial loading point for our application)
- HomeComponent (Landing page for the app)
- ProtectedComponent (Loading protected data and can not be navigated to when not authenticated --> Guard)
- Unauthorized (As the sts will redirect us to an `unauthorized` route we provide the appropriate route)

We can connect them with this routes

```ts
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [AuthorizationGuard],
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
];
```

The `HomeComponent` and the `UnauthorizedComponent` are just static and contain no data. Interesting is the `ProtectedComponent` and the `AppComponent`

### AppComponent

The `AppComponent` as initial entry point will check for the authentication state and set the properties accordingly.

```ts
export class AppComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.store.dispatch(checkAuth());

    this.isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
  }

  login() {
    this.store.dispatch(login());
  }

  logout() {
    this.store.dispatch(logout());
  }
}
```

In its template we give the possibility to sing in and our as well as the router outlet showing the main page and - later on - the protected page.

```html
<h2>Authentication with NgRx</h2>

<div *ngIf="isAuthenticated$ | async as isAuthenticated; else noAuth">
  <a [routerLink]="'home'">home</a> |
  <a [routerLink]="'protected'">protected</a> |

  <button (click)="logout()">Logout</button>
</div>

<ng-template #noAuth>
  <a [routerLink]="'home'">home</a> |
  <button (click)="login()">Login</button>
  <hr />
</ng-template>

<router-outlet></router-outlet>
```

### ProtectedComponent

The `ProtectedComponent` can only be accessed when the user is authenticated and calls the data from the ASP.NET Core API which was secured.

```ts
/* imports */
import { selectuserInfo, getData, selectData } from '../store';

export class ProtectedComponent implements OnInit {
  secretData$: Observable<any>;
  userData$: Observable<any>;

  constructor(private store: Store<any>) {}

  ngOnInit(): void {
    this.userData$ = this.store.pipe(select(selectuserInfo));
    this.secretData$ = this.store.pipe(select(selectData));
    this.store.dispatch(getData());
  }
}
```

```html
<p>protected works!</p>

<h2>Userdata</h2>
<div *ngIf="userData$ | async as userData">{{ userData | json }}</div>

<hr />
<h2>Secret Data</h2>
<div *ngIf="secretData$ | async as secretData">{{ secretData | json }}</div>
```

Due to the NgRx store this is very nice and clean.

### Adding the AuthGuard

To save the `protected` route with a guard we can use the `AuthService` again as he exposes if we are authenticated or not.

```ts
/* imports */

@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isLoggedIn.pipe(
      map((isAuthorized: boolean) => {
        if (!isAuthorized) {
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}
```

The guard is used in the routes like we have seen before

```ts
{
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [AuthorizationGuard],
},
```

### Adding the Interceptor

We added the interceptor in the last post already, but for completeness we will mention it again here. The interceptor checks the route if it is in the array of secured routes and will add the token if it is available, then handle the request.

```ts
/* imports */

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private secureRoutes = ['https://localhost:5001/api'];

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.secureRoutes.find((x) => request.url.startsWith(x))) {
      return next.handle(request);
    }

    const token = this.authService.token;

    if (!token) {
      return next.handle(request);
    }

    request = request.clone({
      headers: request.headers.set('Authorization', 'Bearer ' + token),
    });

    return next.handle(request);
  }
}
```

That is it! I hope you enjoyed reading it.

HTH

Fabian
