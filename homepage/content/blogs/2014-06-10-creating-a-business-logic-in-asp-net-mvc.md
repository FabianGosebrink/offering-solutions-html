---
id: 169
title: Creating a business logic in ASP.NET MVC
date: 2014-06-10T16:00:13+00:00
author: Fabian Gosebrink
layout: post
tags: aspnet mvc web architecture 
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

In this bogpost I want to show you one possible way creating a business logic in ASP.NET MVC.

Okay, referring to my last <a href="http://offering.solutions/blog/articles/2014/06/01/structurize-your-project-with-areas-and-services-in-asp-net-mvc/" target="_blank">blogpost </a>I want to take you one step further and extend the older post a little bit. In the last post we saw how to build up areas and to get them clean, with separated concerns and nice looking, testable etc.

But this is worth nothing if the rest you have is not well separated and you have a big mess there. That’s why I want to give you the second part (which is a bit shorter) to present you one way to create a business-tier.

Well, the problem we face is that we have to access our data. We have to have any way of communication between our UI and the database. The first blogpost was touching the UI (remember? Areas and their friends…). The third one will touch the repositories (generic) and the UnitOfWork-Stuff and so on. Why don’t we just access the data from the Controllerservice (through the UnitOfWork) and were done?

The answer is: Yeah we could. But sometimes some database queries are a little bit more complex. You have to have this object A with B in it to get C, the user has to be there first and so on. If you would write this now in the Controller service (mentioned in the <a href="http://offering.solutions/blog/articles/2014/04/06/code-first-with-entity-framework-nm-relationship-with-additional-information/" target="_blank">blogpost </a>before) this would work, but would generate a lot of code and in the best case you would end up with a lot of functions, which are named after what they are doing but still getting the class very big and difficult to handle. Also testing would be difficult. You would have a lot of private functions to test. If you have only one class this should be a step to think about what you are doing! If you are writing a private function so “mighty” that it should be tested in 95% you are hurting the single-responsibility-principle and the separation of concerns, too. So what you are writing should be an own class, with its own tests and its own public and private functions. With a class name which describes, what its doing and functions which describe exactly, what they do.

Another reason is: Sometimes (as mentioned in <a title="Code-First with EF and N:M Relationship with more information in your relation-table" href="http://offering.solutions/blog/articles/2014/04/06/code-first-with-entity-framework-nm-relationship-with-additional-information/" target="_blank">this </a>post) you have a third entity (EntityC) to connect two other entities in your application (let’s call the EntityA and EntityB). This is an N:M-Relationship. And you should access these entities only through the EntityC one, including those you want to have (EntityA, EntityB or both). These queries could, even with the Entity-Framework, be very cryptic and you better have a class which does the queries for you. This is not like a general rule. This only makes sense, when you have these entities. But to stay clean and testable, you can have every query wrapped in a service…why not? 😉

Further you probably want to give your controller-service functions which have a sorting logic or anything like that, etc. he can just call them and he does not care about the implementation.

So these are only three reasons why you should work with services behind your controller service.



**Area Services**

These services are written in another tier, the “logic-tier” or “business-tier”; call it like you want to.

<span style="color: #808080;">Note: In the Screenshots I have only one project in the solution and I am separating the tiers only in namespaces. You can, of course, introduce different projects in the solution to get the concerns separated for each project. Well you should do this…would be better 😉 But for this post, it’s about the idea behind it. If you got this, I won a lot!</span>

Concrete example: You have a service which is giving you Chart-Data to display a chart in your view. You should have one service for this which is only build to work with and give you this data. Mostly you want this data to be generated out of anything in the database. This is perfect for a service. And because this service interacts directly with any area (you can inject the interface of the service wherever you want in you controller-services) I call them “AreaServices”.

<span style="color: #808080;">Note. How to get along with DotNet Highcharts I am describing <a title="How to include DotNet.HighCharts in ASP.NET MVC with ViewModels" href="http://offering.solutions/blog/articles/2014/05/09/how-to-include-dotnet-highcharts-in-asp-net-mvc-with-viewmodels/" target="_blank"><span style="color: #808080;">here</span></a>.</span>



![ASP.NET MVC - Creating a business logic]({{site.baseurl}}assets/articles/2014-06-10/42abe410-8ef5-44a4-9794-ab531b8b3751.png)

Here you see an area service called “ChartService” which is, when you collapse the whole thing, only visible to the outside through his interface (information hiding, I mentioned this in part I of this article here). His _Impl_-namespace contains the direct implementation. Everything which is connected to this service also takes place in this namespace, as long as it’s only needed there. In this case we have a special factory which creates the chart (interface/impl) and a very “stupid” container class “ChartData” which summarizes the data for a chart.

Note: this could be any worker service for you. I just choose this one because its doing some work and looking for data in the database. So you have both things covered.

Let’s see some code:

![ASP.NET MVC - Creating a business logic]({{site.baseurl}}assets/articles/2014-06-10/eeb62a78-705e-44eb-a404-07fbaa25cbb1.png)

![ASP.NET MVC - Creating a business logic]({{site.baseurl}}assets/articles/2014-06-10/065fd0da-6b2b-4515-9521-7ae6c58e434c.png)

You see that this service knows the factory and just calls it after he collects the data from the database.

<span style="color: #993300;">Attention: You do NOT have to use a using here in your UnitOfWork. The using of the UnitOfWork is ONLY used in a controller service, because this is the main entry point for a lot of database-requests and as I mentioned in part one of this, Ninject is only injecting one instance for you per request. One controller service call represents one request from a client. So put the using there and you are safe to have the same instance over all services the request touches. This is why you can inject it here.</span>

The point is: You are having a tier which is calling the database, collecting information and doing something with it. To get to the example I mentioned before you could have a EntityCService, where you can have all nice methods on it which the controller service can call and here you are gathering the information with EntityC having EntitiesB and A on it and so on. All this is hidden here inside this service.

Conclusion so far: Sometimes you have a lot of work to do with some database data or your requests are a little bit more complex. So do separate this in services which can be called from your areas/controller-services. This is the first part of the middle-tier.

![ASP.NET MVC - Creating a business logic]({{site.baseurl}}assets/articles/2014-06-10/cfe740e3-d82b-4dd4-9aa6-c6442e0a29f5.png)

**Business services**

Another type of services? Oh come on! Well, what we touched was a type of service which interacts with the database and is very strongly connected to the application. But what about services which are…

  * …not that connected to the application
  * …could possibly stand alone (as a module)
  * …are doing work which is not interacting with the database or at least not writing into it

Lets do another kind of service and call them _business services_. Examples for these business services are maybe a pdf-generator which generates you a pdf of data which is given to him. Or an email service which is sending emails from your application to the user. Or a calculator who is only feed with data and calculating some values.

These “worker services” are doing some work which stands a little bit beside the normal CRUD-operations you normally have in a web application.

![ASP.NET MVC - Creating a business logic]({{site.baseurl}}assets/articles/2014-06-10/579ec6cf-55e4-43c4-98d3-44927c68a9c3.png)

In this example you see two services which represent classical business services and are only worker-bees producing an outcome of something you give them. Here you can have a little, but normally you have no database-contact. If you have this, this is only reading data. Never writing something into it.

On the screenshot you also see the namespaces “Impl” which hides the implementation and the interface which is representing the service.

So we are extending our logic-layer with the business services and have now area services and business services in it.

![ASP.NET MVC - Creating a business logic]({{site.baseurl}}assets/articles/2014-06-10/ef98f768-1b25-4196-a477-9e9e7f15d424.png)

Of course these services can and should be provided in different projects to have several dlls. But with this, every layer should have an api-project to represent it and this api-dll should be referenced from the projects which needs it.

Unfortunately this was it for this time. In the next part I will touch the generic repositories with the UnitOfWork.

Regards

Fabian
