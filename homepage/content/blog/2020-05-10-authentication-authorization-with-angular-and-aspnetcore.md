---
title: Authentication & Authorization with OAuth2, OIDC with Angular and ASP.NET Core
date: 2020-05-03
tags: ['angular', 'authentication', 'authorization', 'aspnetcore']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to describe how you can add a login to your Angular App and secure it with OpenID Connect (OIDC) and OAuth2 to access an ASP.NET Core WebAPI with an Identity Server.

> Disclaimer: In this blog we will use an Angular library which I wrote some parts of. But the principles are best practice and uses a standard which can be applied to any Angular application no matter what libraries you use.

## The Situation

In this Scenario we have three applications interacting with each other. There is a REST API which can only be accessed using a valid access token which was created to use with the API. The Web API is secured using the [Authorize] attribute and secures complete controllers or several individual methods if required.

The UI client is a Single Page Application (SPA) implemented using Angular. It is responsible for sending the requests with all information needed to process and display the UI. The REST API is stateless.

The third application is the Security Token Service (STS). In this case it is an ASP.NET Core MVC application implemented using IdentityServer4 which holds the configuration to secure the SPA and the REST API and allow the SPA to request data from the API.

We will implement an Angular Client, which is redirected to the STS to authenticate. The user is then asked for username and password on the STS, never the SPA application. You could setup MFA if required or federate to another STS. If the authentication is successful, the STS returns two tokens, an access token and an identity token. This process is implemented using OpenID Connect Code Flow with PKCE. (Proof Key for Code Exchange). The access token is never used in the client UI. The access token is only intended for usage with the API. The access token can have a form. The identity token is for the client application, ie the Angular SPA and this is a JWT token. The token can contain the claims required for the UI, or you can send the claims in the user data request.

## The Security Token Server

The Security Token Server (STS) is responsible for providing the token based on a specific configuration. Inside of the tokens is the information where the token can have access to and what information can be asked for.

An STS is an independent instance and application and in this example we use the Identity Server with a config proving access to an API called `hoorayApi` and granting access to this when a specific client with the ID `angularClientForHoorayApi` asks for access. To fulfill the latest standards we use the [Code Flow](https://auth0.com/docs/flows/concepts/auth-code)

```cs
namespace StsServerIdentity
{
    public class Config
    {
        public static IEnumerable<IdentityResource> GetIdentityResources()
        {
            return new List<IdentityResource>
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
                new IdentityResources.Email()
            };
        }

        public static IEnumerable<ApiResource> GetApiResources()
        {
            return new List<ApiResource>
            {
                // example code
                new ApiResource("hoorayApi")
                {
                    ApiSecrets =
                    {
                        new Secret("hoorayApiSecret".Sha256())
                    },
                    Scopes =
                    {
                        new Scope
                        {
                            Name = "hooray_Api",
                            DisplayName = "Scope for the hoorayApi Resource"
                        }
                    },
                    UserClaims = { "role", "admin", "user", "hoorayApiSecret", "hoorayApiSecret.admin", "hoorayApiSecret.user" }
                },
            };
        }

        public static IEnumerable<Client> GetClients(IConfigurationSection stsConfig)
        {
            return new List<Client>
            {
                new Client
                {
                    ClientName = "Code Flow with refresh tokens",
                    ClientId = "angularClientForHoorayApi",

                    AccessTokenLifetime = 330,// 330 seconds, default 60 minutes
                    IdentityTokenLifetime = 45,

                    AllowAccessTokensViaBrowser = true,
                    RedirectUris = new List<string>
                    {
                        "https://localhost:4200"
                    },
                    PostLogoutRedirectUris = new List<string>
                    {
                        "https://localhost:4200/unauthorized",
                        "https://localhost:4200"
                    },
                    AllowedCorsOrigins = new List<string>
                    {
                        "https://localhost:4200"
                    },

                    RequireClientSecret = false,

                    AllowedGrantTypes = GrantTypes.Code,
                    RequirePkce = true,
                    AllowedScopes = { "openid", "profile", "email", "hooray_Api" },

                    AllowOfflineAccess = true,
                    RefreshTokenUsage = TokenUsage.OneTimeOnly
                },
            };
        }
    }
}
```

## The Resource API with ASP.NET Core

In the API you want to secure in the `Startup.cs` file you can add the sts server you have and configure it as the following

```cs
using IdentityServer4.AccessTokenValidation;
// ...

namespace BetterMeetup.Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }


        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            // all the services

            services.AddControllers()
                .AddNewtonsoftJson()
                .SetCompatibilityVersion(CompatibilityVersion.Version_3_0);


            services.AddAuthentication(IdentityServerAuthenticationDefaults.AuthenticationScheme)
                         .AddIdentityServerAuthentication(options =>
                         {
                             options.Authority = "https://offeringsolutions-sts.azurewebsites.net";
                             options.ApiName = "gettogetherapi";
                             options.ApiSecret = "gettogetherapiSecret";
                         });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // ...
            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}

```

Make sure to install the NuGet Package

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    //...
    <PackageReference Include="IdentityServer4.AccessTokenValidation" Version="3.0.1" />
    //...
  </ItemGroup>
</Project>
```

In the controllers then you can use the [Authorize] Attribute maybe combined with the `[AllowAnonymous]` attribute to secure complete controller and/or actions.

```cs
[Authorize]
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class GroupsController : ControllerBase
{
    private readonly IGroupsControllerService _controllerService;

    public GroupsController(IGroupsControllerService controllerService)
    {
        _controllerService = controllerService;
    }

    [AllowAnonymous]
    [HttpGet(Name = nameof(GetAllGroups))]
    public ActionResult GetAllGroups([FromQuery] GroupsQueryParameters queryParameters)
    {
        var result = _controllerService.GetAll(queryParameters);

        return Ok(result);
    }

    [HttpGet]
    [Route("{groupLinkName}", Name = nameof(GetSingleGroup))]
    public ActionResult GetSingleGroup(string groupLinkName)
    {
        var result = _controllerService.GetGroupPerLinkName(groupLinkName);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }
}
```

## The Angular App

Alright, as we are having the sts and the API configured we can go to our Angular application and configure this to match the config on the sts.

You can install the library `angular-auth-oidc-client` with

```
npm install angular-auth-oidc-client
```

After having done that in our `app.module.ts` we have to provide a configuration to configure our app matching the config on the sts

```ts
import { OidcConfigService, AuthModule } from 'angular-auth-oidc-client';
/* imports */

export function configureAuth(oidcConfigService: OidcConfigService) {
  return () =>
    oidcConfigService.withConfig({
      stsServer: 'https://link-to-your-sts-server/',
      redirectUrl: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      clientId: 'angularClientForHoorayApi',
      scope: 'openid profile email offline_access hooray_Api',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 30,
    });
}

@NgModule({
  declarations: [AppComponent, HomeComponent, UnauthorizedComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      // routes
    ]),
    AuthModule.forRoot(),
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

We have activated the silent renew here using refresh tokens. So the token renew will be handled for us not using an iframe in this case but a silent renew with a refresh token approach.

I made myself an `auth.service.ts` which is encapsulating the `OidcSecurityService` from the lib

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
    this.oidcSecurityService.logoff();
  }
}
```

In the `AppComponent`, because we redirect to it after the login, we have to call the `checkAuth()` method. I am doing this in the ``OnInit()`.

```ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  loggedIn$: Observable<boolean>;
  userData$: Observable<any>;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loggedIn$ = this.authService.isLoggedIn();
    this.userData$ = this.authService.userData();
    this.authService
      .checkAuth()
      .subscribe((isAuthenticated) =>
        console.log('Are we authenticated?', isAuthenticated)
      );
  }

  logout() {
    this.authService.signOut();
  }

  login() {
    this.authService.doLogin();
  }
}
```

```html
<div *ngIf="loggedIn$ | async as isLoggedIn; else noAuth">
  <button (click)="logout()">Logout</button>
  Is Authenticated: {{ isLoggedIn }}
</div>

<ng-template #noAuth>
  <button (click)="login()">Login</button>
</ng-template>
```

After having called the `doLogin()` method we are redirected to our sts. When we get back the `checkAuth()` method is called again and returning if we are authenticated or not. It also sets all the tokens and needed values.

### Sending the token on "every" request

Basically it is not recommended to send the token on _-\_every_ request. only send the token to endpoints you really need to send them to. So if we do an interceptor.

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private secureRoutes = ['route-to-your-api'];

  constructor(private oidcSecurityService: OidcSecurityService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Ensure we send the token only to routes which are secured
    if (!this.secureRoutes.find((x) => req.url.startsWith(x))) {
      return next.handle(request);
    }

    const token = this.oidcSecurityService.getToken();

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
