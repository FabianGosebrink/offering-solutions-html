---
title: How to implement a table filter in Angular
date: 2016-11-21
tags: ['angular', 'filter']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  ['/blog/articles/2016/11/21/how-to-implement-a-table-filter-in-angular-2/']
---

In this post I want to show you how to implement a table filter in Angular.

> NOTE: Keep in mind that this only filters the client side values meaning the values you already loaded to the client! Filtering should maybe be a server side thing when you only call the data you really want, sending a request to your API with the term you want to filter your resources on right on the DB.

## TOC

- [Updated (16.08.2020)](#updated)
- [Using Reactive Forms and RxJS](#using-reactive-forms-and-rx-js)
- [Using a client side pipe](#using-a-client-side-pipe)

## Updated

(16.08.2020):
As the described way to use a pipe here is rather outdated in my opinion I updated this blog post and rearranged things a little. I would recommend the reactive way.

[Stackblitz Source](https://stackblitz.com/edit/angular-ivy-q9ak4m?file=src/app/app.component.ts)

## Using Reactive Forms and RxJS

When using reactive forms we have to import the `ReactiveFormsModule` in the `app.component.ts`

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

Having done that we can build a form in the template `app.component.html`

```html
<form [formGroup]="formGroup">
  <input
    type="text"
    class="form-control"
    name="searchString"
    placeholder="Type to search..."
    formControlName="filter"
  />
</form>
// more to come...
```

and in the table we can add one column which can be extended as you like:

```html
<form [formGroup]="formGroup">
  <input
    type="text"
    class="form-control"
    name="searchString"
    placeholder="Type to search..."
    formControlName="filter"
  />
</form>

<table class="table">
  <tr>
    <th>Name</th>
  </tr>
  <tr *ngFor="let food of filteredFoods$ | async">
    <td class="text-left">{{food.name}}</td>
  </tr>
</table>
```

In the components ts code we can now create the form and ask for the source. We register on the event when a value from the input changes and evaluate the client side food we have already loaded to filter it based on what the user typed.

```ts
import { Component, VERSION } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { map, withLatestFrom, startWith, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Component({
  /* */
})
export class AppComponent {
  foods$: Observable<FoodItem[]>;
  filteredFoods$: Observable<FoodItem[]>;

  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({ filter: [''] });

    this.foods$ = this.getFoods();

    this.filteredFoods$ = this.formGroup.get('filter').valueChanges.pipe(
      startWith(''),
      withLatestFrom(this.foods$),
      map(([val, foods]) =>
        !val ? foods : foods.filter((x) => x.name.toLowerCase().includes(val))
      )
    );
  }

  private getFoods() {
    return of([{ name: 'Food1' }, { name: 'Food2' }]).pipe(tap(console.log));
  }
}

export interface FoodItem {
  name: string;
}
```

We are creating a form with one filter input and bind it to the input we already have in the template. Then with the `getFoods()` method we call our foods, maybe from a backend this is why it is an Observable.

Then we use RxJS to react on the event a value changes in the input control `filter`

```ts
this.filteredFoods$ = this.formGroup.get('filter').valueChanges.pipe();
```

and when this event happens, we combine it with the latest in the `foods$` we already have

```ts
this.filteredFoods$ = this.formGroup
  .get('filter')
  .valueChanges.pipe(withLatestFrom(this.foods$));
```

After this we are taking the both values (searchValue and the foods list) out of the stream and can filter

```ts
this.filteredFoods$ = this.formGroup.get('filter').valueChanges.pipe(
  withLatestFrom(this.foods$),
  map(([val, foods]) =>
    !val
      ? foods
      : foods.filter((x) => x.name.toLowerCase().includes(val.toLowerCase()))
  )
);
```

As this observable only starts when something happens in the input box as it is `valueChanges` but we want to have an initial value we can use the `startsWith` operator to kick of the first run

```ts
this.filteredFoods$ = this.formGroup.get('filter').valueChanges.pipe(
  startWith(''),
  withLatestFrom(this.foods$),
  map(([val, foods]) =>
    !val ? foods : foods.filter((x) => x.name.toLowerCase().includes(val))
  )
);
```

In the template we bind to the `this.filteredFoods$` with the `async` pipe

```html
<tr *ngFor="let food of filteredFoods$ | async">
  ...
</tr>
```

## Using a client side pipe

Code: [https://github.com/FabianGosebrink/ASPNETCore-Angular-Ngrx/blob/master/client/src/app/food/pipes/filter.pipe.ts](https://github.com/FabianGosebrink/ASPNETCore-Angular-Ngrx/blob/master/client/src/app/food/pipes/filter.pipe.ts)

![In this post I want to show you how to implement a table filter in Angular](https://cdn.offering.solutions/img/articles/wp-content/uploads/2016/11/filter-1024x133.jpg)

You can achieve this using a pipe:

```javascript
import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'filter',
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

    return items.filter((singleItem) =>
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
import { CommonModule } from '@angular/common';
// ...
import { FilterPipe } from '../pipes/filter.pipe';

@NgModule({
  imports: [
    // Modules
    CommonModule,
  ],

  declarations: [
    // Components &amp; directives
    FilterPipe,
  ],

  providers: [
    // Services
  ],

  exports: [
    // ...
    FilterPipe,
  ],
})
export class SharedModule {}
```

AppModule:

```javascript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// ...
import { SharedModule } from './modules/shared.module';

// ...

@NgModule({
  imports: [
    // ...
    BrowserModule,
    SharedModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

In the template you have to add a input to a form to display a field to the user where the searchstring can be typed. After this the pipe has to be applied and the searchstring has to be databound in the template.

```javascript
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
// ...

@Component({
  selector: 'app-foodlist',
  templateUrl: './food-list.component.html',
  styleUrls: ['./food-list.component.css'],
})
export class FoodListComponent {
  foodItem: FoodItem;
  searchString: string;

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
    <td class="text-left">{{food.name}}</td>
    // ...
  </tr>
</table>
```

Now the table is filtered after the field "name" by the string which is typed into the searchString-input.

![In this post I want to show you how to implement a table filter in Angular](https://cdn.offering.solutions/img/articles/wp-content/uploads/2016/11/searchFilter-1024x316.gif)

HTH

Fabian
