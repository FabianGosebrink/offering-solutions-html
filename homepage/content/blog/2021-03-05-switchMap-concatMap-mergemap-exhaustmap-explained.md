---
title: switchMap, mergeMap, concatMap & exhaustMap explained
date: 2019-10-20
tags: ['rxjs', 'switchMap', 'mergeMap', 'concatMap', 'exhaustMap']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

With this article I want to briefly and shortly describe the differences between the rxjs operators `switchMap`, `mergeMap`, `concatMap` and `exhaustMap`.

The last article [tap, map & switchMap explained](https://offering.solutions/blog/articles/2019/10/20/tap-map-switchmap-explained/) is, depending on the stats, one if my most successful blogs ever. So I thought I could continue writing something about those operators mentioned above.

As mentioned in the [tap, map & switchMap explained](https://offering.solutions/blog/articles/2019/10/20/tap-map-switchmap-explained/):

> There are many blog posts out there which cover those topics already but maybe this helps to understand if the other posts did not help until here :)

The operators differ in how they treat values inside on observable when multiple ones get emitted short after another. Maybe this is one of the most important things to understand. Observables give you the possibility to handle "values over time". So when the first one gets emitted, the second one, the third one etc. Depending on _when_ that happens the `switchMap`, `mergeMap`, `concatMap` and `exhaustMap` behave in a different way.

I want to describe the behavior next.

## The situation

First let us imagine we have a long running operation like an HTTP call and after an amount f this the result comes back. We can create a method which creates an observable and after two seconds it returns the value we pass in the function.

```ts
import { Observable } from "rxjs";

anyLongRunningOp(value: string) {
  return new Observable(observer => {
    setTimeout(() => {
      observer.next(value);
      observer.complete();
    }, 2000);
  });
}
```

This method does nothing but wait for two seconds and then return a value. Could be an HTTP call in the real world or something else asynchronous which takes a little bit of time.

Using this method would be like

```ts
// ...

anyLongRunningOp('value').subscribe((result) => {
  // after two seconds we get our subscribe called
  console.log(result); // <<<< logs 'value'
});
```

To explain `switchMap`, `mergeMap`, `concatMap` and `exhaustMap` let us _always_ assume that we call the method `anyLongRunningOp` _multiple times without having the first call being completed_! This is important. So we call it and immediately call the method again but the first call has not completed (hence the 2 seconds delay).

To be able to fire multiple observables we can create a `Subject` where we can write values in and process it with the operator we want to take a look at.

```ts
sub = new Subject<string>();

fireEvent() {

  // Here we react ot everything which is fired in the subject
  this.sub
    // Here we can take the operator we want to take a look at which returns the
    // result from the anyLongRunningOp method which is the value itself
    // (for the sake of simplicity)
    .pipe(<...>((value) => this.anyLongRunningOp(value)))
    // We just console.log the output, which is 'first' or 'second' or
    .subscribe(console.log);

  // After subscribing we fire the two value in the observable, could also be more than that
  this.sub.next('first');
  this.sub.next('second');

  console.log(`fired events 'first' and 'second'`);
}

anyLongRunningOp(value: string) {
  return new Observable(observer => {
    setTimeout(() => {
      observer.next(value);
      observer.complete();
    }, 2000);
  });
}
```

The `fireEvent()` method fires in the `Subject` `sub` two times. First the value `first` and immediately after the value `second`.

## Similarities

All of those operators can be piped to an observable and return a new observable. They keep the stream. They resolve the value but return a new observable. This makes them higher order mapping operators. Of course you can subscribe to the outcome but initially `switchMap`, `mergeMap`, `concatMap` and `exhaustMap` return an observable which then can be processed further.

## SwitchMap

Let us take the `switchMap` operator first. I explained it already in the previous post but let us take it as the first one and look how he behaves when multiple values come in.

```ts
fireEvent() {

  // Here we react ot everything which is fired in the subject
  this.sub
    // Here we can take the operator we want to take a look at which returns the
    // result from the anyLongRunningOp method which is the value itself
    // (for the sake of simplicity)
    .pipe(switchMap((value) => this.anyLongRunningOp(value)))
    // We just console.log the output, which is 'first' or 'second' or
    .subscribe(console.log);

  // After subscribing we fire the two value in the observable, could also be more than that
  this.sub.next('first');
  this.sub.next('second');

  console.log(`fired events 'first' and 'second'`);
}
```

The `switchMap` operator takes the first value in the stream `first` and calls the `anyLongRunningOp` with it. _Right after_ he did this he receives the second emit with the value `second`. What he does not is that he forgets about the first response. He is not waiting for it. Like the HTTP request which could be done here is out, comes back any when but the `switchMap` operator does not care about the first one. He calls the `anyLongRunningOp` with the `second` parameter and waits for _that one_'s answer. And so with multiple ones, he is only interested in the response of the _last_ one he just fired. Everything before got just swallowed.

Thanks.
