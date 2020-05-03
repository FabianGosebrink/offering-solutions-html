---
title: Validating Single & Multiple Controls in Angular Reactive Forms
date: 2020-05-04
tags: ['angular', 'reactiveforms', 'validation']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I would like to describe how you can add validation to multiple fields of your reactive forms in Angular by using a feature called `Cross Field Validation`.

This powerful features let you validate not just a single form control but instead you can validate one form control against the value from another control. Let us see how we can do this.

The sourcecode is of course on Github and you can copy paste the examples along: [Github](https://github.com/FabianGosebrink/angular-reactive-forms-validation)

- [Preparation](#preparation)
- [Form validity](#form-validity)
- [Adding custom validators to a single form control](#adding-custom-validators-to-a-single-form-control)
- [Errors on `FormControl` vs. `FormGroup`](#errors-on-formcontrol-vs-formgroup)
- [Adding Cross control validators](#adding-cross-control-validators)
  - [Implementing the validator](#implementing-the-validator)
  - [Adding the validator to the form](#adding-the-validator-to-the-form)
  - [Showing the errors in the template](#showing-the-errors-in-the-template)
  - [Passing the age threshold into the validator](#passing-the-age-threshold-into-the-validator)

## Preparation

We are starting off with a simple form looking like this

```ts
export class AppComponent implements OnInit {
  title = 'forms-cross-field-validation';
  profileForm: FormGroup;

  rooms: Room[] = [
    { text: 'room 1', value: 'room-1' },
    { text: 'room 2', value: 'room-2' },
    { text: 'room 3', value: 'room-3' },
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: ['', Validators.required],
      room: [{}, Validators.required],
    });
  }

  onSubmit() {
    console.log(this.profileForm.value);
  }
}
```

This is a simple form defining four different fields you can type in the values. `firstName` and `lastName` are simple text fields, `age` is a number, and `room` is a select box which holds three values given above in the `rooms` array.

The template to this can look like

```html
<div class="container">
  <mat-card class="card">
    <form
      [formGroup]="profileForm"
      (ngSubmit)="onSubmit()"
      class="example-form"
    >
      <mat-form-field appearance="fill" class="example-full-width">
        <mat-label> First Name:</mat-label>
        <input matInput formControlName="firstName" />
      </mat-form-field>
      <br />
      <mat-form-field appearance="fill" class="example-full-width">
        <mat-label> Last Name:</mat-label>
        <input matInput formControlName="lastName" />
      </mat-form-field>
      <br />

      <mat-form-field appearance="fill" class="example-full-width">
        <mat-label>Age:</mat-label>
        <input matInput formControlName="age" type="number" />
      </mat-form-field>
      <br />

      <mat-form-field>
        <mat-label>Request room access</mat-label>
        <mat-select formControlName="room">
          <mat-option *ngFor="let room of rooms" [value]="room">
            {{ room.text }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <br />

      <button
        mat-raised-button
        color="primary"
        type="submit"
        [disabled]="!profileForm.valid"
      >
        Submit
      </button>
    </form>
  </mat-card>
</div>
```

The template binds those four values in its specific controls and submits the form by using a button which is disabled when the form is not valid.

## Form validity

The `profileForm` as a `FormGroup` is valid, when _all_ of it's controls are valid. So each `FormControl` has a validator `Validator.required` on it which either returns a valid state or an invalid state.

The `FormGroup` then collects those values and if _all_ of them are valid, it sets the form to `valid`. This is what we check with the `profileForm.valid` to disable the button.

## Adding custom validators to a single form control

There are a lot of blog posts out there telling you how to write a custom validator. But let us cover this shortly: A custom validator is a function which returns `null` or an object `{ ... }` in case everything is okay (`null`) or there are errors. `{ /* errors go in here */ }`.

So basically a custom validator could look like this:

```ts
import { AbstractControl } from '@angular/forms';

export function NoNegativeNumbers(control: AbstractControl) {
  return control.value < 0 ? { negativeNumber: true } : null;
}
```

And we pass it to the control like:

```ts
this.profileForm = this.formBuilder.group({
  // ...
  age: ['', [Validators.required, NoNegativeNumbers]],
  // ...
});
```

We can display the custom errors:

```html
<mat-form-field appearance="fill" class="example-full-width">
  <mat-label>Age:</mat-label>
  <input matInput formControlName="age" type="number" />
  <mat-error>
    <span *ngIf="profileForm.get('age').errors?.negativeNumber">
      Please provide a valid age
    </span>
  </mat-error>
</mat-form-field>
```

We are asking the error property _of the control_ with

```ts
profileForm.get('age').errors?
```

and as the error holds an object with properties on it which we can control with the validators we did, we added a property `negativeNumber` with the value `true` in our custom validator.

This is why we can ask for it now in the control.

```ts
profileForm.get('age').errors?.negativeNumber;
```

## Errors on `FormControl` vs. `FormGroup`

The errors are written into an `errors` property on the `FormGroup` or `FormControl` you are passing the validator on. This is very important because we know that the `FormGroup` is set to valid/invalid when a control has an error, but the error itself may appear on a `FormGroup` or `FormControl` depending on where the validator is placed at!

## Adding Cross control validators

All fun and games until here so let us add cross control validators to achieve that you can only request access to room 2 and room 3 when you are over 18 years old. For this we need the age control, need to see if its value is equal/over 18 dependent on what the user has chosen in the room control. So here are two controls involved now: `age` and `rooms`.

### Implementing the validator

The validators we wrote until here are all directly applied to the control. The cross control validator gets applied to the `FormGroup` because it has to cover multiple controls and not a single one. This also means, that every error we write out is written into the `FormGroups` error property. And not on the `FormControl`s one. You can however access the control and set its error with the `<Control>.setError({ ... })` method.

So let us start off writing the validator. The basic of this validator looks like this

```ts
import { Injectable } from '@angular/core';
import { FormGroup, ValidatorFn } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class RoomOver18Validator {
  public onlyAccessRoomsOver18(): ValidatorFn {
    return (formGroup: FormGroup) => {
      return null;
    };
  }
}
```

We create a class like a normal service which has a method which returns _a `ValidatorFn`_ (and not an errorObject or null). Inside this function we are get given the `FormGroup` our validator is running on and in this method we can then return the error object or the null again in case everything is okay.

Inside this method we can ask for the controls inside of the group. If they are not there for any reason, we can return null.

```ts
export class RoomOver18Validator {
  public onlyAccessRoomsOver18(): ValidatorFn {
    return (formGroup: FormGroup) => {
      const ageControl = formGroup.get('age');
      const roomControl = formGroup.get('room');

      if (!ageControl || !roomControl) {
        return null;
      }
    };
  }
}
```

If the age value is not given at all or over 18, we do not need to do something anyway - and return null again.

```ts
export class RoomOver18Validator {
  public onlyAccessRoomsOver18(): ValidatorFn {
    return (formGroup: FormGroup) => {
      const ageControl = formGroup.get('age');
      const roomControl = formGroup.get('room');

      if (!ageControl || !roomControl) {
        return null;
      }

      const ageValue = ageControl.value;

      if (!ageValue) {
        return null;
      }

      if (ageValue >= 18) {
        return null;
      }
    };
  }
}
```

If the value of the room control is not existing yet we are returning null again (Remember in the template we gave the value of the control the complete room with `[value]="room"`)

```ts
export class RoomOver18Validator {
  public onlyAccessRoomsOver18(): ValidatorFn {
    return (formGroup: FormGroup) => {
      const ageControl = formGroup.get('age');
      const roomControl = formGroup.get('room');

      if (!ageControl || !roomControl) {
        return null;
      }

      const ageValue = ageControl.value;

      if (!ageValue) {
        return null;
      }

      if (ageValue >= 18) {
        return null;
      }

      const roomsValue = roomControl.value as Room;

      if (!roomsValue) {
        return null;
      }
    };
  }
}
```

Now we can check if the rooms is room #2 or room # 3 and return an object which is an error in this case:

```ts
export class RoomOver18Validator {
  public onlyAccessRoomsOver18(): ValidatorFn {
    return (formGroup: FormGroup) => {
      const ageControl = formGroup.get('age');
      const roomControl = formGroup.get('room');

      if (!ageControl || !roomControl) {
        return null;
      }

      const ageValue = ageControl.value;

      if (!ageValue) {
        return null;
      }

      if (ageValue >= 18) {
        return null;
      }

      const roomsValue = roomControl.value as Room;

      if (!roomsValue) {
        return null;
      }

      if (roomsValue.value === 'room-2' || roomsValue.value === 'room-3') {
        return { roomOnlyWith18: true }; // This is our error!
      }

      return null;
    };
  }
}
```

Remember: we are on the `FormGroup` meaning that if we return errors we are writing them into the `error` property of the `FormGroup` we are on.

### Adding the validator to the form

The heavy lifting is done as we have to inject the service now into our component and then use the function. The `formBuilder.group()` accepts a second parameter as `formOptions` where we can pass an object with the properties `validators` and we provide `updateOn: 'blur'` too to make the experience a little easier.

```ts
import { RoomOver18Validator } from './room-over-18.validator';

constructor(
  private formBuilder: FormBuilder,
  private roomOver18Validator: RoomOver18Validator
) {}

ngOnInit() {
  this.profileForm = this.formBuilder.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: ['', [Validators.required, NoNegativeNumbers]],
      room: [{}, Validators.required],
    },
    {
      validators: [this.roomOver18Validator.onlyAccessRoomsOver18()],
      updateOn: 'blur',
    }
  );
}
```

The `validators` property takes an array, so you can add multiple cross control validators if you want.

### Showing the errors in the template

Angular Material sets the `<mat-error>...</mat-error>` when the `FormGroup` or `FormControl` is in an error state. So we can add a `<mat-error></mat-error>` to the complete form and ask the error property for the `roomOnlyWith18` as we returned this one from our cross control validator.

```html
<form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="example-form">
  <!-- complete form -->
  <mat-error>
    <span *ngIf="profileForm.errors?.roomOnlyWith18">
      You can not access this room being under 18
    </span>
  </mat-error>
</form>
```

### Passing the age threshold into the validator

As we have extracted the validator we can pass the threshold of `18` to the validator as a parameter

```ts
export class RoomOver18Validator {
  public onlyAccessRoomsOver18(minAge: number): ValidatorFn {
    return (formGroup: FormGroup) => {
      //...

      if (ageValue >= minAge) {
        return null;
      }

      // ...
    };
  }
}
```

and when registering the validator we can pass the `minAge` as a parameter from the outside

```ts
ngOnInit() {
  this.profileForm = this.formBuilder.group(
    {
      //...
    },
    {
      validators: [this.roomOver18Validator.onlyAccessRoomsOver18(18)],
      updateOn: 'blur',
    }
  );
}
```

That is basically it.

HTH

Fabian
