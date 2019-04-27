---
title: Consuming a REST API with Angular Http-Service in Typescript
date: 2016-02-01
tags: ['angular', 'aspnetcore']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: [
  "/blog/articles/2016/02/01/consuming-a-rest-api-with-angular-http-service-in-typescript/"
]
---

### Updates

19.09.2018 - Updated Angular Syntax
19.08.2017 - Updated to ASP.NET Core 2.0 & new HttpClientModule

### Blogpost

Hey,

with this blog pot I want to show you how to create a dataservice to consume (not only) an ASP.NET REST API with the angular http module.

In my recent blog post [Getting started with Visual Studio Code, AngularJS and Typescript](http://offering.solutions/blog/articles/2015/12/03/getting-started-with-visual-studio-code-angularjs-and-typescript/) I have already mentioned how to start and to install the complete angular environment with corresponding tools.

Now I want to show you an example dataservice to call your favourite API.

### Configuration

Its always a good thing if you have your configuration seperated stored anywhere in your application. I always go for a file like "app.constants.ts" where I store all my values. If anything changes there, like a version of the api which is stored in the url or the endpoint/server whatever, I can do those changes immediatelly at one point.

```javascript
import { Injectable } from '@angular/core';

@Injectable()
export class Configuration {
    public server = 'http://localhost:5000/';
    public apiUrl = 'api/';
    public serverWithApiUrl = this.server + this.apiUrl;
}
```

Notice the injectable attribute to generate the metadata to make the service available through DI in other modules.

> You can read more about DI in Angular in this blog post [Dependency Injection in Angular](http://blog.thoughtram.io/angular/2015/05/18/dependency-injection-in-angular-2.html)

Now we have this going we can generate our service:

### The Service

First of all you have to create a module which only contains a service which is only responsible for calling an API with a specific endpoint.

```javascript
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Configuration } from '../../app.constants';

@Injectable()
export class DataService {

    private actionUrl: string;

    constructor(private http: HttpClient, private configuration: Configuration) {
        this.actionUrl = configuration.serverWithApiUrl + 'values/';
    }

    public getAll<T>(): Observable<T> {
        return this.http.get<T>(this.actionUrl);
    }

    public getSingle<T>(id: number): Observable<T> {
        return this.http.get<T>(this.actionUrl + id);
    }

    public add<T>(itemName: string): Observable<T> {
        const toAdd = { ItemName: itemName };

        return this.http.post<T>(this.actionUrl, toAdd);
    }

    public update<T>(id: number, itemToUpdate: any): Observable<T> {
        return this.http
            .put<T>(this.actionUrl + id, itemToUpdate);
    }

    public delete<T>(id: number): Observable<T> {
        return this.http.delete<T>(this.actionUrl + id);
    }
}


@Injectable()
export class CustomInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!req.headers.has('Content-Type')) {
            req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
        }

        req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
        return next.handle(req);
    }
}
```

This dataservice gets the configuration we just did and the HTTP-Service via DI. We included it over the new module-loading-syntax.

It is also important to tell the http-calls which header to use. "Application/Json" in this case. We are doing this via an interceptor and the new HttpClientModule.

Now you can include, inject and use this service to make http-calls to your API like this:

```javascript
import { Component, OnInit } from '@angular/core';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

import { DataService } from '../../shared/services/dataService';

@Component({
    selector: 'app-home-component',
    templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {

    public message: string;
    public values: any[];

    constructor(
        private dataService: DataService,
        private toasterService: ToasterService,
        private slimLoadingBarService: SlimLoadingBarService) {
        this.message = 'Hello from HomeComponent constructor';
    }

    ngOnInit() {
        this.slimLoadingBarService.start();

        this.dataService
            .getAll<any[]>()
            .subscribe((data: any[]) => this.values = data,
            error => () => {
                this.toasterService.pop('error', 'Damn', 'Something went wrong...');
            },
            () => {
                this.toasterService.pop('success', 'Complete', 'Getting all values complete');
                this.slimLoadingBarService.complete();
            });
    }
}
```

I think this should be basically it. Pay attention to the (normally) typed answer you get from the service

`(data: any[]) =>`

should be in your application

```javascript
 this.dataService
            .getAll<MyTypedItem[]>()
            .subscribe((data: MyTypedItem[]) => this.values = data,
```

and to the subscribe after calling the "GetAll"-Method from the service.

Hope you enjoyed it and a lot more: I hope this helps.

Bye

Fabian

### GitHub:

[Angular // Webpack // ASP.NET CORE WebAPI Starter Template](https://github.com/FabianGosebrink/ASPNETCore-Angular-Webpack-StarterTemplate)

or

[https://github.com/FabianGosebrink/ASPNET-ASPNETCore-Angular-Webpack/tree/master/AngularCLI](https://github.com/FabianGosebrink/ASPNET-ASPNETCore-Angular-Webpack/tree/master/AngularCLI)

### Links:

[https://auth0.com/blog/2015/05/14/creating-your-first-real-world-angular-2-app-from-authentication-to-calling-an-api-and-everything-in-between/](https://auth0.com/blog/2015/05/14/creating-your-first-real-world-angular-2-app-from-authentication-to-calling-an-api-and-everything-in-between/)

[https://auth0.com/blog/2015/10/15/angular-2-series-part-3-using-http/](https://auth0.com/blog/2015/10/15/angular-2-series-part-3-using-http/)

[https://auth0.com/blog/2015/09/17/angular-2-series-part-2-domain-models-and-dependency-injection/](https://auth0.com/blog/2015/09/17/angular-2-series-part-2-domain-models-and-dependency-injection/)

[https://auth0.com/blog/2015/09/03/angular2-series-working-with-pipes/](https://auth0.com/blog/2015/09/03/angular2-series-working-with-pipes/)

[https://angular.io/docs/ts/latest/guide/architecture.html](https://angular.io/docs/ts/latest/guide/architecture.html)
