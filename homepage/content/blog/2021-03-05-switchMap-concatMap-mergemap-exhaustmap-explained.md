---
title: switchMap, mergeMap, concatMap & exhaustMap explained
date: 2019-10-20
tags: ['rxjs', 'switchMap', 'mergeMap', 'concatMap', 'exhaustMap']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

With this article I want to briefly and shortly describe the differences between the rxjs operators `switchMap`, `mergeMap`, `concatMap` and `exhaustMap`.

The last article [tap, map & switchMap explained](https://offering.solutions/blog/articles/2019/10/20/tap-map-switchmap-explained/) is, depending on the stats, one if my most successful blogs ever. So I thought I could continue writing something about rxjs and the operators mentioned above.

As mentioned in [tap, map & switchMap explained](https://offering.solutions/blog/articles/2019/10/20/tap-map-switchmap-explained/):

> There are many blog posts out there which cover those topics already but maybe this helps to understand if the other posts did not help until here :)

The operators `switchMap`, `mergeMap`, `concatMap` and `exhaustMap` do not show any difference at first sight when they are called one time. They take a value, proceed it and return back a new observable.

The operators differ in how they treat values in an observable when multiple values get emitted right after each other. Maybe this is one of the most important things to understand. Observables give you the possibility to handle "values over time". So when the first value gets emitted, the second one, the third one etc. right after each other the `switchMap`, `mergeMap`, `concatMap` and `exhaustMap` behave differently.

Let us take a look at the behavior of those operators in specific next.

## Stackblitz

https://stackblitz.com/edit/angular-ivy-rfr8ru

## The situation

First let us imagine we have a long running operation like an HTTP call and after an amount of time the result comes back. We use a method which creates an observable and after two seconds it returns the value we pass in the function for the sake of simplicity and to simulate a long running task.

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

To explain `switchMap`, `mergeMap`, `concatMap` and `exhaustMap` let us _always_ assume that we call the method `anyLongRunningOp` _multiple times_! This is important. So we call it and immediately call the method again but the first call has not completed (hence the 2 seconds delay).

To be able to emit multiple observables we can create a `Subject` where we can write values in with `next(...)` and process it with the operator we want to take a look at.

```ts
sub = new Subject<string>();

fireEvents() {

  // Here we react ot everything which is fired in the subject
  this.sub
    // Here we can take the operator we want to take a look at which returns the
    // result from the anyLongRunningOp method which is the value itself
    // (for the sake of simplicity). The `tap` only prints out what
    // was just sent, does nothing to the stream!
    .pipe(
      tap(value => console.log("--> sent out", value)),
      [OPERATOR_HERE]((value) => this.anyLongRunningOp(value)))
    // We console.log the output, which is 'first' or 'second' or
    .subscribe(value => console.log("<-- received", value));

  // After subscribing we emit the two value in the observable, could also be more than that
  this.sub.next('first');
  this.sub.next('second');

  console.log("-------");
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

The `fireEvents()` method emits in the `Subject` `sub` two times one value each. First the value `first` and immediately after the value `second`. This value then gets processed by the operator we want to look how it behaves when multiple values come in.

## Similarities

All of those operators can be piped to an observable and return a new observable. They keep the stream. They resolve the value but return a new observable. This makes them higher order mapping operators. You can subscribe to the outcome but initially `switchMap`, `mergeMap`, `concatMap` and `exhaustMap` return an observable which then can be processed further.

## SwitchMap

Let us take the `switchMap` operator first. I explained it already in the previous post but let us take it as the first one and look how it behaves when multiple values come in.

```ts
fireEvents() {

  // Here we react ot everything which is fired in the subject
  this.sub
    // Here we can take the operator we want to take a look at which returns the
    // result from the anyLongRunningOp method which is the value itself
    // (for the sake of simplicity). The `tap` only prints out what
    // was just sent, does nothing to the stream!
    .pipe(
      tap(value => console.log("--> sent out", value)),
      switchMap(value => this.obsService.anyLongRunningOp(value))
    )
    // We console.log the output, which is 'first' or 'second' or
    .subscribe(value => console.log("<-- received", value));

  // After subscribing we emit the two value in the observable, could also be more than that
  this.sub.next("first");
  this.sub.next("second");

  console.log("-------");
}
```

The `switchMap` operator takes the first value in the stream `first` and calls the `anyLongRunningOp` with it. _Right after_ it did this it receives the second emit with the value `second`. Now it forgets about the response of the first request. It is not waiting for it. Like the HTTP request which could be done here is out and comes back any when but the `switchMap` operator does not care about the first one. It calls the `anyLongRunningOp` with the `second` parameter and waits for _that one_'s answer. And so with multiple ones, it is only interested in the response of the _last_ one it fired. Everything before got ignored.

![SwitchMap operator](https://cdn.offering.solutions/img/articles/2021-03-07/switchmap.gif)

In the animation you can see that only the value `second` is printed. This is the last one which got fired. The first response is ignored by the `switchMap` operator when a second one comes in and the first one is not finished yet.

## ConcatMap

Next one in the list is the `concatMap` operator. Let us assume the same method again:

```ts
fireEvents() {

  // Here we react ot everything which is fired in the subject
  this.sub
    // Here we can take the operator we want to take a look at which returns the
    // result from the anyLongRunningOp method which is the value itself
    // (for the sake of simplicity). The `tap` only prints out what
    // was just sent, does nothing to the stream!
    .pipe(
      tap(value => console.log("--> sent out", value)),
      concatMap(value => this.obsService.anyLongRunningOp(value))
    )
    // We console.log the output, which is 'first' or 'second' or
    .subscribe(value => console.log("<-- received", value));

  // After subscribing we emit the two value in the observable, could also be more than that
  this.sub.next("first");
  this.sub.next("second");

  console.log("-------");
}
```

We know that the `switchMap` operator is only interested in the most recent value which came in. It does not build a relation between everything which comes in and puts them in a queue. This is what the `concatMap` operator is for. It behaves like it has a queue and stores the incoming calls and emits the next one when the previous one came back! So when it receives the value with `first` it calls `anyLongRunningOp` with `first`, then the `second` value comes in. The `concatMap` operator now holds this call back until the `anyLongRunningOp` method comes back with the result of the call with `first` and _then_ the next call with `second` as parameter is being fired. It concatenates the calls and emits them one after another. As a side effect it builds a relation between the calls because it has to look wether the first one came back before it can emit the next one.

![ConcatMap operator](https://cdn.offering.solutions/img/articles/2021-03-07/concatmap.gif)

In the animation you can see that `first` and `second` got emitted and after two seconds the `first` call comes back and after another two seconds the `second` call comes back. `concatMap` here queues the requests and emits them when the previous one has finished.

## MergeMap

Let us take the `mergeMap` operator next. Again we are trying to see how it behaves if multiple values come in when the previous one does not have come back yet.

```ts
fireEvents() {

  // Here we react ot everything which is fired in the subject
  this.sub
    // Here we can take the operator we want to take a look at which returns the
    // result from the anyLongRunningOp method which is the value itself
    // (for the sake of simplicity). The `tap` only prints out what
    // was just sent, does nothing to the stream!
    .pipe(
      tap(value => console.log("--> sent out", value)),
      mergeMap(value => this.obsService.anyLongRunningOp(value))
    )
    // We console.log the output, which is 'first' or 'second' or
    .subscribe(value => console.log("<-- received", value));

  // After subscribing we emit the two value in the observable, could also be more than that
  this.sub.next('first');
  this.sub.next('second');

  console.log(`fired events 'first' and 'second'`);
}
```

The `mergeMap` operator does _not_ ignore the result of the previous emits and does _not_ wait for the second one to emit until the first one finished. It emits both calls _as they come in_. So if we emit `first` the operator calls the `anyLongRunningOp` with `first` and right after that it calls the `anyLongRunningOp` with `second`. It also listens to _both_ answers when they come back. When the `anyLongRunningOp` method comes back the first time with `first` we print out that result and right after this with `second` we print out this. These operations run in parallel. The operator does _not_ build a relation between these two calls. The first one which comes back gets processed first, the second one which comes back gets processed second. So the order of the return values is not guaranteed to be the order of the requests as they were sent out.

![mergemap operator](https://cdn.offering.solutions/img/articles/2021-03-07/mergemap.gif)

In the animation you can see that both values `first` and `second` get emitted and they come back almost at the same time. `mergeMap` emits them as they come in, both need two seconds to be processed and come back then. Nobody waits for the first one to complete (like `concatMap`) and nothing gets ignored (like `switchMap`).

## ExhaustMap

Then there is the `exhaustMap` operator left.

```ts
fireEvents() {

  // Here we react ot everything which is fired in the subject
  this.sub
    // Here we can take the operator we want to take a look at which returns the
    // result from the anyLongRunningOp method which is the value itself
    // (for the sake of simplicity). The `tap` only prints out what
    // was just sent, does nothing to the stream!
    .pipe(
      tap(value => console.log("--> sent out", value)),
      exhaustMap(value => this.obsService.anyLongRunningOp(value))
    )
    // We console.log the output, which is 'first' or 'second' or
    .subscribe(value => console.log("<-- received", value));

  // After subscribing we emit the two value in the observable, could also be more than that
  this.sub.next('first');
  this.sub.next('second');

  console.log(`fired events 'first' and 'second'`);
}
```

The `exhaustMap` operator takes care of the first request which comes in and ignores everything which comes in afterwards _until the first once came back_. So it is called with the value `first` and then with the value `second` which is ignored because the first one has not completed yet. So it ignores everything until the first value comes back.

![exhaustmap operator](https://cdn.offering.solutions/img/articles/2021-03-07/exhaustmap.gif)

IN the animation you can see it gets emitted with `first` and `second` but only the `first` emit is being processed. The `exhaustMap` ignored everything which comes after this until the `first` call came back after two seconds. Then it is ready to process the next value when it gets emitted again. Everything during the procedure of the first call gets ignored. So only the value `first` is printed in the example.

## Summary

It took me along while to understand those operators and for me it all became clearer when I understood the `switchMap` operator first.

Let us summarize those four operators:

- `switchMap`: emits values and is only interested in the very last one it sent. All the _responses_ of the calls before get ignored.
- `concatMap`: behaves like a queue: It stores all calls and sends one after another. If one is completed, the next one is being processed.
- `mergeMap`: Also sends all requests, like `concatMap` but does not wait until the response is coming back. It sends them out as they come. But it receives every response and does not ignore something. The order here is not guaranteed.
- `exhaustMap`: Emits the first request and ignores all future requests until the first one gets back. Then it is ready for a new one.

I hope this helped!

Thanks.

Fabian
