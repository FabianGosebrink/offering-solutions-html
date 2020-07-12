---
title: Build and debug a WebAPI with the Dotnet CLI and VSCode
date: 2016-11-02
tags: ['aspnetcore', 'dotnetcli']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  [
    '/blog/articles/2016/11/02/build-and-debug-webapi-with-the-dotnet-cli-and-vscode/',
  ]
---

In this blog I want to show you how to build and debug a WebAPI with the Dotnet CLI and VSCode.

Code is here:

[https://github.com/FabianGosebrink/ASPNETCore-WebAPI-With-VSCode-Dotnet-CLI](https://github.com/FabianGosebrink/ASPNETCore-WebAPI-With-VSCode-Dotnet-CLI)

### Why should we do a WebAPI with VSCode and the DotNet CLI?

If you are building websites nowadays you have a lot of tools and a lot of technologies to handle. On Serverside this is a little bit easier but there you have a couple of technologies to face, too. In the past this was strongly connected to the operating system you were running on. With the dotnet CLI and Visual Studio Code you can build, run and debug APIs which are cross platform and so not bound to your (windows) system anymore.

### Get started

First you have to download the dotnet CLI

[https://github.com/dotnet/cli](https://github.com/dotnet/cli)

You can check if the CLI is running correctly by typing "dotnet" into your cmd. Something like this should appear:

![buildawebapiwithvscodeandthedotnetcli_01](https://cdn.offering.solutions/img/articles/wp-content/uploads/2016/11/BuildaWebAPIwithVSCodeandtheDotNetCLI_01.jpg)</a>

Now we can type "code ." to start Visual Studio Code and add some content.

Modify the dotnetcliwebapi.csproj to this:

```html
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <Folder Include="wwwroot\" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.All" Version="2.0.0" />
    <PackageReference Include="Automapper" Version="6.1.1" />
  </ItemGroup>

  <ItemGroup>
    <DotNetCliToolReference
      Include="Microsoft.VisualStudio.Web.CodeGeneration.Tools"
      Version="2.0.0"
    />
  </ItemGroup>
</Project>
```

and add the Startup.cs like this:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DotnetcliWebApi.Dtos;
using DotnetcliWebApi.Entities;
using DotnetcliWebApi.Repositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Serialization;

namespace DotnetcliWebApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddOptions();

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

            services.AddSingleton<IFoodRepository, FoodRepository>();
            services.AddMvcCore()
                .AddJsonFormatters(options => options.ContractResolver = new CamelCasePropertyNamesContractResolver());
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("AllowAllOrigins");
            AutoMapper.Mapper.Initialize(mapper =>
                      {
                          mapper.CreateMap<FoodItem, FoodItemDto>().ReverseMap();
                          mapper.CreateMap<FoodItem, FoodUpdateDto>().ReverseMap();
                          mapper.CreateMap<FoodItem, FoodCreateDto>().ReverseMap();
                      });
            app.UseMvc();
        }
    }
}
```

Now modify the program.cs like this:

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;

namespace DotnetcliWebApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
    }
}
```

If you now type "dotnet run" your api starts.

![buildawebapiwithvscodeandthedotnetcli_02](https://cdn.offering.solutions/img/articles/wp-content/uploads/2016/11/BuildaWebAPIwithVSCodeandtheDotNetCLI_02.jpg)

That was easy, right?

> The ASP.NET Core WebAPI runs now. All we do now is adding content, but the main environment for the ASP.NET Core WebAPI is running at this point. :)

Lets add some content.

Add the folders and files:

![buildawebapiwithvscodeandthedotnetcli_03](https://cdn.offering.solutions/img/articles/wp-content/uploads/2016/11/BuildaWebAPIwithVSCodeandtheDotNetCLI_03.jpg)

The repository can be found here:

[https://github.com/FabianGosebrink/ASPNETCore-WebAPI-With-VSCode-Dotnet-CLI](https://github.com/FabianGosebrink/ASPNETCore-WebAPI-With-VSCode-Dotnet-CLI)

Please add the showed files to your project, you can copy them from the repo.

Do not forget to modify your Startup.cs like this: Adding the repositry to the IoC-Container and adding the Automapper mapping:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ...
    services.AddSingleton<IFoodRepository, FoodRepository>();
    // ...
}
```

and

```csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
{
    // ...
    AutoMapper.Mapper.Initialize(mapper =>
    {
        mapper.CreateMap<FoodItem, FoodDto>().ReverseMap();
    });
    // ...
}
```

If you now type "dotnet build" it should build everyting. The warnings are because of we ware doing nothing with the exception variable. You should handle them anyhow in a real world project.

![Build and debug WebAPI with the Dotnet CLI and VSCode](https://cdn.offering.solutions/img/articles/wp-content/uploads/2016/11/BuildaWebAPIwithVSCodeandtheDotNetCLI_04.jpg)

If you now do "dotnet run" on your console, your webapi starts up and you can use it:

![Build and debug WebAPI with the Dotnet CLI and VSCode](https://cdn.offering.solutions/img/articles/wp-content/uploads/2016/11/BuildaWebAPIwithVSCodeandtheDotNetCLI_05-1024x555.jpg)

### Debugging

We can now also debug the webapi with vscode. Therefore you only have to cancel the running process first and then hit the start button in the debug tab from vscode:

![Build and debug a WebAPI with the Dotnet CLI and VSCode](https://cdn.offering.solutions/img/articles/wp-content/uploads/2016/11/BuildaWebAPIwithVSCodeandtheDotNetCLI_06-1024x555.jpg)

![Build and debug a WebAPI with the Dotnet CLI and VSCode](https://cdn.offering.solutions/img/articles/wp-content/uploads/2016/11/BuildaWebAPIwithVSCodeandtheDotNetCLI_07-1024x553.jpg)

So this is it. You now have built a ASP.NET WebAPI only with the dotnet cli and Visual Studio Code (vscode)

Hope this helps anybody

BR

Fabian
