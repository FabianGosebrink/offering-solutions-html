---
title: Online and Offline Sync with Angular and IndexedDb
date: 2018-11-21
tags: ['angular', 'indexeddb']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: ['/blog/articles/2018/11/21/online-offline-sync-angular-indexeddb/']
---

In this blogpost I want to describe how to develop a todo application which stores the items in the IndexedDb and synchronises it later if the app gets back online.

After this blogpost you should have an example how to use the IndexedDb in your applications, how to register to the online and offline commands and send items if the event comes up.

The code to this blogpost can be found here [https://github.com/FabianGosebrink/Angular-Online-Offline-Sync](https://github.com/FabianGosebrink/Angular-Online-Offline-Sync)

## Introduction

When working with online and offline applications the first thing you think about is PWA right now which works offline and can give you data even with no active internet connection. Things are about to get interesting when we want to synchronise items. This means to detect when the internet connection changes, to react to this and, if back online, send the items back to the backend.

## Checking Online and Offline

Let's take a look on how to notice if we are online or offline. There is a built in browser functionality which takes care of this. [https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine) We only have to use this in Angular. Let us build a service to abstract that functionality and register to the events

```javascript
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class OnlineOfflineService {

  get isOnline() {
    return !!window.navigator.onLine;
  }

  constructor() {
    window.addEventListener('online', () => console.log('online'));
    window.addEventListener('offline', () => console.log('offline'));
  }
}
```

That is cool! But how do we throw an RxJs event if an online/offline event fires? Lets introduce a `Subject` to handle this and call a function which emits the `Subject` then.

```javascript
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class OnlineOfflineService {
  private internalConnectionChanged = new Subject<boolean>();

  get connectionChanged() {
    return this.internalConnectionChanged.asObservable();
  }

  get isOnline() {
    return !!window.navigator.onLine;
  }

  constructor() {
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }

  private updateOnlineStatus() {
    this.internalConnectionChanged.next(window.navigator.onLine);
  }
}
```

So when an event on `window` is coming up we call our `updateOnlineStatus()` method which fires our `Subject<boolean>`. We are proposing the private field to the outside world as an observable `asObservable()` in a getter called `connectionChanged()` to make it read-only for the consumers.

## The Todo-App

As the Todo-app itself is not the core point of this blogpost, I will just post the code for the form and the list that you have an impression of what is going on so far.

```javascript
export class Todo {
  public id: string;
  public value: string;
  public done: boolean;
}
```

```html
<div style="text-align:center">
  <h1>Welcome to {{ title }}!</h1>
</div>
<div>
  <form (ngSubmit)="addTodo()" [formGroup]="form">
    <input type="text" formControlName="value" />
    <button [disabled]="form.invalid">Add Todo</button>
  </form>
</div>
<div>
  <ul style="list-style-type: none;">
    <li *ngFor="let item of todos" class="todo-item">
      <span [ngClass]="{ inactive: item.done }">{{ item.value }}</span>

      <button class="todo-item-button" (click)="markAsDone(item)">Done</button>
    </li>
  </ul>
</div>
```

```javascript
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Angular-Online-Offline-Sync';
  form: FormGroup;

  todos: Todo[] = [];

  constructor() {
    this.form = new FormGroup({
      value: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    // do something
  }

  addTodo() {
    // do something else

    this.form.reset();
  }

  markAsDone(todo: Todo) {
    todo.done = !todo.done;
  }
}
```

## Todo Service

Now let us build a Todo service which saves the todo items

> We will have no backend here, but you can run http calls to your backend easily if you want.

As the todo item has a `public id: string;` which is a guid we can use the package [angular-uuid](https://www.npmjs.com/package/angular-uuid) and use it with `import { UUID } from 'angular2-uuid';` to create a guid. For the sake of simplicity we will only do an add and a get method here:

```javascript
import { Injectable } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { Todo } from '../models/todo';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private todos: Todo[] = [];

  addTodo(todo: Todo) {
    todo.id = UUID.UUID();
    todo.done = false;
    this.todos.push(todo);
  }

  getAllTodos() {
    return this.todos;
  }
}
```

Now lets use our `OnlineOfflineService` we just created and register to the `Subject` we created.

```javascript
import { OnlineOfflineService } from './online-offline.service';

@Injectable({ providedIn: 'root' })
export class TodoService {
  constructor(private readonly onlineOfflineService: OnlineOfflineService) {
    this.registerToEvents(onlineOfflineService);
  }

  //... other code

  private registerToEvents(onlineOfflineService: OnlineOfflineService) {
    onlineOfflineService.connectionChanged.subscribe(online => {
      if (online) {
        console.log('went online');
        console.log('sending all stored items');
      } else {
        console.log('went offline, storing in indexdb');
      }
    });
  }
}
```

So with that we are registered and know when something is happening to the online status.

## Working with the IndexedDb

To work with the IndexedDb we can use [Dexie.js](https://www.npmjs.com/package/dexie). Dexie has an interface acting as a wrapper around IndexedDb.

We can create a new database, provide a version and tell them what to store exactly.

```javascript
private createDatabase() {
  this.db = new Dexie('MyTestDatabase');
  this.db.version(1).stores({
    todos: 'id,value,done'
  });
}
```

So lets call this method in the constructor of our service

```javascript
// imports

@Injectable({ providedIn: 'root' })
export class TodoService {
  private db: any;

  constructor(private readonly onlineOfflineService: OnlineOfflineService) {
    this.registerToEvents(onlineOfflineService);

    this.createDatabase();
  }

  // ... stuff

  private createDatabase() {
    this.db = new Dexie('MyTestDatabase');
    this.db.version(1).stores({
      todos: 'id,value,done'
    });
  }

  // ... moar stuff
}
```

Now we can create methods to

- add an item to the IndexedDB, and
- send all items from the IndexedDb to the (imaginary) backend

```javascript
private addToIndexedDb(todo: Todo) {
  this.db.todos
    .add(todo)
    .then(async () => {
      const allItems: Todo[] = await this.db.todos.toArray();
      console.log('saved in DB, DB is now', allItems);
    })
    .catch(e => {
      alert('Error: ' + (e.stack || e));
    });
}

private async sendItemsFromIndexedDb() {
  const allItems: Todo[] = await this.db.todos.toArray();

  allItems.forEach((item: Todo) => {
    // send items to backend...
    this.db.todos.delete(item.id).then(() => {
      console.log(`item ${item.id} sent and deleted locally`);
    });
  });
}
```

If we want to add something to the IndexedDb we can call the `add` method and get a promise in return. With the `then()` syntax we only give a console log about the current state about the IndexedDb.

Sending the items however is getting all items, looping over it, sending it and delta them locally if sending was successful.

So there are two things left to do:

- Adding the items to the IndexedDb in case of offline
- when getting back online, sending allitems and deleting them locally

First one can be achieved in our `AddTodo()` method. We can extend it asking for the online status:

```javascript
addTodo(todo: Todo) {
  todo.id = UUID.UUID();
  todo.done = false;
  this.todos.push(todo);

  if (!this.onlineOfflineService.isOnline) {
    this.addToIndexedDb(todo);
  }
}
```

The user now does not know where the items are stored and he should not worry about this.

The second point can be done with calling the `sendItemsFromIndexedDb()` method in case we get back online.

```javascript
private registerToEvents(onlineOfflineService: OnlineOfflineService) {
  onlineOfflineService.connectionChanged.subscribe(online => {
    if (online) {
      console.log('went online');
      console.log('sending all stored items');

      this.sendItemsFromIndexedDb();

    } else {
      console.log('went offline, storing in indexdb');
    }
  });
}
```

## Extending the Component

Now as the service is ready we can use this service inside our component and extend this a bit.

```javascript
export class AppComponent implements OnInit {
  title = 'Angular-Online-Offline-Sync';
  form: FormGroup;

  todos: Todo[] = [];

  constructor(
    private readonly todoService: TodoService,
    public readonly onlineOfflineService: OnlineOfflineService
  ) {
      // stuff
  }

  ngOnInit() {
    this.todos = this.todoService.getAllTodos();
  }

  addTodo() {
    this.todoService.addTodo(this.form.value);
    this.form.reset();
  }

  markAsDone(todo: Todo) {
    todo.done = !todo.done;
  }
}
```

Our `addTodo()` is calling our `todoService` which is handling our data storage then. In the constructor we are injecting our `OnlineOfflineService` public so that we can access it from the template asking for the online status like

```html
<p>
  current status: {{ onlineOfflineService.isOnline ? 'online' : 'offline' }}
</p>
<div>
  <form (ngSubmit)="addTodo()" [formGroup]="form">
    <input type="text" formControlName="value" />
    <button [disabled]="form.invalid">Add Todo</button>
  </form>
</div>
<div>
  <ul style="list-style-type: none;">
    <li *ngFor="let item of todos" class="todo-item">
      <span [ngClass]="{ inactive: item.done }">{{ item.value }}</span>

      <button class="todo-item-button" (click)="markAsDone(item)">Done</button>
    </li>
  </ul>
</div>
```

With this we have seen how we can add items to a list wether the app is online or not. With the `navigator` event we are able to react to the event if a browser changes online and offline status. This combined with RxJs can help us reacting to the event in Angular and store items locally before syncing or send them directly.

HTH

Fabian
