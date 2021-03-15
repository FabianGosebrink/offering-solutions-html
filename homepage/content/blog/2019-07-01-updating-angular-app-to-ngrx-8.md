---
title: Updating your angular app to NgRx 8
date: 2019-07-01
tags: ['ngrx', 'angular']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to describe how I updated an Angular Project using ngrx to the latest version ngrx 8.

Github: [angular-ngrx-todo](https://github.com/FabianGosebrink/angular-ngrx-todo)

You can find the complete update commit here : [angular-ngrx-todo update commit](https://github.com/FabianGosebrink/angular-ngrx-todo/commit/c49dd9e62393ee9fcf83a991579255db631b320f#diff-dbcb66835482c63cedeaea1984878c14)

- [Preparations](#preparations)
- [Updating the actions](#updating-the-actions)
- [Updating the effects](#updating-the-effects)
- [Updating the reducer](#updating-the-reducer)
- [Updating the components](#updating-the-components)

## Preparations

I started updating the project with [update.angular.io](https://update.angular.io) and came to update the store with

```
ng update @ngrx/store
```

This will lift your version of `@ngrx/store` and `@ngrx/effects` to version 8

Before:

```
"@ngrx/effects": "^7.3.0",
"@ngrx/store": "^7.3.0",
```

After:

```
"@ngrx/effects": "^8.0.1",
"@ngrx/store": "^8.0.1",
```

If it des not update the related packages automatically, you can easily run

```
npm install @ngrx/entity@latest
npm install @ngrx/effects@latest
npm install @ngrx/data@latest
npm install @ngrx/router-store@latest
```

by yourself.

## Updating the actions

What I maybe love the most about the new ngrx version is the `createAction(...)` method which can be imported from `@ngrx/store`

```
import { createAction, props } from '@ngrx/store';
```

With this method we can create actions instead of the old style

```
export enum ActionTypes {
  LoadAllTodos = '[Todo] Load Todos',
  LoadAllTodosFinished = '[Todo] Load Todos Finished',

  //...many more actions
}

export class LoadAllTodosAction implements Action {
  readonly type = ActionTypes.LoadAllTodos;
}

export class LoadAllTodosFinishedAction implements Action {
  readonly type = ActionTypes.LoadAllTodosFinished;
  constructor(public payload: Todo[]) {}
}

//...many more actions

export type TodoActions =
  | LoadAllTodosAction
  | LoadAllTodosFinishedAction;

```

With a new style which takes less less code:

```
export const loadAllTodos = createAction('[Todo] Load Todos');

export const loadAllTodosFinished = createAction(
  '[Todo] Load Todos Finished',
  props<{ payload: Todo[] }>()
);
```

That's it. No enums or summarized types anymore, its a call to `createAction()` either with one parameter as a string describing your action or with a second parameter describing what payload the action should take. These properties are introduced with the generic `props<...>` type which takes an object holding all your payload parameters.

As a side note: In other files I imported all the actions directly afterwards from that action file I did like:

```
import {
  ActionTypes,
  AddTodoAction,
  AddTodoFinishedAction,
  LoadAllTodosFinishedAction,
  LoadSingleTodoAction,
  LoadSingleTodoFinishedAction,
  SetAsDoneAction,
  SetAsDoneFinishedAction,
  DeleteTodoAction,
  DeleteTodoFinishedAction
} from './todo.actions';
```

Which I do now via a oneliner and renaming the import like

```
import * as todoActions from './todo.actions';
```

IMHO I think this is easier to handle.

## Updating the effects

Before in the old versions we piped into the action stream and filtered the actions which are interesting for that effect with the `ofType` decorator like this:

```
  @Effect()
  loadTodos$ = this.actions$.pipe(
    ofType(ActionTypes.LoadAllTodos),
    switchMap(() =>
      this.todoService
        .getItems()
        .pipe(
          map(
            (todos: Todo[]) => new LoadAllTodosFinishedAction(todos),
            catchError(error => of(error))
          )
       )
    )
  );
```

Now effects are created with the `createEffect(...)` method which can also be imported from `import { ..., createEffect } from '@ngrx/effects';`. Also the `@Effect()` Decorator is gone. Having done that we are calling the method with the appropriate fat arrow function to pass

```
import { Actions, ofType, createEffect } from '@ngrx/effects';

...

  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(todoActions.loadAllTodos),
      switchMap(action =>
        this.todoService.getItems().pipe(
          map(todos => todoActions.loadAllTodosFinished({ payload: todos })),
          catchError(error => of(error))
        )
      )
    )
  );

```

Please note that I named the parameter in the created action `payload` and therefore I have to create a new object and fill the parameter `payload` with the result of the service method which I named `todos` here.

```
map(todos => todoActions.loadAllTodosFinished({ payload: todos })),
```

If you would create the action like

```
export const loadAllTodosFinished = createAction(
  '[Todo] Load Todos Finished',
  props<{ todos: Todo[] }>()
);
```

you could use the short term syntax in the effect like

```
map(todos => todoActions.loadAllTodosFinished({ todos })),
```

here. But that is for the record.

## Updating the reducer

Another really nice part is to update the reducer. The reducer was often called old school because of that massive switch/case statement. This is gone now.

So the old switch/case

```
export function myReducer(
  state = initialState,
  action
): State {
  switch (action.type) {
    case action1: {
      return { ... };
    }

    case action2: {
      return { ... };
    }

    case action3: {
      return { ... };
    }

    default: {
      return state;
    }
  }
}
```

turns to a new usage of the `on(...)` method

```
import { createReducer, on, Action } from '@ngrx/store';

...

const myReducer = createReducer(
  initialState,
  on(action1, state => ({ ... })),
  on(action2, state => ({ ... })),
  on(action3, state => ({ ... })),
);

export function reducer(state: State | undefined, action: Action) {
  return myReducer(state, action);
}
```

So in the conrete case of loading todos we had a state like this:

```
export interface ReducerTodoState {
  items: Todo[];
  selectedItem: Todo;
  loading: boolean;
}

export const initialState: ReducerTodoState = {
  items: [],
  selectedItem: null,
  loading: false
};
```

which was untouched. The reducer was created with the `createReducer(...)` method passing it the initialstate as a first argument.

```
const todoReducerInternal = createReducer(
  initialState,
  ...
);
```

The default case is automatically returned, it needs no statement anymore.

With the help of the `on(...)` method we can now handle all the actions we are interested in:

```
import * as todoActions from './todo.actions';

...

const todoReducerInternal = createReducer(
  initialState,
  on(
    todoActions.loadAllTodos,
    state => ({
      ...state,
      loading: true
    })
  ),
  on(todoActions.loadAllTodosFinished, (state, { payload }) => ({
    ...state,
    loading: false,
    items: [...payload]
  })),
  on(..., (state, { payload }) => ({
    ...state,
    ... // more stuff
  })),
);
```

So the complete old reducer was:

```
export function todoReducer(
  state = initialState,
  action: TodoActions
): ReducerTodoState {
  switch (action.type) {
    case ActionTypes.AddTodo:
    case ActionTypes.LoadAllTodos:
    case ActionTypes.LoadSingleTodo:
    case ActionTypes.SetAsDone: {
      return {
        ...state,
        loading: true
      };
    }

    case ActionTypes.AddTodoFinished: {
      return {
        ...state,
        loading: false,
        items: [...state.items, action.payload]
      };
    }

    case ActionTypes.LoadAllTodosFinished: {
      return {
        ...state,
        loading: false,
        items: [...action.payload]
      };
    }

    case ActionTypes.LoadSingleTodoFinished: {
      return {
        ...state,
        loading: false,
        selectedItem: action.payload
      };
    }

    case ActionTypes.SetAsDoneFinished: {
      const index = state.items.findIndex(x => x.id === action.payload.id);

      state.items[index] = action.payload;

      return {
        ...state,
        loading: false
      };
    }

    default:
      return state;
  }
}
```

You can see in the github that I had multiple actions in the switch/case statement as I wanted to activate the loading boolean as reaction to mutiple actions. Of course you can do this with the `on(...)` method, too. So my new reducer is:

```
const todoReducerInternal = createReducer(
  initialState,
  on(
    todoActions.addTodo,
    todoActions.deleteTodo,
    todoActions.loadAllTodos,
    todoActions.loadSingleTodo,
    todoActions.setAsDone,
    state => ({
      ...state,
      loading: true
    })
  ),
  on(todoActions.addTodoFinished, (state, { payload }) => ({
    ...state,
    loading: false,
    items: [...state.items, payload]
  })),
  on(todoActions.loadAllTodosFinished, (state, { payload }) => ({
    ...state,
    loading: false,
    items: [...payload]
  })),
  on(todoActions.loadSingleTodoFinished, (state, { payload }) => ({
    ...state,
    loading: false,
    selectedItem: payload
  })),
  on(todoActions.deleteTodoFinished, (state, { payload }) => ({
    ...state,
    loading: false,
    items: [...state.items.filter(x => x !== payload)]
  })),
  on(todoActions.setAsDoneFinished, (state, { payload }) => {
    const index = state.items.findIndex(x => x.id === payload.id);

    state.items[index] = payload;

    return {
      ...state
    };
  })
);
```

## Updating the components

As we have no Action Enum anymore and working directly with the methods created we have to update our components as well. Before we created a new class of the action with `new xyzAction(...)` or `new xyz(...)` like

```
import {
  LoadAllTodosAction
} from '@app/todo/store/todo.actions';


ngOnInit() {
    this.store.dispatch(new LoadAllTodosAction());
}
```

Now we can directly use that action without the `new` keyword anymore

```
import * as fromTodoStore from '@app/todo/store';

ngOnInit() {
    this.store.dispatch(fromTodoStore.loadAllTodos());
}
```

If you want to pass parameters to that action because it is expecting some you can easily to that by passing them directly into that function but wrapped in an object!

```
addTodo(item: string) {
    this.store.dispatch(fromTodoStore.addTodo({ payload: item }));
}

```

Again: If you would name the parameter `item` instead of `payload` you could use the short term syntax like `this.store.dispatch(fromTodoStore.addTodo({ item }));`

And that is it! You can check the links at the beginning of this post. This Post was also inspired by [this post](https://dev.to/angular/how-to-upgrade-your-angular-and-ngrx-apps-to-v8-4iip) from [@wesgrimes](https://twitter.com/wesgrimes) and this twitter conversation

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I always encourage writing. Even if there are other articles on the same topic, you bring a different perspective which is highly valued! Feel free to reference mine in yours if you want but not necessary.</p>&mdash; Wes (@wesgrimes) <a href="https://twitter.com/wesgrimes/status/1143974157295804416?ref_src=twsrc%5Etfw">June 26, 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

I hope this helps anyone.

Fabian
