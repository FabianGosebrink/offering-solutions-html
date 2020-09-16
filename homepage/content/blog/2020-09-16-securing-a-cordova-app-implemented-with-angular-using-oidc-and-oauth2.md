---
title: Securing a Cordova App Implemented with Angular Using OIDC and OAuth2
date: 2020-08-09
tags: ['aspnetcore', 'angular', 'cordova', 'crossplatform']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blogpost I want to explain how you can secure a Cordova app written in Angular with OIDC and OAuth2 against an Identity Server. We will take a look at an Angular project created with the AngularCLI or the NxDevTools and then turn it into a Cordova app via the Cordova CLI to let it run on the mobile phone and set everything up that we can authenticate to get a identity token and an access token and navigate back to our app to consume a secret api. The result is a web app which can be compiled to be a mobile app or a web application be runned in a desktop browser.

## What we will use

In this blogpost we will use the OAuth2 / OIDC Angular library [https://www.npmjs.com/package/angular-auth-oidc-client](https://www.npmjs.com/package/angular-auth-oidc-client) to secure our app against a Security Token Service. Further we will use the Cordova Plugin [https://github.com/EddyVerbruggen/Custom-URL-scheme](https://github.com/EddyVerbruggen/Custom-URL-scheme) and of course the [Cordova CLI](https://cordova.apache.org/docs/en/latest/guide/cli/) as well as an Angular CLI project which does not have to, but maybe should be done with the [Angular CLI](https://cli.angular.io/). To determine which platform we are on we can use the [ngx-device-detector](https://www.npmjs.com/package/ngx-device-detector).

We will not use the In-App-Browser plugin but the devices browser instead as the plugn may be malicious, a system browser can work better with password managers and we want to get single sign on going. We will use the custom url scheme instead.

## The correct authentication flow

For the authentication we will use the code flow and configure our authentication library as following: (Find more information [here](https://github.com/damienbod/angular-auth-oidc-client/tree/master/docs) how to get things started when using authantication.)

```js
export function configureAuth(oidcConfigService: OidcConfigService) {
  return () => {
    let redirectUrl = window.location.origin;
    let postLogoutRedirectUri = window.location.origin;

    oidcConfigService.withConfig({
      stsServer: 'https://my-super-security-token-service.net',
      redirectUrl,
      postLogoutRedirectUri,
      clientId: 'gettogetherapp',
      scope: 'openid profile email offline_access xyz_api',
      responseType: 'code',
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
      clientId: 'gettogetherapp',
      scope: 'openid profile email offline_access xyz_api',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 30,
    });
  };
}
```

### Modifying the Cordova configuration

Cordova can be configured with the `config.xml` file which we ahve if we create a new cordova cordova project with the [Cordova CLI](https://cordova.apache.org/docs/en/latest/guide/cli/)

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

With this we registered a custome url scheme which listens to `mytestapp://`. Exactly this will be our redirect address in our auth config. I will add a `callback` in the end just to make sure we have a string indicating that this is a callback from the sts:

```js
 export function configureAuth(
  oidcConfigService: OidcConfigService,
  deviceService: DeviceDetectorService
) {
  return () => let redirectUrl = window.location.origin;
    let postLogoutRedirectUri = window.location.origin;

    if (deviceService.isMobile()) {
      redirectUrl = 'mytestapp://callback';
      postLogoutRedirectUri = 'mytestapp://callback';
    }

    oidcConfigService.withConfig({
      stsServer: 'https://my-super-security-token-service.net',
      redirectUrl,
      postLogoutRedirectUri,
      clientId: 'gettogetherapp',
      scope: 'openid profile email offline_access xyz_api',
      responseType: 'code',
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
  providedIn: 'root',
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
      this.modal = window.open(authUrl, '_blank');
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

Having done that enter the
