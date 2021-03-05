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

To explain `switchMap`, `mergeMap`, `concatMap` and `exhaustMap` let us _always_ assume that we call this method _multiple times without having the first call being completed_! This is important. So we call it and immediately call the method again but the first call has not completed (hence the 2 seconds delay).

Having this in mind let us take a look at the operators one after another:

## SwitchMap

Thanks.
