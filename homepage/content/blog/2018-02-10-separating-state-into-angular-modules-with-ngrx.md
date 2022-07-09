---
title: Separating state into angular modules with ngrx
date: 2018-02-10
tags: ['angular', 'ngrx']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  ['/blog/articles/2018/02/10/separating-state-into-angular-modules-with-ngrx/']
---

In this blog post I want to give you an explanation of the state tree of ngrx if you are working with a state and how to separate it into different modules.

## In this blog

1. [One state for your entire application with forRoot(...)](#forRoot)
2. [Separating state into modules with forFeature(...)](#forFeature)
3. [Conclusion](#conclusion)

If you are building smaller or large angular applications you will sooner or later face the problem to manage the state of your application. It gets influenced by a lot of things around which can be a button triggering a service - maybe with an http action - which will set your application in a different state.

## <a name="forRoot">One state for your entire application with forRoot(...)</a>

Let's take a state object for the whole application:

```
{ customerList = [], currentlyLoading = false }
```

The app's application state interface then looks like

```javascript
interface ApplicationState {
  currentlyLoading: boolean;
  customerList: any[];
}

export const initialState: ApplicationState = {
  currentlyLoading: false,
  customerList: [],
};
```

A reducer could manipulate this state like

```javascript
export function appReducer(
  state: ApplicationState = initialState,
  action: Action
): ApplicationState {
  switch (action.type) {
    case ANYACTION:
      return {
        ...state,
        // modify properties here
      };
    // more actions
    default:
      return state;
  }
}
```

which we can then use in our as follows:

```javascript
@NgModule({
  imports: [
    BrowserModule,
    StoreModule.forRoot({ applicationState: appReducer }),
  ],
})
export class AppModule {}
```

So imagine you have the following Angular application structure:

```
app
├── // modules, components and so on
├── app.component.ts
├── app.component.html
├── app.module.ts
└── main.ts
...
```

With the `forRoot` statement we apply the state which is the result of the appReducer at the application level. Hence, the whole application is aware of it and can react to its changes.

```javascript
StoreModule.forRoot({ applicationState: appReducer });
```

The state is now an object with a property called `applicationState` containing the value which the appReducers gives us as an output.

However, if we `console.log` it out..

```javascript
ngOnInit(): void {
    this.store.pipe(select<any>('applicationState'))
        .subscribe((appState: ApplicationState) => console.log(appState));
}
```

...we get the following result

`{currentlyLoading: false, customerList: Array(0)}`

An object with two properties on it. But why is that? Shouldn't it be an object (like the one from the `forRoot(..)`) with a property on it called `applicationState`?

Well, the `select` method in the code sample above is literally selecting the property "applicationState" and giving us back the result which is itself an object with two properties `currentlyLoading` and `customerList` on it.

Our state however is still an object like this

```
{
    applicationState: {
            currentlyLoading: false,
            customerList: Array(0)
        }
}
```

If you want to get the entire state printed out to your console, use a statement such as

```javascript
ngOnInit(): void {
this.store
    .select<any>((state: any) => state) // the complete state this time!!!
    .subscribe((completeState: any) => console.log(completeState));
}
```

## <a name="forFeature">Separating state into modules with forFeature(...)</a>

So our application state will be influenced my many things we do. We would divide those actions and areas of our application into different modules. This helps keeping everything more maintainable and it's much easier to navigate through the codebase.

As a result, you would possibly introduce a module which encapsulates and abstracts all your customer related things. So your application _could_ look like this:

```
app
└── customers
    ├── components
    ├── containers
    ├── customer.routing.ts
    └── customer.module.ts
├── app.component.ts
├── app.component.html
├── app.module.ts
└── main.ts
...
```

So we created a customers folder, where we have a place to put all the customer related stuff into. But now it would be an improvement if only the module itself track of its own state as it does this for its routes and so can fulfill the purpose of a completely seperated part of your application. Also concerning the state.

So we can apply our module state in a seperate module store which would be a seperate folder in the customers folder:

```
app
└── customers
    ├── components
    ├── containers
    └── store
        └── state/actions/reducers/effects...
    ├── customer.routing.ts
    └── customer.module.ts
├── app.component.ts
├── app.component.html
├── app.module.ts
└── main.ts
...
```

Similary we should handle our state object. The goal is that each feature module contributes it's own little part to the global state.
Hence, let's refactor our application state accordingly.

Luckily, Ngrx already provides a good mechanism for us to apply parts of the state to our main state. We already know the `forRoot()` method which applies a state at the root level. The `forFeature()` method allows to merge a part of the state to the global root-level one. So let's try that out: our AppState is now an empty model (which could have properties however) and the customer store gets the whole properties:

```javascript
interface CustomerState {
  currentlyLoading: boolean;
  customerList: any[];
}

export const initialState: CustomerState = {
  currentlyLoading: false,
  customerList: [],
};
```

app.module.ts

```javascript
@NgModule({
  imports: [
    BrowserModule,
    StoreModule.forRoot({
      /* an empty object here for this time */
    }),
  ],
})
export class AppModule {}
```

customer.module.ts

```javascript
@NgModule({
  imports: [
    StoreModule.forFeature('customerFeature', {
      customer: customerReducer,
    }),
  ],
  exports: [],
  declarations: [],
  providers: [],
})
export class CustomerModule {}
```

The customer reducer - customer is a feature module name here - manipulates the whole customer state now. As our AppState did exactly that before, we can move the reducer into the customer feature module and rename all the things.

The interesting part is the `forFeature` method above. Let's take a look at this:

```javascript
StoreModule.forFeature('customerFeature', {
  customer: customerReducer,
});
```

The `forFeature(...)` method merges an object to the root state which is only an empty object now. It takes the string and creates a property on the root state with that name which has an object itself with the property `customer` which itself again has the two properties from before. So our state would look like this now:

```
{
    customerFeature: {
        customer: {
            currentlyLoading: false,
            customerList: Array(0)
        }
    }
}
```

If we console log out the _complete_ state this time

```javascript
ngOnInit(): void {
this.store
    .select<any>((state: any) => state) // the complete state this time!!!
    .subscribe((completeState: any) => console.log(completeState));
}
```

we get exactly that result:

```
{
    customerFeature: {
        customer: {
            currentlyLoading: false,
            customerList: Array(0)
        }
    }
}
```

The `select` method now again gives us the possibility to get a part of the state like this

```javascript
ngOnInit(): void {
this.store
.select<any>('customerFeature')
.subscribe((customerState: CustomerState) => console.log(customerState));
}
```

we are selecting the property `customerFeature` and subscribing to that again. So the result of the console log looks like:

```
{
    customer: {
        currentlyLoading: false,
        customerList: Array(0)
    }
}
```

which would be the same result as we subscribe to the state like

```javascript
ngOnInit(): void {
this.store
    .select<any>((state: any) => state.customerFeature) // no strings here
    .subscribe((customerState: CustomerState) => console.log(customerState));
}
```

## <a name="conclusion">Conclusion</a>

So with the `forFeature(...)` method you can build your state object exactly as modular as you normally structure your application. That way we can follow the separation of concerns principle and make things easy to follow and nicely structured.

Of course all the `any`s can and probably should be replaced with interfaces to be type safe. ;)

You can see examples of states with multiple modules here: [https://github.com/FabianGosebrink/ASPNETCore-Angular-Ngrx](https://github.com/FabianGosebrink/ASPNETCore-Angular-Ngrx)
