---
id: 143
title: Structurize your project with areas and services in ASP.NET MVC
date: 2014-06-01T06:39:56+00:00
author: Fabian Gosebrink
layout: post
tags: areas aspnet mvc controllerservice services 
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

In this blogpost I want to show you one possible way to structurize your project with areas and services in ASP.NET MVC.

This is the first part of several architecture posts I will publish in the next time.

The idea to this came up because I noticed that if you are implementing ASP.NET mvc-code you always come to a point where you have to invest some time in the architecture. With a growing project it’s always good to keep an overview of who is doing what, when and where. Also the first question after implementing your first mvc-project lines of code is exactly the participation of the different concerns, which means: How to give your project a structure.

After some tries I came up with a solution of using some patterns and stuff. So this is the first post of two (or three) where I want to give you an idea how to get along with the problems giving your solution a system.

**1)     ** **Viewmodels and Submitmodels**

I don’t want to get into this further because I already did a blog post on this (<a href="http://blog.noser.com/why-and-how-to-avoid-viewbag-and-viewdata-in-asp-net-mvc/" target="_blank">here </a>and <a href="http://blog.noser.com/what-are-submitmodels-and-how-to-use-them/" target="_blank">here</a>). You can see an example of how to get along with viewmodels and submitmodels.

VMs and SMs are one essential part (of many 😉 ) of your mvc-application. They give you more control and they help you to figure out what’s going on. Not only in case of an error.

**2)     ** **Areas**

Do work with areas. Ever. I know in the beginning it seems useless to you because you “just want to get a little thing done”. But do use areas (and thank me later). This is the second step of getting structure into your project from the beginning.

<span style="color: #808080;">When I started to do this I got problems sharing my partial views from the top-level “Shared”-Folder which is given to me from the MVC-Template.</span>

<span style="color: #808080;"><a href="http://brockallen.com/2012/08/31/sharing-a-single-_viewstart-across-areas-in-asp-net-mvc/"><span style="color: #808080;">http://brockallen.com/2012/08/31/sharing-a-single-_viewstart-across-areas-in-asp-net-mvc/</span></a></span>

<span style="color: #808080;">Has a solution for this. So this should not be a problem for you anymore.</span>

Areas are adding a separate “room” for a special part of your website with its own controller, models and views.

![Structurize your project with areas and services in ASP.NET MVC]({{site.baseurl}}assets/articles/2014-06-01/518fb795-0f60-47a8-8312-5edebe28335b.png)

Note: You can of course add areas and name them as you want. But I think it’s always good to have a first point where the user first “sees” your application. So remind to have an Area which is giving you this information on the first sight. So name it like “Home” (which is standard). But also “Start” or anything like this would be okay.



**3)     ** **Area-Models**

So we see that an area is giving your project more structure, also you are summarizing the possibilities and “rooms” of your application and of what it is able to do.

In point 1 I mentioned the view- and submitmodels you have to give your view the information it needs.

You can lay them down in the models-folder. But do not do this on the top-level. Well, you can do this. But I am a fan of namespaces. So I do add a folder for each action I have in the controller (if they have own view-and submitmodels) and add them into this folder.

![Structurize your project with areas and services in ASP.NET MVC]({{site.baseurl}}assets/articles/2014-06-01/357eb813-fd76-41dd-b9c6-8bfeaa25ccae.png)

In this screenshot you see an area called “Projects” because it’s only handling everything which is connected to a project-object which can be handled in this web-application. For every action I added a namespace. In this namespace every single viewmodel and submitmodel can be found.

So you are hiding all information here for someone who is looking at your solution. Only if he is really interested in the code of your models he has to open one. If not he gets a perfect overview of what you can do with your project-object in your web-application without getting into the code of the controller. (Imagine here that this “someone” could be you looking into your code after some time. You will be thankful to have a good structure).

_Conclusion so far: Keep your models in the given “models”-folder the area is offering to you. Do add namespaces to actions you can to and summarize all view- and submitmodels in these folders. This gets a perfect overview of what your controller offers and you can find immediately what you are searching for, if you are searching for it. And \*only\* this. Nothing confusing._



**4)     ** **Area-Views**

If you added the folders like mentioned in the point before you should also have the views folder looking like the folder structure of your “models”-Folder

![Structurize your project with areas and services in ASP.NET MVC]({{site.baseurl}}assets/articles/2014-06-01/35e36f7e-028e-49fd-845a-4ff70ac5147f.png)

This is good so far. Nothing confusing and everybody gets the idea of what is offered here. Every view has exactly the name of what it offers to the user. Here nothing has to be done so far. Looks clean and nice.

![Structurize your project with areas and services in ASP.NET MVC]({{site.baseurl}}assets/articles/2014-06-01/309ab2b9-f3df-4258-9557-b0ce87e33335.png)

Here you can see again the clean folder structure which fits perfectly to the views. For each view you or someone else finds the information immediately. And it presents the fact, that every viewmodels is connected to a view.

_Conclusion so far: We have now a clean models-folder and views which represent the models and the functionality of the application in this area part. You know the connections between them because of a clean naming and concern-separation.But their relations is also clear because of a clean naming._



So now we have touched areas, views and models inside an area. Okay…the controller is missing. But before I go into this I have to get a step back:



**5)     ** **Controller Services and the controller**

We know that the controller receives the requests from your client and handles them. But I was never happy with this many lines of code in my controller. What I mean: He is the interface for your requests, he receives them. He is also responsible for giving the client back what he deserves. And that should be all. All the logic in between should not be into the controller, so why do not separate it and let the controller do what he is made for?

That is why I am using Services inside areas. Such a service works really near the area and has an interface, which is only providing all the methods the controller needs. Nothing more and nothing less. This service also knows view- and submitmodels. This is why the folder is placed beside the models-Folder.

![Structurize your project with areas and services in ASP.NET MVC]({{site.baseurl}}assets/articles/2014-06-01/f68f4fa0-7922-4196-9d8f-e9d3105145a5.png)

Here on the first sight you only have the interface of the controller service without seeing the real implementation on it. The service is offering everything to the controller what the controller really needs.

Example:

Controller Code:

![Structurize your project with areas and services in ASP.NET MVC]({{site.baseurl}}assets/articles/2014-06-01/089027b4-b577-4ae8-853c-accc685f102d.png)

Service-Interface:

![Structurize your project with areas and services in ASP.NET MVC]({{site.baseurl}}assets/articles/2014-06-01/f83d4d16-84bc-48a4-8528-d597b7b0672a.png)

Here you see that in the controller you have only one call to the service which is doing all the work for you. So the controller has only to get the requests, call the method and gives back the result. He does not care about what is in your viewmodel (like errormessages, sucessmessages, etc.)

<span style="color: #808080;">As I said: I am a fan of namespaces, so I encapsulate the implementation in a namespace (“Impl”), separating it from the interface (because the interface is the first thing that interests me when I am looking at code. “What does the service give me?” comes before “How does he do it?”).</span>

So here the real work is done. Here my UnitOfWork is used (which I inject once per Request, so every request gets one UnitOfwork. Ninject has this feature for you: RequestScope ;))

If you look at the code, you see the next thing I am doing to get a separation of concerns: Factories!

**6)     ** **Factories**

Every(!) viewmodel gets a factory which gets the viewmodel everything it needs. This is why I have another folder in my service-namespace called “Factories”. I hide this information inside the service namespace because the factories are only used inside this service and nowhere else.

![Structurize your project with areas and services in ASP.NET MVC]({{site.baseurl}}assets/articles/2014-06-01/375c85e6-9c17-4768-ba88-28bb635cd7b5.png)

All the factories are getting injected everything they need to build up the requested viewmodel and every viewmodel has its own factory. So you can test the viewmodels perfectly and one is not related to the other.

<span style="color: #808080;">I won’t get in detail HOW exactly to create viewmodels, because this really depends on what you want to show in your view.</span>

To summarize, this is how an area could look like:

![Structurize your project with areas and services in ASP.NET MVC]({{site.baseurl}}assets/articles/2014-06-01/6fdc0f3b-9843-49f2-8060-dabef9f4e150.png)

You have your view which is presenting everything it needs from the viewmodel, which is stored in the models-namespace. The controller has only a minimum of logic in it: Getting requests, calling his service and giving the result back. The controller service is handling everything for the controller by using factories to create viewmodels etc.

Your separation of concerns is fulfilled, you can apply this “template” on every area you build and you are working with clean view, and submitmodels which I mentioned earlier in this post.

In the next blog post I will present you the sense of Area-Services and Business-services and why I separate them explicitly. After this I will present you the Generic UnitOfWork-Pattern to get your repositories on a clean way.

Thanks for reading.

Regards

Fabian