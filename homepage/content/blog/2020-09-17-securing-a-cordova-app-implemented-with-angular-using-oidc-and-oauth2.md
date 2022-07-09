---
title: Securing a Cordova App Implemented with Angular Using OIDC and OAuth2
date: 2020-09-17
tags: ["aspnetcore", "angular", "cordova", "crossplatform"]
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to explain how you can secure a Cordova app written in Angular with OIDC and OAuth2 using IdentityServer4 as the Secure Token Server. We will take a look at an Angular project created with the AngularCLI or the NxDevTools and then turn it into a Cordova app via the Cordova CLI to let it run on the mobile phone and set everything up that we can authenticate to get an identity token and an access token and navigate back to our app to consume a protected API. The result is a web app which can be compiled to be a mobile app or a web application which can run in a desktop browser and secured using OIDC Code flow with PKCE.

## TOC

- [What we will use](#what-we-will-use)
- [Understanding the problem](#understanding-the-problem)
- [The correct authentication flow](#the-correct-authentication-flow)
- [Modifying the authentication config](#modifying-the-authentication-config)
- [Modifying the Cordova configuration](#modifying-the-cordova-configuration)
- [Adding the authentication and callback in the Angular App](#adding-the-authentication-and-callback-in-the-angular-app)
- [Catching the callback](#catching-the-callback)
- [Create a mobile app](#create-a-mobile-app)

## What we will use

In this blog post we will use the OAuth2 / OIDC Angular library [https://www.npmjs.com/package/angular-auth-oidc-client](https://www.npmjs.com/package/angular-auth-oidc-client) to secure our app against a Security Token Service. Further we will use the Cordova Plugin [https://github.com/EddyVerbruggen/Custom-URL-scheme](https://github.com/EddyVerbruggen/Custom-URL-scheme) and the [Cordova CLI](https://cordova.apache.org/docs/en/latest/guide/cli/) as well as an Angular CLI project which does not have to, but maybe should be done with the [Angular CLI](https://cli.angular.io/). To determine which platform we are on we can use the [ngx-device-detector](https://www.npmjs.com/package/ngx-device-detector).

We will not use the In-App-Browser plugin but the devices browser instead as the plugin may be malicious, a system browser can work better with password managers and we want to get single sign on going. We will use the custom url scheme instead.

## Understanding the problem

Normally in web you would redirect _after_ the login to your app which runs on `https://localhost...` or `https://my-super-url.com`.
Mobile devices can open apps only due to a custom scheme which can be called like `mytestapp://`. Redirecting to `https://localhost...` would not start the app again when we redirect from the Secure Token Server. This is why we have to add the custom url scheme as `redirectUrl` into the Secure Token Server and we have to make that scheme starting our particular app when it gets called on our mobile device.

## The correct authentication flow

For the authentication we will use the code flow with PKCE and configure our authentication library as following: (Find more information [here](https://github.com/damienbod/angular-auth-oidc-client/tree/master/docs) how to get things started when using authentication.)

```js
export function configureAuth(oidcConfigService: OidcConfigService) {
  return () => {
    let redirectUrl = window.location.origin;
    let postLogoutRedirectUri = window.location.origin;

    oidcConfigService.withConfig({
      stsServer: "https://my-super-security-token-service.net",
      redirectUrl,
      postLogoutRedirectUri,
      clientId: "mysupercoolapp",
      scope: "openid profile email offline_access xyz_api",
      responseType: "code",
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 30,
    });
  };
}
```

Feel free to modify this configuration to your needs and make sure the STS is configured so it can handle those values. The `redirectUrl` is very important and often a door for mistakes 😊

## Modifying the authentication config

If you have done the normal web authentication with the code flow we can install the [ngx-device-detector](https://www.npmjs.com/package/ngx-device-detector) that we know whether we are on mobile or on web.

```
npm install ngx-device-detector
```

having done that we can pass the detector to our configuration and ask it for the mobile device and change the values accordingly. We have to modify the redirectUrl to be a custom url scheme which we will take a look at next. Let us do the config first:

```js
 export function configureAuth(
  oidcConfigService: OidcConfigService,
  deviceService: DeviceDetectorService
) {
  return () => let redirectUrl = window.location.origin;
    let postLogoutRedirectUri = window.location.origin;

    if (deviceService.isMobile()) {
      redirectUrl = '< to be filled later >';
      postLogoutRedirectUri = '< to be filled later >';
    }

    oidcConfigService.withConfig({
      stsServer: 'https://my-super-security-token-service.net',
      redirectUrl,
      postLogoutRedirectUri,
      clientId: 'mysupercoolapp',
      scope: 'openid profile email offline_access xyz_api',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 30,
    });
  };
}
```

## Modifying the Cordova configuration

Cordova can be configured with the `config.xml` file which we have if we create a new cordova cordova project with the [Cordova CLI](https://cordova.apache.org/docs/en/latest/guide/cli/)

```
cordova create hello com.example.hello HelloWorld
```

```
.
├── www
│   └── ...
├── .gitignore
├── config.xml  // <-- this one
└── package.json
```

We first have to add the plugin mentioned [https://github.com/EddyVerbruggen/Custom-URL-scheme](https://github.com/EddyVerbruggen/Custom-URL-scheme) and for the sake of simplicity will use `mytestapp` as a custom url scheme for our app.

```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.offering.solutions" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">

  // ... other info

  <allow-intent href="mytestapp:*" />
  <allow-intent href="http://*/*" />
  <allow-intent href="https://*/*" />
  // ... other info

  <plugin name="cordova-plugin-customurlscheme" spec="^4.3.0">
      <variable name="URL_SCHEME" value="mytestapp" />
      <variable name="ANDROID_SCHEME" value=" " />
      <variable name="ANDROID_HOST" value=" " />
      <variable name="ANDROID_PATHPREFIX" value="/" />
  </plugin>

  // ... other info
  <preference name="Scheme" value="https" />
  <preference name="MixedContentMode" value="2" />

  <preference name="android-minSdkVersion" value="22" />
  <preference name="android-targetSdkVersion" value="30" />
  <preference name="AndroidLaunchMode" value="singleTask" />
</widget>

```

Alternatively you can run

```
cordova plugin add cordova-plugin-customurlscheme --variable URL_SCHEME=mytestapp
```

at the level of the `config.xml`.

> Note that we skipped not needed plugins here. You can add them as you want.

With this we registered a custom url scheme which listens to `mytestapp://`. Exactly this will be our redirect address in our auth config. I will add a `callback` in the end to make sure we have a string indicating that this is a callback from the STS:

```js
export function configureAuth(
  oidcConfigService: OidcConfigService,
  deviceService: DeviceDetectorService
) {
  return () => {
    let redirectUrl = window.location.origin;
    let postLogoutRedirectUri = window.location.origin;

    if (deviceService.isMobile()) {
      redirectUrl = "mytestapp://callback";
      postLogoutRedirectUri = "mytestapp://callback";
    }

    oidcConfigService.withConfig({
      stsServer: "https://my-super-security-token-service.net",
      redirectUrl,
      postLogoutRedirectUri,
      clientId: "mysupercoolapp",
      scope: "openid profile email offline_access xyz_api",
      responseType: "code",
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 30,
    });
  };
}
```

## Adding the authentication and callback in the Angular App

In the Angular app we use a popup to register because we want to start a new browser instance. How to do that can be found in the docs of the `angular-auth-oidc-client` [here](https://github.com/damienbod/angular-auth-oidc-client/tree/master/docs). But any other library can do that as well.

```ts
export function authFactory(
  deviceService: DeviceDetectorService,
  oidcSecurityService: OidcSecurityService
) {
  return deviceService.isMobile()
    ? new MobileAuthService(oidcSecurityService)
    : new WebAuthService(oidcSecurityService);
}

@Injectable({
  providedIn: "root",
  useFactory: authFactory,
  deps: [DeviceDetectorService, OidcSecurityService],
})
export abstract class AuthBaseService {
  modal: Window;

  constructor(public oidcSecurityService: OidcSecurityService) {}

  // ... your properties/abstractions

  checkAuth(url?: string) {
    if (this.modal) {
      this.modal.close();
    }

    return this.oidcSecurityService.checkAuth(url);
  }

  abstract doLogin();
}

export class MobileAuthService extends AuthBaseService {
  doLogin() {
    const urlHandler = (authUrl) => {
      this.modal = window.open(authUrl, "_blank");
    };

    return of(this.oidcSecurityService.authorize({ urlHandler }));
  }
}

export class WebAuthService extends AuthBaseService {
  doLogin() {
    return of(this.oidcSecurityService.authorize());
  }
}
```

We are using the `AuthBaseService` here to provide an abstract `doLogin()` method which can be implemented by different providers from different platforms and to abstract the usage of the `OidcSecurityService`.

So when working with the `AuthBaseService` we can call the `doLogin()` method which is automatically the correct instance for our platform due to the factory `authFactory`. In mobile case we use a popup which opens the system browser out of our app.

With the redirect url we provided it redirects back to `mytestapp://callback`. What we need to do now is to catch the event and pass it to the library again to make sure all the properties are set accordingly.

## Catching the callback

We already have a solution in the working web app where we pass the url into the library to get all things arranged. But this time we need to the callback into our app with the method mentioned by the [https://github.com/EddyVerbruggen/Custom-URL-scheme](https://github.com/EddyVerbruggen/Custom-URL-scheme) `handleOpenURL`

```ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  constructor(
    private authBaseService: AuthBaseService,
    private zone: NgZone,
	  private deviceService: DeviceDetectorService
  ) {}

  ngOnInit() {
    this.checkAuth();
  }

  logout() {
    this.authBaseService.logout();
  }

  login() {
    this.authBaseService.doLogin();
  }

  checkAuth(url?: string) {
    if (!this.deviceService.isMobile()) {
      this.authBaseService.checkAuth());
    }

    (window as any).handleOpenURL = (url: string) => {
      this.zone.run(() => {
        this.authBaseService.checkAuth(url));
      });
    };
  }
}
```

with

```js
(window as any).handleOpenURL = (url: string) => {
  this.zone.run(() => {
    this.authBaseService.checkAuth(url));
  });
};
```

We are catching the redirect back in the app and pass the url to the lib.

## Create a mobile app

Take your Angular app and build it production ready

```
ng build --prod
```

After this copy the angular output to the `www` folder in your cordova project.

```
.
├── www
│   └── // ... all those Angular files
├── .gitignore
├── config.xml  // <-- this one
└── package.json
```

Having done that enter the folder on the `package.json` or `config.xml` level and add your platforms.

> Note that this article cares about android but out of experience iOS is making way less problems 😉

```
 cordova platform add android
```

> Pay attention to the requirements [Android requirements](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#requirements-and-support) or [iOS Requirements](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html#requirements-and-support) you need to build android apps.

After the platform was added you can run

```
cordova build
```

to build all platforms.

You will find the generated `*.apk` in the `...android\app\build\outputs\apk\debug` folder.

Take this `*.apk` and copy it to your phone, install it and it should work :)

Alternatively you can plugin your phone and run

```
cordova run android
```

The app should start on your phone.

Hope this helps.

Many thanks to [Christian Liebel](https://twitter.com/christianliebel) and [David Dal Busco ](https://twitter.com/daviddalbusco) for helping me on this.
