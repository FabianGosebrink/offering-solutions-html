---
title: Get started with ASP.NET Core and Entity Framework 6
date: 2015-12-13 20:20
author: Fabian Gosebrink
layout: post
tags: aspnetcore mvc automapper codefirst database context entityframework json webapi
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

Hey,

today I want to show you how to get started with ASP.NET 5 and Entity Framework 6.

If you start with the new templates for ASP.NET 5 you will notice in a short time that examples are going the EF 7 way. But if you want to stay at Entity Framework 6 as long as 7 is not in a final release or just to move from an older version step by step you can follow this instructions here. In this blog post I want to show you how to include a database with a connectionstring saved in a json file with the new ASP.NET Core.

> Note: At the time of this post ASP.NET was at RC1 status. There might be changes until its completely an final released. However: If you want to dive into new functionalities: Keep reading.

## Get started with ASP.NET Core and Entity Framework 6 :

First of all you need to start an new project with the new ASP.NET like this:

![Ef6Example]({{site.baseurl}}assets/articles/wp-content/uploads/2015/12/Ef6Example.jpg)

This will create you a new nearly empty solution following the new standards with all configs in \*.json files and so on.

> This example is only made fot the full version of the .net-Framework. So the core version will not be supported with this example.

The first step we a re going to do is adding the dependency of the Entity Framework to our solution via the project.json file. For this only put the line

`"EntityFramework": "6.1.3"`

at the end of you dependencies section like this:

![Ef6Example_02]({{site.baseurl}}assets/articles/wp-content/uploads/2015/12/Ef6Example_02.jpg)

This will get Visual Studio 2015 to update your dependencies including the Entity Framework.

Now you can create a new class named like your Context. in this case this will be "MyEf6EntityFrameworkContext".

![Ef6Example_03]({{site.baseurl}}assets/articles/wp-content/uploads/2015/12/Ef6Example_03.jpg)

Be sure to use the "base"-functionality, because we will need it when passing the connectionstring to the context reading it out of the \*.json file.

Back in our Startup.cs-File we are including a file called "appsettings.json". Lets go and add our Connectionstring to this file:

![Ef6Example_04]({{site.baseurl}}assets/articles/wp-content/uploads/2015/12/Ef6Example_04.jpg)

This should look quite familiar because of the connectionstring you knew from the web.config in the previous asp.net-versions.

## What we did so far:

At this point we added the connectionstring to the config file we will consume in the startup.cs and we created a databasecontext like we know it which will provide us any data in the future.

## Go ahead!

Next thing we have to do is getting the config and our databasecontext married :-)

This can be done putting a single line in our "Startup.cs"-File.

Just add

```csharp
services.AddScoped<MyEf6EntityFrameworkContext>((s) => new MyEf6EntityFrameworkContext(Configuration["Data:Ef6ExampleConnectionString"]));
```

in the method "ConfigureServices" in your Startup.cs.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Add framework services.
    services.AddMvc();
    services.AddScoped<MyEf6EntityFrameworkContext>((s) => new MyEf6EntityFrameworkContext(Configuration["Data:Ef6ExampleConnectionString"]));
}
```

This line will read the configuration and get the connection-string out of it and use it for establishing the connection. pay attention to the scoped adding. This is because the context should be generated for every single request. You can grab an overview of all lifestyles here, even it's a bit outdated: [Dependency Injection in ASP.NET vNext](http://blogs.msdn.com/b/webdev/archive/2014/06/17/dependency-injection-in-asp-net-vnext.aspx)

## The Model

You can now go ahead and install my [Unit of Work](https://github.com/OfferingSolutions/OfferingSolutions-RepositoryPattern-UnitOfWork) via nuget and create a repository like this:

```csharp
public interface IExampleRepository : IRepositoryContext<MyModel>
    {
    }
```

```csharp
public class ExampleRepository : RepositoryContextImpl<MyModel>, IExampleRepository
{
    public ExampleRepository(MyEf6EntityFrameworkContext databaseContext) : base(databaseContext)
    {
    }
}
```

With a model like this (for example):

```csharp
public class MyModel
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
    }
```

Meanwhile I also added [Automappers](https://github.com/AutoMapper/AutoMapper/wiki/Getting-started) and a ViewModel to map between those two:

```csharp
public class MyModelViewModel
{
    public int Id { get; set; }
    [Required]
    public string Name { get; set; }
}
```

Please add another models for update and create with the properties you want to expose. Don't forget the mapping.

Now we have to bring it to the build in DI in ASP.NET:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Add framework services.
    services.AddMvc();
    services.AddScoped<IExampleRepository, ExampleRepository>();
    services.AddScoped<MyEf6EntityFrameworkContext>((s) => new MyEf6EntityFrameworkContext(Configuration["Data:Ef6ExampleConnectionString"]));
}
```

and the automapping:

```csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
{
    Mapper.Initialize(config =>
    {
        config.CreateMap<MyModel, MyModelViewModel>().ReverseMap();
        // other mappings
    });

    //...
}
```

In the end you only have to build up a controller which gives and takes the values as your API:

```csharp
[Route("api/[controller]")]
public class MyModelController : Controller
{
    private readonly IExampleRepository _exampleRepository;

    public MyModelController(IExampleRepository exampleRepository)
    {
        _exampleRepository = exampleRepository;
    }

    // GET: api/mymodel
    [HttpGet("", Name = "GetAll")]
    public IActionResult Get()
    {
        List<MyModel> MyModels = _exampleRepository.GetAll().ToList();
        return Ok(MyModels.Select(x => Mapper.Map<MyModelViewModel>(x)));
    }

    // GET api/values/5
    [HttpGet("{id}", Name = "GetSingle")]
    public IActionResult Get(int id)
    {
        MyModel MyModel = _exampleRepository.GetSingleById(id);

        if (MyModel == null)
        {
            return NotFound();
        }

        return Ok(Mapper.Map<MyModelViewModel>(MyModel));
    }

    // POST api/values
    [HttpPost]
    public IActionResult Post([FromBody]MyModelCreateViewModel viewModel)
    {
        if (viewModel == null)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        MyModel toAdd = Mapper.Map<MyModel>(viewModel);

        _exampleRepository.Add(toAdd);

        if (!_exampleRepository.Save())
        {
            throw new Exception("Creating an item failed on save.");
        }

        MyModel newItem = _exampleRepository.GetSingle(toAdd.Id);

        return CreatedAtRoute("GetSingle", new { id = toAdd.Id },
            Mapper.Map<MyModelViewModel>(toAdd));
    }

    // PUT api/values/5
    [HttpPut("{id}")]
    public IActionResult Put(int id, [FromBody]MyModelUpdateViewModel updateViewModel)
    {
        if (updateViewModel == null)
        {
            return BadRequest();
        }

        var existingItem = _exampleRepository.GetSingle(id);

        if (existingItem == null)
        {
            return NotFound();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        Mapper.Map(updateViewModel, existingItem);

        _exampleRepository.Update(id, existingItem);

        if (!_exampleRepository.Save())
        {
            throw new Exception("Updating a item failed on save.");
        }

        return Ok(Mapper.Map<MyModelViewModel>(existingItem));
    }

    // DELETE api/values/5
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        MyModel singleItem = _exampleRepository.GetSingle(id);

        if (MyModel == null)
        {
            return NotFound();
        }

        _exampleRepository.Delete(id);

        if (!_exampleRepository.Save())
        {
            throw new Exception("Deleting a item failed on save.");
        }

        return NoContent();
    }
}
```

Thats it. If you now going to use the DatabaseContext it will create the database for you with the new ASP.NET Core.

![Ef6Example_05]({{site.baseurl}}assets/articles/wp-content/uploads/2015/12/Ef6Example_05.jpg)

You can now go ahead and add an item with e.g. postman:

![Ef6Example_06]({{site.baseurl}}assets/articles/wp-content/uploads/2015/12/Ef6Example_06.jpg)

and it will be stored in the database:

[Github](https://github.com/FabianGosebrink/Asp.Net5WithEntityFramework6)

Hope this helps

Regards

Fabian
