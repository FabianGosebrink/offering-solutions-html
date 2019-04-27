---
title: How to implement a table filter in Angular
date: 2016-11-21
author: Fabian Gosebrink
layout: post
tags: angular filter pipe tablefilter typescript
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

In this post I want to show you how to implement a table filter in Angular.

Code: [https://github.com/FabianGosebrink/ASPNETCore-Angular-Ngrx/blob/master/client/src/app/food/pipes/filter.pipe.ts](https://github.com/FabianGosebrink/ASPNETCore-Angular-Ngrx/blob/master/client/src/app/food/pipes/filter.pipe.ts)

A table in your application is maybe one of the most used controls. So is a filter for the table.

![In this post I want to show you how to implement a table filter in Angular2]({{site.baseurl}}assets/articles/wp-content/uploads/2016/11/filter-1024x133.jpg)

You can achieve this using a pipe:

```javascript
import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'filter'
})
@Injectable()
export class FilterPipe implements PipeTransform {
  transform(items: any[], field: string, value: string): any[] {
    if (!items) {
      return [];
    }
    if (!field || !value) {
      return items;
    }

    return items.filter(singleItem =>
      singleItem[field].toLowerCase().includes(value.toLowerCase())
    );
  }
}
```

This pipe takes an array if items and checks if the field which is also a parameter on a single items contains the value the user types. It returns the array of matching items.

The Pipe is available through the name "filter".

After implementing this the pipe has to be registered on a module to make it available in our application. Could be your application module or if you have one, a shared module. In case of the shared one: Do not forget to export it. ;-)

```javascript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// ...

import { FilterPipe } from '../pipes/filter.pipe';

@NgModule({
  imports: [
    // Modules
    BrowserModule
  ],

  declarations: [
    // Components &amp; directives
    FilterPipe
  ],

  providers: [
    // Services
  ],

  exports: [
    // ...
    FilterPipe
  ]
})
export class SharedModule {}
```

AppModule:

```javascript
import { NgModule } from '@angular/core';
// ...
import { SharedModule } from './modules/shared.module';

// ...

@NgModule({
  imports: [
    // ...
    SharedModule
  ],

  declarations: [
    // ...
  ],

  providers: [
    // ...
  ],

  bootstrap: [AppComponent]
})
export class AppModule {}
```

In the template you have to add a input to a form to display a field to the user where the searchstring can be typed. After this the pipe has to be applied and the searchstring has to be databound in the template.

```javascript
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
// ...

@Component({
    selector: 'foodList',
    templateUrl: 'app/components/foodList/foodList.component.html'
})

export class FoodListComponent {
    public foodItem: FoodItem;
    public searchString: string;

    // ...
}
```

```html
<form>
  <div class="form-group">
    <div class="input-group">
      <div class="input-group-addon">
        <i class="glyphicon glyphicon-search"></i>
      </div>
      <input
        type="text"
        class="form-control"
        name="searchString"
        placeholder="Type to search..."
        [(ngModel)]="searchString"
      />
    </div>
  </div>
</form>

<table class="table">
  <tr>
    <th>Name</th>
    <th>Calories</th>
    <th class="text-right">Actions</th>
  </tr>
  <tr
    *ngFor="let food of foods | filter : 'name' : searchString; let i = index"
  >
    <td class="text-left">
      {{food.name}}
    </td>
    // ...
  </tr>
</table>
```

Now the table is filtered after the field "name" by the string which is typed into the searchString-input.

![In this post I want to show you how to implement a table filter in Angular2]({{site.baseurl}}assets/articles/wp-content/uploads/2016/11/searchFilter-1024x316.gif)

HTH

Fabian
