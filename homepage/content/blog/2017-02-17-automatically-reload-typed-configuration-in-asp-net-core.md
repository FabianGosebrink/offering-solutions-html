---
title: Automatically reload typed configuration in ASP.NET Core
date: 2017-02-17
tags: ['aspnetcore', 'configuration']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: [
    "/blog/articles/2017/02/17/automatically-reload-typed-configuration-in-asp-net-core/"
]
---

In this article I want to explore IOptionsSnapshot and show how to work with IOptionsSnapshot in ASP.NET Core 1.1.

We will use the dotnet cli to create a new project and configure it using the reload technique in combination with IOptionsSnapshot.

> Make sure you are using at least ASP.NET Core 1.1

Get started by creating a new folder where you want to work in, opening a console there and typing

`dotnet new mvc` and `dotnet restore` to get the project in a starting position.

Then open up a console and type `code .` to start Visual Studio Code on the current level.

You should now see all the files and folders of your project. We can now go ahead and create a typed class which represents the configuration we want to work with. In this case this is a file with a name property.

```
Config
└── myConfig.json
Controllers
└── ...
Views
└── ...
wwwroot
└── ...
...
Program.cs
Startup.cs
```

myConfig.json

```javascript
{
  "Person": {
    "Firstname" : "John Doe"
  }
}
```

This leads us to the class

```csharp
public class Person
{
    public string Firstname { get; set; }
}
```

```
Config
└── myConfig.json
ConfigModels
└── Person.cs
Controllers
└── ...
Views
└── ...
wwwroot
└── ...
...
Program.cs
Startup.cs
```

which represents our configuration in our application.

We have to modify our constructor of the Startup.cs file a bit to load this new file:

```csharp
public Startup(IHostingEnvironment env)
{
    var builder = new ConfigurationBuilder()
        .SetBasePath(env.ContentRootPath)
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
        .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
        .AddEnvironmentVariables();
    Configuration = builder.Build();
}
```

becomes to

```csharp
public Startup(IHostingEnvironment env)
{
    var builder = new ConfigurationBuilder()
        .SetBasePath(env.ContentRootPath)
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
        .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
        .AddJsonFile($"config/myConfig.json", optional: false, reloadOnChange: true)
        .AddEnvironmentVariables();
    Configuration = builder.Build();
}
```

> Pay attention to the `realoadOnChange: true` because that is what we are reaching out for

So now that we loaded the file we need to add it to our configuration which is used in our app.

Lets do this by adding the statement in the `ConfigureServices`-Method:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ...
    services.Configure<Person>(Configuration.GetSection("Person"));
}
```

Here we are mapping our values in JSON to a typed class called "Person".

Now this configuration is available through dependency injection and we can use it in our controllers!

```csharp
public class HomeController : Controller
{
    private readonly Person _person;
    public HomeController(IOptionsSnapshot<Person> person)
    {
        _person = person.Value;
    }
}
```

> Pay attention to the "IOptionsSnapshot" we injected here which is different from the previous ASP.NET Core versions.

Be sure to have the `"Microsoft.Extensions.Options": "1.1.0"` package installed and you are using ASP.NET Core 1.1.

We can now inject the `IOptionsSnapshot<T>` in our controller and use its value. For testing we save the Firstname in the ViewData displaying it afterwards.

```csharp
namespace WebApplication6.Controllers
{
    public class HomeController : Controller
    {
        private readonly Person _person;
        public HomeController(IOptionsSnapshot<Person> person)
        {
            _person = person.Value;
        }

        public IActionResult Index()
        {
            ViewData["FirstName"] = _person.Firstname;
            return View();
        }
    }
}
```

Index.cshtml

```csharp

<h3>@(ViewData["FirstName"])</h3>

```

If you now start the web application via `dotnet run` and you change the configuration without restarting the application, hit F5 to refresh the browser you see the new values.

Hope this helps anybody :-)

Fabian
