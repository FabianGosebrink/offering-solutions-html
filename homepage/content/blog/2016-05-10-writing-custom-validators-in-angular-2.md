---
title: Writing custom validators in Angular
date: 2016-05-10
tags: ['angular']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: ['/blog/articles/2016/05/10/writing-custom-validators-in-angular-2/']
---

In this blog post I want to show you how you are writing custom validators in Angular.

[https://github.com/OfferingSolutions/Offering-Solutions-Angular-Course/tree/master/Angular-Course/09_Forms/end/app/validators](https://github.com/OfferingSolutions/Offering-Solutions-Angular-Course/tree/master/Angular-Course/09_Forms/end/app/validators)

> Updated to new Syntax

When dealing with forms in Angular you can use the build-in validators like: required, minLength or maxLength, pattern... . Sooner or later you need a custom validator fulfilling a special validation.

Let's have a form first:

```html
<form #f="ngForm">
  <div class="form-group">
    <label for="calories">Calories</label>
    <input
      type="text"
      class="form-control"
      id="calories"
      placeholder="Calories"
      [(ngModel)]="foodItem.calories"
      name="calories"
    />
  </div>
  <button
    type="button"
    class="btn btn-default"
    (click)="AddOrUpdateFood()"
    [disabled]="!f?.valid"
  >
    Submit
  </button>
</form>
```

We see a form which has a variable "f" representing the form with which we can ask for the current state. We also have an input control in which we can add a number - calories in this case.

> I know that we could change the type of the input to number but in this post we want to check if whether the things the user typed are number or not.

So lets write a validator which exactly checks for that:

```javascript
import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, FormControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
  selector:
    '[isNumber][formControlName],[isNumber][formControl],[isNumber][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => IsNumberValidator),
      multi: true,
    },
  ],
})
export class IsNumberValidator implements Validator {
  validate(c: FormControl): { [key: string]: any } {
    if (isNaN(+c.value)) {
      // console.log(c.value + " is not a number");
      return {
        isNumber: {
          valid: false,
        },
      };
    }

    // console.log(c.value + " is a number");
    return null;
  }
}
```

This validator is named "IsNumberValidator" and has a function with a FormControl as a parameter. After the imports we define a directive here and adding the selectors we want. The "providers" let us extend the build-in NG_VALIDATORS and add our new validator. The class implements the validator class with the "validate"-Method which takes a FormControl and returns null if everything is okay and not null if the validation fails.

Before we can use it in our form we have to include it in our module. I built a shared module which I include in my app.module.

```javascript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { IsNumberValidator } from '../validators/isNumber.validator';
import { IsInRangeValidator } from '../validators/isInRange.validator';

@NgModule({
  imports: [
    // Modules
    BrowserModule,
  ],

  declarations: [
    // Components &amp; directives

    IsNumberValidator,
    IsInRangeValidator,
  ],

  providers: [
    // Services
  ],

  exports: [IsNumberValidator, IsInRangeValidator],
})
export class SharedModule {}
```

and in our app.module:

```javascript
// ...

import { SharedModule } from './modules/shared.module';

@NgModule({
  imports: [
    // ...
    SharedModule,
  ],

  declarations: [
    // ...
  ],

  providers: [
    // ...
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}
```

We can use it in the form like

```html
<form #f="ngForm">
  <div class="form-group">
    <label for="calories">Calories</label>
    <input
      type="text"
      class="form-control"
      id="calories"
      placeholder="Calories"
      [(ngModel)]="foodItem.calories"
      isNumber
      name="calories"
    />
  </div>
  <button
    type="button"
    class="btn btn-default"
    (click)="AddOrUpdateFood()"
    [disabled]="!f?.valid"
  >
    Submit
  </button>
</form>
```

Here we add the validator to the input field of our form. It is only a directive so we can treat it this way like we did with every directive before.

So now the validator directive fires everytime a key is hit. We can now add a

`... #calories="ngModel" ...`

to the form and check if the variable we introduced is valid with

`... calories.valid ...`

```html
<form #f="ngForm">
  <div class="form-group">
    <label for="calories">Calories</label>
    <input
      type="text"
      class="form-control"
      id="calories"
      placeholder="Calories"
      [(ngModel)]="foodItem.calories"
      isNumber
      name="calories"
      #calories="ngModel"
    />

    <div *ngIf="!calories.valid" class="alert alert-danger">
      Field is not valid
    </div>
  </div>
  <button
    type="button"
    class="btn btn-default"
    (click)="AddOrUpdateFood()"
    [disabled]="!f?.valid"
  >
    Submit
  </button>
</form>
```

But it would be nice to show _specific_ error messages to the users and not only if the filed is valid or not. Combining the variable with the dirty-check and our validator-naming we can show the user messages exactly to what was going wrong in the form.

```html
<form #f="ngForm" novalidate>
  <div class="form-group">
    <label for="calories">Calories</label>
    <input
      type="text"
      class="form-control"
      id="calories"
      placeholder="Calories"
      [(ngModel)]="currentFood.calories"
      required
      isNumber
      name="calories"
      #calories="ngModel"
    />

    <div
      *ngIf="calories.errors?.required &amp;&amp; (calories?.dirty &amp;&amp; !f.submitted)"
      class="alert alert-danger"
    >
      *
    </div>

    <div
      *ngIf="calories.errors?.isNumber &amp;&amp; (calories?.dirty &amp;&amp; !f.submitted)"
      class="alert alert-danger"
    >
      Please enter a number in a valid range
    </div>
  </div>
  <button
    type="submit"
    class="btn btn-default"
    (click)="AddOrUpdateFood()"
    [disabled]="!f?.valid"
  >
    Submit
  </button>
</form>
```

And that's basically it.

![Angular2CustomValidators](https://cdn.offering.solutions/img/articles/wp-content/uploads/2016/05/Angular2CustomValidators.jpg)

HTH

Regards
[https://github.com/OfferingSolutions/Offering-Solutions-Angular-Course/tree/master/Angular-Course/09_Forms/end/app/validators](https://github.com/OfferingSolutions/Offering-Solutions-Angular-Course/tree/master/Angular-Course/09_Forms/end/app/validators)

[http://blog.thoughtram.io/angular/2016/03/14/custom-validators-in-angular-2.html](http://blog.thoughtram.io/angular/2016/03/14/custom-validators-in-angular-2.html)

Thanks to [Jürgen Gutsch](http://www.gutsch-online.de/) for doing a review of this blog post.

Fabian
