---
title: Implement endless scroll with Angular, Ngrx and ASP.NET Core WebAPI
date: 2020-04-10
tags: ['angular', 'ngrx', 'aspnetcore']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to show how you can implement an endless scroll feature with Angular,Ngrx and ASP.NET Core in the backend.

All the code in the repository is only for demo purposes. Do not organize your files etc. like this in a productive app. It shows the concepts however and I hope you can use it in your apps!

Code is here [https://github.com/FabianGosebrink/angular-ngrx-endlessscroll](https://github.com/FabianGosebrink/angular-ngrx-endlessscroll)

<p align="center">
  <img src="https://github.com/FabianGosebrink/angular-ngrx-endlessscroll/blob/master/.github/endlessscroll-2.gif">
</p>

## Creating the ASP.NET Core backend

For the backend we need an ASP.NET Core WebAPI returning a large array of `Item`s in this case. For demo purposes we are defining a large collection here in a static list. Usually this values would come from a database.

With `dotnet new webapi` we are scaffolding a new webapi which we could run straight away, but we have to modify it a bit 😉

### Adding Cors

In the `Startup.cs` file we are adding the CORS-Feature to allow requests from our Angular clients server (`localhost:4200`) normally.

```cs
public void ConfigureServices(IServiceCollection services)
{
    // ...

    // Add this
    services.AddCors(options =>
    {
        options.AddPolicy("AllowAllOrigins",
            builder =>
            {
                builder
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
    });
}

// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    app.UseHttpsRedirection();

    // Add this
    app.UseCors("AllowAllOrigins");

    app.UseRouting();

    // ...
}

```

Having done that we can create a controller which will provide a simple large data set.

But first we have to create the models we are dealing with. To keep it simple we are using an `Item.cs` model and a `Filter.cs` model which we will come back to for the endless scroll in the end.

```cs
public class Item
{
    public string Id { get; set; }
    public string Value { get; set; }
}
```

```cs
public class Filter
{
    public int Skip { get; set; }
    public int Take { get; set; } = 20;
}

```

The `Skip` and `Take` properties are useful for shaping the data later on.

Next we create a new file `ValuesController.cs` and model it like this

```cs
[ApiController]
[Route("api/[controller]")]
public class ValuesController : ControllerBase
{
    private static List<Item> _items = new List<Item>();

    public ValuesController()
    {
        for (int i = 0; i < 1000; i++)
        {
            _items.Add(new Item() { Id = Guid.NewGuid().ToString(), Value = GetRandomString() });
        }
    }

    [HttpGet]
    public IActionResult GetValues([FromQuery] Filter filter)
    {
        return Ok(_items.Skip(filter.Skip).Take(filter.Take));
    }

    private string GetRandomString()
    {
        // returns a random string
    }
}

```

So basically we only have one method here which reacts to a `GET` Call to `https://localhost:501/api/values` and returns the first 20 entries from a dataset which holds a thousand entries. `Skip` is 0 and `Take` has a initial value of 20 right now.

The method takes the `FilterModel` from the query string with the `[FromQuery]` Attribute. So sending `https://localhost:501/api/values?skip=20` will be automatically serialized into this model and we can work with it. This provides full control for the client.

With `dotnet watch run` we can start our webapi and just keep it running. When something changes the webapi will restart automatically.

## Creating the frontend

For the Frontend we will create a new app with `ng new endlessscrollngrx` in a separate `client` folder.

First we will create the interfaces for the types we are sending around like `Item` and `ItemFilter.

```ts
export interface Item {
  id: string;
  value: string;
}

export interface ItemFilter {
  skip?: number;
  take?: number;
}
```

### Adding the data service

As the data- or api-service we will create an `ItemsApiService` which will do the communication for us to the backend. First we have to include the `HttpClientModule` into the `AppModule`

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule, // Add this
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

and then use the `HttpClient` in the `ItemsApiService`

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ItemFilter, Item } from '../item';

@Injectable({ providedIn: 'root' })
export class ItemsApiService {
  constructor(private http: HttpClient) {}

  getAllItems(filterDto?: ItemFilter) {
    const url = 'https://localhost:5001/api/values';
    const filter = this.turnFilterIntoUrl(filterDto);

    return this.http.get<Item[]>(`${url}${filter}`);
  }

  private turnFilterIntoUrl(filterDto?: ItemFilter) {
    if (!filterDto) {
      return '';
    }

    if (!Object.entries(filterDto).length) {
      return '';
    }

    let urlFilter = '?';

    for (const [key, value] of Object.entries(filterDto)) {
      urlFilter += `${key}=${value}&`;
    }

    return urlFilter.substring(0, urlFilter.length - 1);
  }
}
```

The service provides only one method `getAllItems` which can be called with an `ItemFilter` as parameter. If it was the `turnFilterIntoUrl` composes the filter keys and values into a valid url string. So `skip` and `take` are part of the url so that we can call the backend with the `[FromQuery]` parameter in C# as seen above in the backend. The `url` just points to the backend directly.

### Adding Ngrx

Now let us add `ngrx` with stores and - because we have external data communication - also `ngrx` effects.

If we run

```cmd
ng add @ngrx/store && ng add @ngrx/effects
```

it will add the ngrx store and the effects for us. They will be added to the `AppModule` automatically.

```ts
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    // ---
    StoreModule.forRoot(),
    EffectsModule.forRoot(),
    // ---
    HttpClientModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

After having done this we will create a `store` folder and create the files

- item.actions.ts
- item.effects.ts
- item.reducer.ts
- item.selectors.ts

  and

- index.ts

to the folder.

```
.
├── app
│ ├── services
│ │ └── items-api.service.ts
│ ├── store
│ │ ├── index.ts
│ │ ├── item.actions.ts
│ │ ├── item.effects.ts
│ │ ├── item.reducer.ts
│ │ └── item.selectors.ts
│ ├── ...
├── environments
│ ├── ...
├── favicon.ico
├── index.html
├── main.ts
├── polyfills.ts
├── styles.css
└── test.ts
```

#### Adding the actions

Let us first define the actions we can dispatch to the store. First of all we need an action to get all items `getItems`. So far so good. We will define one more action to separate the call when more actions should be loaded to the initial call, let us call it `getMoreItems`. We will need an action for successful completion with a payload and an error action. That's it. Here we go!

```ts
import { createAction, props } from '@ngrx/store';
import { Item } from '../item';

const prefix = `[Home]`;

export const getItems = createAction(`${prefix} getItems`);
export const getMoreItems = createAction(`${prefix} getMoreItems`);

export const getItemsComplete = createAction(
  `${prefix} getItemsComplete`,
  props<{ payload: Item[] }>()
);

export const error = createAction(
  `${prefix} homeError`,
  props<{ payload: any }>()
);
```

The `payload` taken from the `getItemsComplete` action is a simple `Item[]` which it takes the action with it.

#### Adding the effects

Before we go to the reducer let's us add the effects as we have the service already and can connect the effects with the actions and the service easily.

The `getAllItems$` effect is pretty straight forward as we filter the `action$` stream with our action call the service and return the `getItemsComplete` action.

```ts
getAllItems$ = createEffect(() =>
  this.actions$.pipe(
    ofType(appActions.getItems),
    switchMap(() =>
      this.apiService.getAllItems().pipe(
        map((result) => appActions.getItemsComplete({ payload: result })),
        catchError((error) =>
          of(appActions.error({ payload: JSON.stringify(error) }))
        )
      )
    )
  )
);
```

The `getMoreItems$` does _not_ take any parameters from the outside (which we could absolutely extend it to) but for getting the items to skip - because they are already loaded and we want to fetch the _next_ 20 items we use the `withLatestFrom()` operator. In it we are asking the store about the length of the current items, so what we have right now is what we want to skip. We will write the selector later, just read on 😊😊

```ts
getMoreItems$ = createEffect(() =>
  this.actions$.pipe(
    // Filter all actions and only let `getMoreItems` through
    ofType(appActions.getMoreItems),

    // Ask the store about the length o the items we already have
    withLatestFrom(this.store.pipe(select(selectAllItemsLength))),

    // map the result we have only into the skip, because we are currently only interested in that
    map(([{}, skip]) => skip),

    // hang on the first observable and resolve it, take the skip parameter out
    // and return another observable to keep the stream like always.
    switchMap((skip) =>
      this.apiService.getAllItems({ skip }).pipe(
        map((result) => appActions.getItemsComplete({ payload: result })),
        catchError((error) =>
          of(appActions.error({ payload: JSON.stringify(error) }))
        )
      )
    )
  )
);
```

In the `.getAllItems({ skip })` we are passing in the filter object giving the skip parameter which will be read from the backend.

Complete effects are then:

```ts
export class ItemEffects {
  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private apiService: ItemsApiService
  ) {}

  getAllItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.getItems),
      switchMap(() =>
        this.apiService.getAllItems().pipe(
          map((result) => appActions.getItemsComplete({ payload: result })),
          catchError((error) =>
            of(appActions.error({ payload: JSON.stringify(error) }))
          )
        )
      )
    )
  );

  getMoreItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.getMoreItems),
      withLatestFrom(this.store.pipe(select(selectAllItemsLength))),
      map(([{}, skip]) => skip),
      switchMap((skip) =>
        this.apiService.getAllItems({ skip }).pipe(
          map((result) => appActions.getItemsComplete({ payload: result })),
          catchError((error) =>
            of(appActions.error({ payload: JSON.stringify(error) }))
          )
        )
      )
    )
  );

  error$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(appActions.error),
        tap((error) => console.log(error))
      ),
    { dispatch: false }
  );
}
```

#### Adding the reducer

The reducer is basically simple and makes it pretty easy to combine the items we already have with the new ones which were coming. This is one of the reasons I think ngrx fits very well to the solve of the problem of an endless scroll here.

```ts
import { createReducer, on } from '@ngrx/store';
import * as appActions from './item.actions';
import { Item } from '../item';

export interface AppState {
  itemState: ItemState;
}

export interface ItemState {
  items: Item[];
  loading: boolean;
}

export const initialState: ItemState = {
  items: [],
  loading: false,
};

export const itemReducer = createReducer(
  initialState,

  on(appActions.getItems, appActions.getMoreItems, (state) => {
    return {
      ...state,
      loading: true,
    };
  }),

  on(appActions.getItemsComplete, (state, { payload }) => {
    return {
      ...state,
      items: [...state.items, ...payload],
      loading: false,
    };
  })
);
```

First we define an `AppState` to have a representation of the state of our complete app. We will use this one later when we compose the selectors.

The concrete state is the `ItemState` which only has an `items` and a `loading` property. One can be an array, the other one is boolean indicating wether we are currently loading items or not.

The reducer itself first sets `loading` to `true` every time we ask for some items, so when the action `getItems` or `getMoreItems` comes around.

The action `getItemsComplete` however takes the payload and uses the spread operator to set the new items just at the bottom of a new array. The top are the old items we already have.

```ts
on(appActions.getItemsComplete, (state, { payload }) => {
  return {
    ...state,
    items: [...state.items, ...payload],
    loading: false,
  };
});
```

Is nice and simple imho and we have a simple interface to our components now, because the state itself only hold one array with n items in it.

To make it easier for the components (and developers) let us ...

#### Add the selectors

The selectors are very powerful (I love them since I got into them a bit) and give us like an api to our store. So this is where the logic is if we want to ask for state slices, combine them, filter them etc.

First we need to ask our `AppState` to give us the part where the feature is: Underneath the property `itemState`. So we write a selector for this little part of logic:

```ts
export const selectItemState = (state: fromReducer.AppState) => state.itemState;
```

We can use this one to ask for allItems, for the length of all items (because our effects need it, remember?) and we can ask for the `loading` property.

```ts
import * as fromReducer from './item.reducer';
import { createSelector } from '@ngrx/store';

export const selectItemState = (state: fromReducer.AppState) => state.itemState;

export const selectAllItems = createSelector(
  selectItemState,
  (state: fromReducer.ItemState) => state.items
);

export const selectAllItemsLength = createSelector(
  selectItemState,
  (state: fromReducer.ItemState) => state.items.length
);

export const selectIsLoading = createSelector(
  selectItemState,
  (state: fromReducer.ItemState) => state.loading
);
```

Having done that we have the `index.ts` file left. I like to use this file to combine things and resolve them clearly, making the registration in the `AppModule` or wherever needed more precise and clear. The import is just `import ... from '../store';` then instead having wild imports all around the app.

In the `index.ts` file can prepare the array which we have to register in the `EffectsModule(...)` in the `AppModule` and we can define what we want to pass into the `StoreModule.forRoot(...)`.

So this is what the file is looking like

```ts
import { ItemEffects } from './item.effects';
import { ActionReducerMap } from '@ngrx/store';
import { AppState, itemReducer } from './item.reducer';

export * from './item.selectors';
export * from './item.actions';

export const appEffects = [ItemEffects];
export const appReducers: ActionReducerMap<AppState> = {
  itemState: itemReducer,
};
```

Alright, we are almost done.

#### Registering ngrx in the AppModule

Basically we have two things to consider here: The `StoreModule` and the `EffectsModule`. Because we prepared everything in the `store/index.ts` file we can make our lives very easy here:

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { itemEffects, appReducers } from './store';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    StoreModule.forRoot(appReducers), // register the AppState
    EffectsModule.forRoot(appEffects), // register the Effects
    HttpClientModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Consuming ngrx in the component

The component is the part where we get to our selectors and dispatch the actions in this case.

```ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from './item';
import { Store, select } from '@ngrx/store';
import { selectAllItems, selectIsLoading, getItems } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  items$: Observable<Item[]>;
  isloading$: Observable<boolean>;
  title = 'endlessscrollngrx';

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.items$ = this.store.pipe(select(selectAllItems));
    this.isloading$ = this.store.pipe(select(selectIsLoading));

    this.store.dispatch(getItems());
  }
}
```

We expose two properties `items$` and `isloading$` here. Both of them are receiving their info from the store through the selectors we implemented and we are dispatching the initial action of `getItems()`.

Now if we want to check if the user scrolled we can use the `window.onscroll` event and calculate if we have to load more items. If yes we dispatch the action of `getMoreItems()` which then uses the length of the items in the store in the effects etc. You get the idea. 😀

```ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from './item';
import { Store, select } from '@ngrx/store';
import {
  selectAllItems,
  selectIsLoading,
  getItems,
  getMoreItems,
} from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  items$: Observable<Item[]>;
  isloading$: Observable<boolean>;
  title = 'endlessscrollngrx';

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.items$ = this.store.pipe(select(selectAllItems));
    this.isloading$ = this.store.pipe(select(selectIsLoading));

    this.store.dispatch(getItems());

    // ADD THIS
    window.onscroll = () => {
      const scrollHeight = document.body.scrollHeight;
      const totalHeight = window.scrollY + window.innerHeight;

      if (totalHeight >= scrollHeight) {
        this.store.dispatch(getMoreItems());
      }
    };
  }
}
```

You can not run the backend in the `server` folder with `dotnet run` to start the api, the frontend can be started with `npm start` in the `client` folder and there you should see an endless scroll :)

Happy scrolling!

Code is on github (see at the beginning of the article)

HTH

Fabian
