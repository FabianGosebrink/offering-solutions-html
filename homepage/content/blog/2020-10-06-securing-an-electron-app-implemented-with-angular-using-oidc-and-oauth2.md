---
title: Securing an Electron App Implemented with Angular Using OIDC and OAuth2
date: 2020-09-17
tags: ['aspnetcore', 'angular', 'electron', 'crossplatform']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to explain how you can secure an electron app written in Angular with OIDC and OAuth2 using IdentityServer4 as the Secure Token Server.

> This is kind of a follow up blog post of my previous one [Securing a Cordova App Implemented with Angular Using OIDC and OAuth2](https://offering.solutions/blog/articles/2020/09/17/securing-a-cordova-app-implemented-with-angular-using-oidc-and-oauth2/)

## TOC

- [Understanding the problem](#understanding-the-problem)
- [What we will use](#what-we-will-use)
- [Configuring the authentication library](#configuring-the-authentication-library)
- [Adding the authentication in the Angular App](#adding-the-authentication-in-the-angular-app)
- [Catching the redirect in the electron main process](#catching-the-redirect-in-the-electron-main-process)
- [Catching the event in the Angular app](#catching-the-event-in-the-angular-app)

## Understanding the problem

We are using the code flow to authenticate our application against the Secure Token Server (STS). In a web application we can open up a new window and navigate back to the app with ease. Electron however has two processes: The main process and the renderer process. The main process is responsible for creating the renderer process, creating a browser window and showing your application. Normally the main process is hidden and you only see the renderer process serving your page when you click on the executable.

main process file could be like:
`index.js`

```ts
const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
```

Now when we login from our app we open up a new window to show the login to the user and we get redirected back to our app we do not land in the renderer process like we would do in a web application but in the main process. So the challenge is to configure the STS accordingly, open the popup, redirect back to our main process, catch the redirection and tell our renderer process - which is an Angular app - that something happened and then login the user as we would do in a web application.

## What we will use

In this blog post we will use the OAuth2 / OIDC Angular library [https://www.npmjs.com/package/angular-auth-oidc-client](https://www.npmjs.com/package/angular-auth-oidc-client) to secure our app against a Security Token Service. To determine which platform we are on we can use the [ngx-device-detector](https://www.npmjs.com/package/ngx-device-detector) and for the communication between renderer and main we use [https://www.npmjs.com/package/ngx-electron](https://www.npmjs.com/package/ngx-electron).

## Configuring the authentication library

To configure the authentication library we add the `redirectUrl` we have also entered in the configuration of the STS. We will use `https://localhost/callback` here, but you use what you want to in this case.

```ts
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AuthModule, OidcConfigService } from 'angular-auth-oidc-client';

export function configureAuth(
  oidcConfigService: OidcConfigService,
) {
  return () => {
    oidcConfigService.withConfig({
      stsServer: 'https://my-super-security-token-service.net',
      redirectUrl: `https://localhost/callback`;
      postLogoutRedirectUri: `https://localhost/callback`;
      clientId: 'mysupercoolapp',
      scope: 'openid profile email offline_access mysupercoolapp_api',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 30,
    });
  };
}

@NgModule({
  imports: [AuthModule.forRoot()],
  exports: [AuthModule],
  providers: [
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configureAuth,
      deps: [OidcConfigService, PlatformInformationService],
      multi: true,
    },
  ],
})
export class AuthenticationModule {}
```

```ts
// imports...

@NgModule({
  declarations: [AppComponent],
  imports: [
    // more ng module imports

    AuthenticationModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Adding the authentication in the Angular App

In our Angular app we can now start the login flow with a popup. The mentioned library supports this.

```ts
export function authFactory(
  platformInformationService: PlatformInformationService,
  oidcSecurityService: OidcSecurityService
) {
  if (platformInformationService.isElectron) {
    return new DesktopAuthService(oidcSecurityService);
  }

  return new WebAuthService(oidcSecurityService);
}

@Injectable({
  providedIn: 'root',
  useFactory: authFactory,
  deps: [PlatformInformationService, OidcSecurityService],
})
export abstract class AuthBaseService {
  modal: Window;

  constructor(public oidcSecurityService: OidcSecurityService) {}

  get isLoggedIn() {
    return this.oidcSecurityService.isAuthenticated$;
  }

  get token() {
    return this.oidcSecurityService.getToken();
  }

  get userData$() {
    return this.oidcSecurityService.userData$;
  }

  checkAuth(url?: string) {
    if (this.modal) {
      this.modal.close();
    }

    return this.oidcSecurityService.checkAuth(url);
  }

  abstract doLogin();

  signOut() {
    return this.oidcSecurityService.logoffAndRevokeTokens();
  }
}

export class DesktopAuthService extends AuthBaseService {
  doLogin() {
    const urlHandler = (authUrl) => {
      this.modal = window.open(authUrl, '_blank', 'nodeIntegration=no');
    };

    return of(this.oidcSecurityService.authorize({ urlHandler }));
  }
}
```

We are checking if we are in an electron environment with the `PlatformInformationService` and if so, we are returning an instance of the `DesktopAuthService`. The

```ts
const urlHandler = (authUrl) => {
  this.modal = window.open(authUrl, '_blank', 'nodeIntegration=no');
};
```

is opening a modal window to the configured STS url if it gets called inside the library with `return of(this.oidcSecurityService.authorize({ urlHandler }));`

The request will be made with the library and a modal pops up to login accordingly. That is the easy part. Now we are getting redirected back into the main process of our running electron application.

## Catching the redirect in the electron main process

In the main process `index.js` we can "intercept" all calls going in and out and checking if the url contains the `redirectUrl` we provided.

```ts
const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');

let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: __dirname + '/icon.ico',
  });

  mainWindow.loadFile('index.html');

  const filter = {
    urls: ['https://localhost/callback*'],
  };

  const {
    session: { webRequest },
  } = mainWindow.webContents;

  webRequest.onBeforeRequest(filter, ({ url }) => {
    mainWindow.webContents.send('authEvent', url);
  });
};

app.isReady() ? createWindow() : app.on('ready', createWindow);
```

In the main process `index.js` we are defining an array which we will react to

```ts
const filter = {
  urls: ['https://localhost/callback*'],
};
```

```ts
const {
  session: { webRequest },
} = mainWindow.webContents;

webRequest.onBeforeRequest(filter, ({ url }) => {
  mainWindow.webContents.send('authEvent', url);
});
```

and with the `onBeforeRequest` method we can check if the filter is fulfilled. If so, we can send and event `authEvent` with the url from the main process to the renderer process with the `mainWindow.webContents.send(...)` method. The url contains the code which will be exchanged with the STS to receive the id token and access token.

## Catching the event in the Angular app

With the ipc wrapper and electron communication package `ngx-electron` we can register on the event we are sending:

```ts
@Injectable({ providedIn: 'root' })
export class DesktopEventsService {
  constructor(
    private platformInformationService: PlatformInformationService,
    private electronService: ElectronService,
    private authBaseService: AuthBaseService,
  ) {}

  registerEvents() {
    if (this.platformInformationService.isElectron) {
      this.electronService.ipcRenderer.on(
        'authEvent',
        (event: any, data: any) => this.authBaseService.checkAuth(data));
      );
    }
  }
}
```

With this the modal is closed and the application runs the same way the web app authenticates to the STS.
