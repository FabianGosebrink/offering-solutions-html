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

Before we do this we should create a `TodoService`.

## Adding the communication service

The service is responsible for handling the communication acting as a repository for getting and updating the todo items.

First we create a file called `TodoService.cs` and inject the `HttpClient` into the constructor. We add the `JsonSerializerOptions` and build up our endpoint address.

```cs
public class TodoService
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly string _todoEndpointUrl ;
    private readonly string _todoApi = "api/todos/";
    private readonly string _baseUrl = "https://localhost:5001/";

    public TodoService(HttpClient client)
    {
        _client = client;
        _todoEndpointUrl = $"{_baseUrl}{_todoApi}";
    }
}
```

Now we can add the method to add a Todo. We send a POST request to the endpoint with a `TodoDto` in the body. The `TodoDto` lies in a project called `BlazorTodoAoo.Shared` and can be used from server and client then. We return the new created tode item in case the caller of the method needs it.

```cs
public async Task<TodoDto> AddTodo(TodoDto createDto)
{
    var response = await _client.PostAsJsonAsync(_todoEndpointUrl, createDto);

    response.EnsureSuccessStatusCode();

    using var responseStream = await response.Content.ReadAsStreamAsync();
    return await JsonSerializer.DeserializeAsync<TodoDto>(responseStream, _jsonOptions);
}
```

Getting the todo items looks quite the same. We just fire a GET request to the url we created

```cs
public async Task<List<TodoDto>> GetTodos()
{
    var response = await _client.GetAsync(_todoEndpointUrl);

    response.EnsureSuccessStatusCode();

    using var responseStream = await response.Content.ReadAsStreamAsync();
    return await JsonSerializer.DeserializeAsync<List<TodoDto>>(responseStream, _jsonOptions);
}
```

Updating a Todo is pretty straight forward as well using a PUT request.

```cs
public async Task<TodoDto> UpdateTodo(TodoDto updateDto)
{
    var response = await _client.PutAsJsonAsync($"{_todoEndpointUrl}{updateDto.Id}", updateDto);

    response.EnsureSuccessStatusCode();

    using var responseStream = await response.Content.ReadAsStreamAsync();
    return await JsonSerializer.DeserializeAsync<TodoDto>(responseStream, _jsonOptions);
}
```

## Adding the components

Create a folder called `Todo`. Inside of that folder we create three razor components: `Todo.razor`, `TodoForm.razor` and `TodoList.razor`.
Also add the corresponding classes to the files called `Todo.razor.cs`, `TodoForm.razor.cs` and `TodoList.razor.cs`. These files are automatically recognized by Visual Studio to be the corresponding classes to the components.

What we want to build is:

```

                   +-------------------+
                   |                   |
                   |                   |
        +--------> |       Todo        | <--------+
        |          |                   |          |
        |          |                   |          |
        |          +-------------------+          |
        |                                         |
        v                                         v
+-------+---------+                    +----------+------+
|                 |                    |                 |
|                 |                    |                 |
|    TodoList     |                    |    TodoForm     |
|                 |                    |                 |
|                 |                    |                 |
|                 |                    |                 |
+-----------------+                    +-----------------+

```

`TodoList` throws an event iff an item is marked as done and gets given the current todo items as parameter. The todo form throws an event with the new todo item to the todo component which communicates to the API then.

### Todo List Component

The `TodoList.razor` takes a list of items from the outside and displays them. It acts as a presentational component not worrying about where the data comes from but to display it correctly.

In its csharp file we implement an partial class inheriting from the `ComponentBase` class. Inside f this we can define Properties with the `[Parameter]` attribute which describes this is a property we can bind data to or get data from (`EventCallback`). We can fire the event to the outside world by invoking the event callback.

```cs
public partial class TodoList : ComponentBase
{
    [Parameter]
    public List<TodoDto> TodoModels { get; set; }

    [Parameter]
    public EventCallback<TodoDto> TodoUpdated { get; set; }

    private void ToggleDone(TodoDto todoDto)
    {
        todoDto.Done = !todoDto.Done;
        TodoUpdated.InvokeAsync(todoDto);
    }
}
```

The method `ToggleDone` takes a `TodoDto` as parameter, changes the `Done` property and fires the event to the outside then.

In the html we can iterate over the passed in `TodoModels` and display them in ul/li tags from the used bootstrap framework.

We also add an `input` typed as a checkbox and bind the `.Done` property to it. If it changes, we call the `ToggleDone` method we just implemented.

```html
<h3>TodoList</h3>

<ul class="list-group">
    @foreach (var TodoModel in TodoModels)
    {
    <li class="list-group-item" style="color:@(TodoModel.Done ? "lightgray" : "inherit");">

        <input type="checkbox" checked="@TodoModel.Done" @onchange="e => ToggleDone(TodoModel)">
        @TodoModel.Value
    </li>
    }
</ul>
```

## Todo Form Component

The form component is responsible for providing a form the user can add a todo with. We again create a partial class with an `EventCallback` which fires if a new todo was being added and provide an internal TodoItem which can be filled.

```cs
public partial class TodoForm : ComponentBase
{
    [Parameter]
    public EventCallback<TodoDto> TodoAdded { get; set; }

    private TodoDto todoModel = new TodoDto();

    private void HandleValidSubmit()
    {
        this.TodoAdded.InvokeAsync(new TodoDto() { Value = todoModel.Value });
    }
}
```

In the html we create a from using Blazors `EditForm` passing the model we just provided from the cs class. On a valid submit we call the `HandleValidSubmit` method.

```html
<EditForm Model="@todoModel" OnValidSubmit="HandleValidSubmit">
  ...
</EditForm>
```

Inside of the form we add a button with the type `submit` (otherwise the form des not get submitted) and we disable it when the current value of the model is not present.

```html
<EditForm Model="@todoModel" OnValidSubmit="HandleValidSubmit">
  <DataAnnotationsValidator />
  <ValidationSummary />

  <InputText
    id="name"
    @bind-Value="todoModel.Value"
    class="form-control form-control-lg"
    type="text"
    placeholder="Groceries, washing car..."
  />
</EditForm>
```

Lastly we of course have to add the input field where we bind the value of the new created todo item to. For this we use the `InputText` component of Blazors Framework again.

```html
<EditForm Model="@todoModel" OnValidSubmit="HandleValidSubmit">
  <InputText
    id="name"
    @bind-Value="todoModel.Value"
    class="form-control form-control-lg"
    type="text"
    placeholder="Groceries, washing car..."
  />

  <button
    type="submit"
    class="btn btn-primary mt-1"
    disabled="@(String.IsNullOrWhiteSpace(todoModel.Value))"
  >
    Submit
  </button>
</EditForm>
```

## Todo Component

The todo component is glueing it all together. It hosts both other components, reacts to events and calls the `TodoService` when needed.

## Adding SignalR
