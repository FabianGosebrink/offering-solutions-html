---
title: The difference between AddMvc() and AddMvcCore()
date: 2017-02-07 20:49
author: Fabian Gosebrink
layout: post
tags: aspnet aspnetcore
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

In this blogpost I want to show you difference between the ASP.NET Core methods `AddMvc()` and `AddMvcCore()` when working with ASP.NET Core.

[ASPNETCore-WebAPI-Sample](https://github.com/FabianGosebrink/ASPNETCore-WebAPI-Sample)

### Startup.cs

When creating an ASP.NET Core WebAPI you often see a Startup.cs file to configure your services and configure your pipeline. Thats what the methods `ConfigureServices(IServiceCollection services)` and `Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)` are for.

`ConfigureServices` is preparing your services for being used as you configure them.

> Here is also the place to add dependency injection, but that is another seperate topic

You can have a lot of configuration in here. But we want to focus on the main point: Adding the mvc framework.

When starting with "File" --> "New Project" in Visual Studio the default setting in the method is `AddMvc()`. And it works straight away. Lets take a look:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ...
    services.AddMvc();
}
```

When now an API with Controllers kicks in we can consume it like normal.

`dotnet run` makes the API work on `localhost:5000`

`GET localhost:5000/api/house`

brings

```javascript
[
    {
        id: 1,
        street: 'Street1',
        city: 'Town1',
        zipCode: 1234,
    },
    {
        id: 2,
        street: 'Street2',
        city: 'Town2',
        zipCode: 1234,
    },
    {
        id: 3,
        street: 'Street3',
        city: 'Town3',
        zipCode: 1234,
    },
    {
        id: 4,
        street: 'Street4',
        city: 'Town4',
        zipCode: 1234,
    },
];
```

What happens, if we change `AddMvc()` to `AddMvcCore()`?

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ...
    services.AddMvcCore();
}
```

Lets run the same command again:

`GET localhost:5000/api/house`

now brings a `406` Error saying "Not Acceptable".

If we check the console which hosts the webapi we see more information about this error:

> warn: Microsoft.AspNetCore.Mvc.Internal.ObjectResultExecutor[1]No output formatter was found for content type '' to write the response.

So we deactivated something we better should have not deactivated ;-).

The error says that we do not have an output formatter which can parse our output. Even if we add an accept header in the request like `Accept: application/json` we would get the same error message, because the server does not know how ot handle the respose.

Lets take a closer look on what is the real difference between `AddMvc()` and `AddMvcCore()`.

Due to the fact that the framework is open source we can take a look at the sources:

```csharp
public static IMvcBuilder AddMvc(this IServiceCollection services)
{
    if (services == null)
    {
        throw new ArgumentNullException(nameof(services));
    }

    var builder = services.AddMvcCore();

    builder.AddApiExplorer();
    builder.AddAuthorization();

    AddDefaultFrameworkParts(builder.PartManager);

    // Order added affects options setup order

    // Default framework order
    builder.AddFormatterMappings();
    builder.AddViews();
    builder.AddRazorViewEngine();
    builder.AddCacheTagHelper();

    // +1 order
    builder.AddDataAnnotations(); // +1 order

    // +10 order
    builder.AddJsonFormatters();

    builder.AddCors();

    return new MvcBuilder(builder.Services, builder.PartManager);
}
```

From [MvcServiceCollectionExtensions.cs](https://github.com/aspnet/Mvc/blob/dev/src/Microsoft.AspNetCore.Mvc/MvcServiceCollectionExtensions.cs#L25-L56) tells us, that we are adding the complete MVC Services you need to get the whole MVC functionality.

It is adding Authorization, the RazorViewEngine and the JsonFormatters we need to get our output going. And most interesting it is also calling the `AddMvcCore()` method itself.

So if we use the `AddMvc()` method we got the ability to render view with razor and so on.

Lets have a look at `AddMvcCore()` on the other hand:

[MvcCoreServiceCollectionExtensions.cs](https://github.com/aspnet/Mvc/blob/48546dbb28ee762014f49caf052dc9c8a01eec3a/src/Microsoft.AspNetCore.Mvc.Core/DependencyInjection/MvcCoreServiceCollectionExtensions.cs#L37-L54)

```csharp
public static IMvcCoreBuilder AddMvcCore(this IServiceCollection services)
{
    if (services == null)
    {
        throw new ArgumentNullException(nameof(services));
    }

    var partManager = GetApplicationPartManager(services);
    services.TryAddSingleton(partManager);

    ConfigureDefaultFeatureProviders(partManager);
    ConfigureDefaultServices(services);
    AddMvcCoreServices(services);

    var builder = new MvcCoreBuilder(services, partManager);

    return builder;
}
```

This method is a lot shorter and only adding the basic things to get started. But both methods are returning an IMvcCoreBuilder.
Interesting is the `AddMvcCoreServices(services);` method which is adding the ability to return FileContents, RedirectToRouteResults, ActionResolvers, use Controllers, use routing and so on. Really basic functionality.

So when using `AddMvcCore()` we have to add everything by ourselves. This means, that we only have in our application what we really want and for example do not include the razor functionality which we do not need anyway.

Now that we know the difference between those two methods: How can we get our webapi going again? We still have the error and we can not return any data.

We can fix that by simply telling ASP.NET that it should use JsonFormatters like

```csharp
public void ConfigureServices(IServiceCollection services)
{
	// ...

	// Add framework services.
	services.AddMvcCore().AddJsonFormatters();
}
```

If we now call our

`GET localhost:5000/api/house`

again we should see the output as json like we expected it to be.

I hope this clarified a bit what is the main difference between AddMvc() and AddMvcCore().

Best regards

Fabian

#### Links

[When I develop ASP.NET Core MVC, which service should I use? AddMvc or AddMvcCore?](http://stackoverflow.com/questions/40097229/when-i-develop-asp-net-core-mvc-which-service-should-i-use-addmvc-or-addmvccor)

[MvcCoreServiceCollectionExtensions.cs](https://github.com/aspnet/Mvc/blob/48546dbb28ee762014f49caf052dc9c8a01eec3a/src/Microsoft.AspNetCore.Mvc.Core/DependencyInjection/MvcCoreServiceCollectionExtensions.cs)

[MvcServiceCollectionExtensions.cs](https://github.com/aspnet/Mvc/blob/dev/src/Microsoft.AspNetCore.Mvc/MvcServiceCollectionExtensions.cs)
