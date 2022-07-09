---
title: Getting Started With Angular Strictly Typed Reactive Forms
date: 2022-07-09
tags: ['angular', 'reactiveforms']
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

With Angular 14 the Angular Team provided a new very demanded feature: [Strictly Typed Reactive Forms](https://blog.angular.io/angular-v14-is-now-available-391a6db736af). That solves a lot of problems when interacting with Angular Forms, as we have the type of the model we are representing with the form now, instead of an `any` "type" we had before. But let's have a look at this step by step.

## The Problem

Let us take a look at this `FormGroup`:

```ts
@Component(/* ... */)
export class FormSimpleGroupComponent implements OnInit {
  myForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      firstName: '',
      lastName: '',
      age: 0,
    });
  }

  onSubmit() {
    const formValue = this.myForm.value;
    // >>>>>>> `formValue` has the any type here!!!! <<<<<
    console.log(formValue);
  }
}
```

We are creating a `FormGroup` which displays a `firstName`, a `lastName` and an `age` value. The type of `firstName` and `lastName` surely is a string, and the `age` would have the best fit with a number. Although we know the type here in this very basic example we have no control over the type of the value, the `this.myForm.value` provides us.

This also provides us the possibility to use wrong properties, something like

```
const title = this.myForm.value.firstName.title;
```

Which is wrong, because the `title` form does not exist on the `firstName`.

To solve this issue, Angular provided us types in Reactive Forms.

## The automatic migration

If you upgrade to Angular 14 a migration will be performed automatically for you. But Angular will _not_ migrate to the typed versions right away. What will be done is an untyped version of your forms explicitly.

If we refer to the sample above, you can see the migration as follows:

```ts
@Component(/* ... */)
export class FormSimpleGroupComponent implements OnInit {
  myForm: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) {}

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      firstName: '',
      lastName: '',
      age: 0,
    });
  }

  onSubmit() {
    const formValue = this.myForm.value;
    // >>>>>>> `formValue` has the any type here!!!! <<<<<
    console.log(formValue);
  }
}
```

So what happened is the `FormGroup` got converted to an `UntypedFormGroup` and the `FormBuilder` converted to an `UntypedFormBuilder`.

Further, a `FormControl` will be an `UntypedFormControl` and a `FormArray` will become an `UntypedFormArray`.

[PR Angular Forms to Untyped Forms](https://github.com/FabianGosebrink/angular-forms-workshop/pull/1/commits/4cfab30c13fb003e0a5b5c8e4e2476704cc607d9)

## The manual migration to typed reactive forms

The first thing to do is manually revert the types back from `UntypedFormBuilder` to `FormBuilder`, `UntypedFormGroup` to `FormGroup` etc.

You can do this step by step, as the untyped forms still work the same way you the old ones did before Angular 14.

```ts
@Component(/* ... */)
export class FormSimpleGroupComponent implements OnInit {
  myForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      firstName: '',
      lastName: '',
      age: 0,
    });
  }

  onSubmit() {
    const formValue = this.myForm.value;
    console.log(formValue);
  }
}
```

But with this, you're not completely typed yet. What Angular does now is deriving the form types from your given controls.

If you hover over the `this.formBuilder.group(...)` VSCode will provide you the types Angular "guesses" for you. You will see something like this:

```
FormBuilder.group<{
    firstName: string;
    lastName: string;
    age: number;
}>(controls: {
    firstName: string;
    lastName: string;
    age: number;
}, options?: AbstractControlOptions): FormGroup<{
    firstName: FormControl<...>;
    lastName: FormControl<...>;
    age: FormControl<...>;
}>
```

So Angular knows what types are in the form now, but that's only a small step on the way to typed forms. We are not there yet.

If we want to define the type of our forms we can add it to the `FormGroup` type our property has like so:

```ts
@Component(/* ... */)
export class FormSimpleGroupComponent implements OnInit {
  myForm: FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    age: FormControl<number>;
  }>;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      firstName: '',
      lastName: '',
      age: 0,
    });
  }

  onSubmit() {
    const formValue = this.myForm.value;
    console.log(formValue);
  }
}
```

And suddenly Angular can now check if the controls inside your form

```ts
this.myForm = this.formBuilder.group({
  firstName: '',
  lastName: '',
  age: 0,
});
```

Really match your `FormGroup` type.

If we provided a control name which is not in the type, the form would set an error.

```ts
 myForm: FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    age: FormControl<number>;
  }>;

// ...

this.myForm = this.formBuilder.group({
      firstName: "",
      lastName: "",
      somethingElseThanAge: 0,  <<<<<<< This would error
    });
```

Now, if you want to get the forms value including all fields, which means also the not enabled controls, you can get the value with the `getRawValue()` method, which also has the types now and provides intellisense. You can also use the `value` property provided by the form group, which provides the value as well but does not contain possibly not enabled controls or undefined fields.

```ts
 onSubmit() {
    const rawValue = this.myForm.getRawValue();
    // or
    const value = this.myForm.value;

    const notExisting = value.age; // this works fine
    const notExisting = value.notOnMyForm  <<<<<<< This would error
  }
```

Also, if you are working with `this.myForm.setValue(...)` or `this.myForm.patchValue(...)` the values passed into the methods are now being checked and if not fitting, the compiler throws an error again to safe you from providing wrong values to your form.

But having the type of the form directly in the generic property description is a little cumbersome to read. We can make our lives easier and introduce an interface for this and provide this as the type into the generic of the `FormGroup`.

```ts
interface UserForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  age: FormControl<number>;
}

@Component(/* ... */)
export class FormSimpleGroupComponent implements OnInit {
  myForm: FormGroup<UserForm>;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      firstName: '',
      lastName: '',
      age: 0,
    });
  }

  onSubmit() {
    const formValue = this.myForm.value;
    console.log(formValue);
  }
}
```

All the things work like before, but the `myForm: FormGroup<UserForm>;` is a little easier to read IMHO.

But we can go further with this. We can let our interface extend from the `FormGroup` and the use only the interface inside our component.

```ts
interface UserForm
  extends FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    age: FormControl<number>;
  }> {}

@Component(/* ... */)
export class FormSimpleGroupComponent implements OnInit {
  myForm: UserForm;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      firstName: '',
      lastName: '',
      age: 0,
    });
  }

  onSubmit() {
    const formValue = this.myForm.value;
    console.log(formValue);
  }
}
```

With this, our types are completely separated from our logic, but we have all the advantages of the new Angular typed reactive forms.

### Links

- [https://github.com/angular/angular/discussions/44513](https://github.com/angular/angular/discussions/44513)
- [https://angular.io/guide/typed-forms](https://angular.io/guide/typed-forms)
- [https://blog.angular.io/angular-v14-is-now-available-391a6db736af](https://blog.angular.io/angular-v14-is-now-available-391a6db736af)
- [PR Angular Forms to Untyped Forms](https://github.com/FabianGosebrink/angular-forms-workshop/pull/1/commits/4cfab30c13fb003e0a5b5c8e4e2476704cc607d9)
