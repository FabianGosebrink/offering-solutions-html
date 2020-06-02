---
title: Getting started with ASP.NET Core Blazor
date: 2020-06-10
tags: ['blazor', 'webassembly', 'aspnetcore']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to show how to get started with ASP.NET Core Blazor by creating a simple Todo Application with forms, container and presentational components synchronized with SignalR.

Let's get started.

## Prerequisites

Make sure you have installed all of the listed software underneath. This is very important as without them the application does not work.

- [Visual Studio 2019 16.6](https://visualstudio.microsoft.com/downloads/?utm_medium=microsoft&utm_source=docs.microsoft.com&utm_campaign=inline+link&utm_content=download+vs2019) or later with the ASP.NET and web development workload
- [.NET Core 3.1 SDK](https://dotnet.microsoft.com/download/dotnet-core/3.1) or later

## Scaffolding the client project

When creating a new project select "Create a new project" --> "Blazor App" --> (Give your naming and folders then) --> "Blazor WebAssembly App" as we are not going to use the server part only but the WebAssembly part of ASP.NET Core's Blazor Framework.

> I personally switch back to VSCode in this part but you can stay in VS if you want to.

The project should look something like this now:

```
.
├── Pages
│   ├── Counter.razor
│   ├── FetchData.razor
│   └── Index.razor
├── Shared
│   ├── MainLayout.razor
│   ├── NavMenu.razor
│   └── SurveyPrompt.razor
├── wwwroot
│   ├── ...
│   ├── sample-data
│   │   └── weather.json
│   ├── favicon.ico
│   └── index.html
├── _Imports.razor
├── App.razor
├── <ProjectName>.csproj
└── Program.cs
```

## Deleting not used Files

As we have created the project we can remove the files we do not need for now.

```
.
├── Pages
│   ├── Counter.razor             <<< DELETE THIS
│   ├── FetchData.razor           <<< DELETE THIS
│   └── Index.razor
├── Shared
│   ├── MainLayout.razor
│   ├── NavMenu.razor
│   └── SurveyPrompt.razor        <<< DELETE THIS
├── wwwroot
│   ├── sample-data               <<< DELETE THIS
│   │   └── weather.json
│   ├── favicon.ico
│   └── index.html
├── _Imports.razor
├── App.razor
├── <ProjectName>.csproj
└── Program.cs
```

> I am aware that the scaffolding can be done in other ways but for the sake of simplicity this is the easiest way to get started for now.

## Examine the files

Without going into all of the details let us shortly examine the files a little.

The `Project.cs` starts the whole application and in it we are gonna add all our services and - very important - the root component of our app. initially this is `app`.

```cs
public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebAssemblyHostBuilder.CreateDefault(args);
        builder.RootComponents.Add<App>("app");

        await builder.Build().RunAsync();
    }
}
```

If you now take a look into the `index.html` file you can see that there is a custom tag `<app></app>` which is filled with a "Loading..." string which is getting replaced by the root component when it got loaded.

```html
<!DOCTYPE html>
<html>
  <body>
    <app>Loading...</app>
  </body>
</html>
```

This is how our application can be shown in the browser then :)

The `App.razor` file is the component which is getting rendered and basically is like a route outlet where the components are getting rendered in. It checks the route data and is using a default layout to display the routes and its components. (We gonna get later to the point where routes and components are connected).

If no route matches, it falls back to a `<NotFound></NotFound>` tag.

```html
<Router AppAssembly="@typeof(Program).Assembly">
  <Found Context="routeData">
    <RouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)" />
  </Found>
  <NotFound>
    <LayoutView Layout="@typeof(MainLayout)">
      <p>Sorry, there's nothing at this address.</p>
    </LayoutView>
  </NotFound>
</Router>
```

The `_Imports.razor` defines all the namespaces which should be used in the client. If some namespace can not be used in your client project maybe it is missing here.

## The NavMenu

The mavigation is a component in the `Shared` folder and provides the navigation. This is the first thing we are going to change as we will have a simple [Bootstrap starter template](https://getbootstrap.com/docs/4.5/examples/starter-template/). So we will change the content of this file to this.

```html
<nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
  <a class="navbar-brand" href="#">Navbar</a>
  <button
    class="navbar-toggler"
    type="button"
    data-toggle="collapse"
    data-target="#navbarsExampleDefault"
    aria-controls="navbarsExampleDefault"
    aria-expanded="false"
    aria-label="Toggle navigation"
  >
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarsExampleDefault">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item">
        <NavLink class="nav-link" href="" Match="NavLinkMatch.All">
          Home
        </NavLink>
      </li>
      <li class="nav-item">
        <NavLink class="nav-link" href="todo" Match="NavLinkMatch.Prefix">
          Todo
        </NavLink>
      </li>
    </ul>
  </div>
</nav>
```

We only need two links in the top menu. The links are provided with the `<NavLink></NavLink>` [Docs NavLink component](https://docs.microsoft.com/en-us/aspnet/core/blazor/routing?view=aspnetcore-3.1#navlink-component) component as it supports adding an `active` css class on the active link based on the route. So this is why our navigation item will look active and not inactive (greyed out).

## The MainLayout

The first file we are going to change is the `Mainlayout`. This layout is the base layout as used in the `app.razor` component and defines the basic layout and where the content (aka the body) should be rendered.

We will only use the Navigation here and render the body in its place

```html
@inherits LayoutComponentBase

<NavMenu />
@Body
```

The `@Body` placeholder is the place where the content, so the component the route points at, will be placed in or rendered.

## Blazor Pages

The `Pages` folder holds all main pages which can be addressed via routing. Pages can use different components. The `Index.razor` is the main starting point as it defines the route `/` on top of the file. We will replace it with the template from the bootstrap starter component.

```html
@page "/"

<main role="main" class="container">
  <div class="starter-template">
    <h1>Bootstrap starter template</h1>
    <p class="lead">
      Use this document as a way to quickly start any new project.<br />
      All you get is this text and a mostly barebones HTML document.
    </p>
  </div>
</main>
<!-- /.container -->
```

This is plain html except the first line `@page "/"` which tell the router _when the route / applies, render this page_. All good.

So we can add our `Todo` feature exactly here.
