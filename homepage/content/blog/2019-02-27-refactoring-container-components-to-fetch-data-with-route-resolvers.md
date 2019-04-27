---
title: Refactoring Container Components to Fetch Data With Route Resolvers
date: 2019-02-27
tags: angular routeresolvers components
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
---

In this blogpost I want to show an alternative way to provide data in a common container & presentational components relation inside an Angular application.

## Content

- [Container and presentational components](#container-and-presentational-components)
- [Sample application on Github](#sample-application-on-github)
- [Displaying data without route resolvers](#displaying-data-without-route-resolvers)
- [Displaying data with route resolvers](#displaying-data-with-route-resolvers)
- [Showing loading indicator when data gets resolved](#showing-loading-indicator-when-data-gets-resolved)

## Container and presentational components

In an Angular application we try to separate our components to container and presentational components as much as we can. Container components act as hosting component which know about the data and have dependencies to services to fetch or manipulate the data in any kind of way.

Presentational components have the fitting `@Input()` and `@Output()` decorators to receive data on the one side and throw events on the other. They only care about how to display the data and have no clue where the data is coming from.

## Sample application on Github

The sample application is to be found here [https://github.com/FabianGosebrink/angular-route-resolvers](https://github.com/FabianGosebrink/angular-route-resolvers)

## Displaying data without route resolvers

If we fetch data in a container component and pass it down to the presentational component, the component displaying the data is already shown with all its content but not the data itself as the data has a small delay (like with an http request for example). We can get over that issue with an `ngIf` directive.

```ts
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-container',
  template: `
    <app-presentational [data]="data$ | async"></app-presentational>
  `,
  styleUrls: ['./container.component.css']
})
export class ContainerComponent implements OnInit {
  data$: Observable<any>;

  constructor(private readonly httpClient: HttpClient) {}

  ngOnInit() {
    this.data$ = this.httpClient.get('https://swapi.co/api/people/1');
  }
}
```

here our container component is hosting the presentational component and fetches the data, passing it into the presentational component with an async directive.

```ts
{% raw %}
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-presentational',
  template: `
    <p *ngIf="data; else nodata">
      {{ data | json }}
    </p>

    <ng-template #nodata>no data received yet</ng-template>
  `,
  styleUrls: ['./presentational.component.css'],
})
export class PresentationalComponent implements OnInit {
  @Input() data: any;
}
{% endraw %}
```

The presentational component can receive the data via the `@Input()` decorator and displays the data plain as json.

In the time there is no data the `*ngIf="data; else nodata"` referrs to a template which displays an alternative message to the user to tell the user there is no data received yet.

Our routing is set up like

```ts

 RouterModule.forRoot([
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'container', component: ContainerComponent },
]),
```

`HomeComponent` here is just a components displaying something that we can fetch the data when the route to the container component is clicked.

## Displaying data with route resolvers

If we want to change that the component the route is referring to is displayed when there is no data yet with route resolver we can fetch the data before we route to the new component.

For this first we have to introduce a route resolver

```ts
import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataResolver implements Resolve<any> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return null; // to be added
  }
}
```

The Resolver is just a class implementing the interface `Resolve<T>` which forces you to implement a function called `resolve` where you are getting passed the `ActivatedRouteSnapshot` and the `RouterStateSnapshot` as parameter.

Let us improve the resolver by letting it fetch some data

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class DataResolver implements Resolve<any> {
  constructor(private readonly httpClient: HttpClient) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.httpClient.get('https://swapi.co/api/people/1');
  }
}
```

Now we moved the place to fetch the data out of our component into the route resolver. But how do we fetch the data in the component then?

First we have to modify our routing to the following:

```ts
import { DataResolver } from './first.resolver';

RouterModule.forRoot([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'container',
        component: ContainerComponent,
        // add this
        resolve: {
          resolverData: DataResolver,
        },
        // end add
      },
    ]),
```

and now instead of injection the `HttpClient` directly, we can use the resolved data provided by the `ActivatedRoute` in our component:

```ts
constructor(private activatedRoute: ActivatedRoute) {}

ngOnInit() {
    this.data$ = this.activatedRoute.data.pipe(map(data => data.resolverData));
}
```

The difference now is that the `ContainerComponent` is only displayed when the data is already fetched. This means we can get rid of the `else` case in the `ngIf/else` construct:

```ts
{% raw %}
@Component({
  selector: 'app-presentational',
  template: `
    <p *ngIf="data">
      {{ data | json }}
    </p>
  `,
  styleUrls: ['./presentational.component.css'],
})
export class PresentationalComponent {
  @Input() data: any;
}
{% endraw %}
```

## Showing loading indicator when data gets resolved

This is fine for now, but how can the user see that something is happening if the resolver is currently fetching some data? It would be nice to display the user a loading indicator. We can introduce a service for that listening to some `RouterEvents` like this

```ts
@Injectable({ providedIn: 'root' })
export class LoadingIndicatorService {
  isLoading$: Observable<boolean>;

  constructor(private router: Router) {
    this.isLoading$ = this.router.events.pipe(
      filter(
        event =>
          event instanceof NavigationStart || event instanceof NavigationEnd
      ),
      map(event => !!(event instanceof NavigationStart))
    );
  }
}
```

We are first filtering the router events for `NavigationStart` and `NavigationEnd` (you can add more if you want) and then turning the event into a boolean if the navigation is currently starting. If yes, the loading observable fires `true` otherwise `false`;

In our app component we can inject this service and use the `isLoading$` to show or hide the `<router-outlet>` and hide or show the loading indicator instead:

```ts
@Component({
  selector: 'app-root',
  template: `
    <a [routerLink]="['home']">Home</a> |
    <a [routerLink]="['container']">Container</a>

    <ng-template #loading>Loading...</ng-template>

    <router-outlet
      *ngIf="!(loadingIndicatorService.isLoading$ | async); else loading"
    ></router-outlet>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'route-resolvers';

  constructor(public loadingIndicatorService: LoadingIndicatorService) {}
}
```

That is it. We refactored our components to get the data resolved from a route resolver and showed a loading indicator in between. This is not always what you want to achieve. maybe in your project a loding message on the component itself is the perfect way to go. Well...you know the alternative now :)

Hope this helps

Fabian
