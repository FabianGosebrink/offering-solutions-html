---
title: How to install Ninject in ASP.NET WebAPI
date: 2014-03-04
tags: ['aspnet', 'ninject']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: ['/blog/articles/2014/03/04/install-ninject-asp-net-webapi/']
---

In this blog post I want to show you how to install Ninject in ASP.NET WebAPI. Using Dependency-Injection is one of the most important things when implementing software. Code is much more testable and you have clearly ordered dependencies and an overview of what you injected where etc.

For ASP.NET MVC there are a lot of possibilities which you can use to achieve the DI-Goal. I tried a few (e.g. AutoFaq, Unity, etc.) and for me the fastest way to get things going was the Ninject-Way. So this time I want to show you a way to start with DI using Ninject. (You can get it <a href="http://ninject.codeplex.com/" target="_blank">here</a>)

NuGet is one of our best friends, so first of all try to search after "Ninject" and install the NuGet-Package for this (Dont worry, this MVC3 stuff also works for 4 and 5 😉 ):

![How to install Ninject in ASP.NET WebAPI](https://cdn.offering.solutions/img/articles/2014-03-04/b5b4e8c9-24ed-40f7-a37c-56ab94796006.png)After this you will get a generated class in your App_Start-Folder which is exactly offering you the registration-place you are looking for (aren't you ? 😉 )

![How to install Ninject in ASP.NET WebAPI](https://cdn.offering.solutions/img/articles/2014-03-04/2f654046-db9b-4b3d-a9a7-942053c18ba0.png)

There you can go ahead and register your services and/or repositories with your associated interface. (Of course you do implement an interface on every service/repo/etc. you do 😉 )

The "Start()"-Method is called while Bootstraping your application and your services will be registered.

![How to install Ninject in ASP.NET WebAPI](https://cdn.offering.solutions/img/articles/2014-03-04/5802028b-ce79-48df-bbd9-34bd6663d18c.png)

This was the first part. The second part means enjoying the service Ninject offers to you:

```csharp
public class MySuperService
{
    private readonly IConfigurationService _configurationService;

    public MySuperService(IConfigurationService configurationService)
    {
        _configurationService = configurationService;
    }

    public void MethodToUseMyInjectedService()
    {
        //speak to every method/property etc. which _configurationService gives you
    }
}
```

While looking into this short piece of code you will notice, that your "SuperService" has no connection to your implementation of "ConfigurationService" (no matter where it is) which describes the implementation of your ConfigurationService. And this is exactly one of the biggest advantages of Dependency Injection. You can change the implementation of your services like you want, without touching the parts which are connected because they only know the interface.

Also one great advantage (but like an anti-pattern, is that Ninject is automatically assigned to the DependencyResolver-Class provided by the ASP.NET-Mvc-Framework:

```csharp
DependencyResolver.Current.GetService<IMembershipRepository>();
```

also gives you the interface to your registered service without knowing the implementation. But be careful: Dependency **Injection** means that you **give** the services you create everything they need to live. Usually you do this in a constructor. So letting services **take** what they need, when they are currently needing it is way against the usual DI-Pattern!

For me one of the fastest and most clean ways to get Dependency Injection into my MVC-Projects.

Cheers

Fabian
