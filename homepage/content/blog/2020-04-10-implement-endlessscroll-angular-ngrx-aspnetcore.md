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
    // ----
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
