---
title: tap, map & switchMap explained
date: 2019-10-20
tags: ['rxjs', 'tap', 'map', 'switchmap']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

With this article I want to briefly and shortly describe the differences between the rxjs operators `tap`, `map` and `switchMap`.

There are many blogposts out there which cover those topics already but maybe this helps to understand if the other posts did not help until here :)

Let us start and first create a simple observable of an array with `from()`

```js
import { from } from 'rxjs';

const observable$ = from([1, 2, 3]);
```

If we now subscribe to it we could do something with the values which get emitted

```js
import { from } from 'rxjs';

const observable$ = from([1, 2, 3]);
observable$.subscribe(item => console.log(item));
```

In the console we should see the values `1,2,3` as an output.

Let us get to the first operator.

## Tap

Probably the easiest one is the `tap` operator as he is used for side effects inside a stream. So this operator can be used to do something inside a stream and returning the same observable as it was used on. Like a plain isolated side effect.

```js
import { from } from "rxjs";
import { tap } from "rxjs/operators";

from([1, 2, 3])
  .pipe(tap(item => /* do something with value */))
  .subscribe(item => console.log(item));
```

You can pass the `tap` operator up to three methods which all have the `void` return type because the original observable stays untouched. But that does not mean that you can not manipulate the items in the stream. 

Let us use reference types inside a `tap` operator. When using reference types the `tap` operator can modify the properties on the value you pass in.

```js
const objects = [
  { id: 1, name: "Fabian" },
  { id: 2, name: "Jan-Niklas" },
]

const source$ = from(objects).pipe(
 tap(item => item.name = item.name + "_2")
)
.subscribe(x => console.log(x));

```
Outcome:

```
  { id: 1, name: "Fabian_2" }
  { id: 2, name: "Jan-Niklas_2" }
```

So the `tap` operator does run the callback for each item it is used on, is used for side effects but returns an observable identical to the one from the source.

## Map

Let us move on and try another operator. Let us take `map` instead of `tap` now.

So we can take the same situation now and instead of `tap` we use the `map` operator. The code sample looks like this now:

```js
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

from([1, 2, 3])
  .pipe(map(item => item + 2))
  .subscribe(item => console.log(item));
```

Check the outcome now and see: The `map` operator _does_ have consequences on the output! Now you should see `3,4,5` in the console.

So what the `map` operator does is: It takes the value from a stream, can manipulate it and passes the manipulated value further to the stream again.

Adding a number is one example, you could also create new objects here and return them etc.

So to manipulate the items in the stream the `map` operator is your friend.

## SwitchMap

So there is the `switchMap` operator left. I personally needed a little time to get my head around this and I hope to clarify things here now. 😊

So let us took a look again at the `map` operator.

```js
import { from } from "rxjs";
import { map } from "rxjs/operators";

from([1, 2, 3])
  .pipe(map(item => /* does something */))
  .subscribe(item => console.log(item));
```

Now let us write the result of each line in a comment:

```js
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

// returns an observable
from([1, 2, 3])
  // getting out the values, modifies them, but keeps
  // the same observable as return value
  .pipe(map(item => item + 1))
  // resolving the observable and getting
  // out the values itself
  .subscribe(item => console.log(item));
```

We know that a `subscribe` does resolve an observable and gets out the values which are inside of the stream.

Let us now face a situation like this: You have a stream of a specific type, let us say a stream of numbers again. You need this numbers to do something else like passing it to a service to get an item based on that number but this service returns not a number like `item + 2` does but an observable again!

If you would use the `map` operator here lets play that through and write the output in comments again:

```js
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

// returns an observable
from([1, 2, 3])
  // getting out the values, using them, but keeps the same observable as return value.
  // In addition to that the value from the called method itself is a new observable now,
  // so we are retruning an observable of observable here!
  .pipe(map(item => methodWhichReturnsObservable(item)))
  // resolving _one_ observable and getting
  // out the values itself
  .subscribe(item => console.log(item));
```

What would the type of the `resultItem` in the `subscribe` be? We know that a `subscribe` is resolving an observable, so that we can get to its values. But it is resolving _one_ observable. We mapped our observable in a second observable because the `methodWhichReturnsObservable(item)` returns - surprise surprise - another observable.

So what we want is kind of a `map` operator, but it should resolve the first observable first, use the values and then switch to the next observable while keeping the stream! So that when we subscribe we get to the (real) values of the last observable. The `switchMap` operator does exactly that.

So writing that whole thing with the `switchMap` operator would be like:

```js
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";

// returns an observable
from([1, 2, 3])
    // getting out the values _and resolves_ the first
    // observable. As the method returns a new observable.
  .pipe(switchMap(item => methodWhichReturnsObservable(item))
   // => Get the real values of the last observable
  .subscribe(resultItem => console.log(resultItem));
```

In the last subscribe the values are picked out of the last observable.

I hope to have this explained in an understandable way.

Thanks.
