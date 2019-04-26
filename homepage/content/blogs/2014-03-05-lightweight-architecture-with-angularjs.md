---
id: 65
title: Lightweight architecture with AngularJS
date: 2014-03-05T17:17:51+00:00
author: Fabian Gosebrink
layout: post
categories: articles
tags: angularjs javascript webarchitecture 
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
---

During the last past days I have been to a conference in Germany and brought back several interesting things I want to share with you this time. (Here I have to say that my hotel did not have a spa. So everybody who wanted to get the latest hotel and spa tips is wrong here&#8230;so in case stop reading)

Well for me as a software developer it gets interesting every time I hear another company talking about their way of doing work, their kind of projects and their behavior in the market. It’s always refreshing to see how they behave. And, indeed, personally, if the topic "ASP.NET&", "Internet&" with all its Buzzwords is connected you can be sure to have my attention.

This time I laid my focus on everything which was connected to the web and in eight hours of workshop and a lot of tracks the other day I learned a lot!

### History

Let me get historical for a moment: .Net in its first version was released in 2002. This is 12 years ago! 12 years are more than a lifetime in computer-science. So you feel that there is something moving. Something growing. Internet-Applications are getting bigger and bigger and: It’s getting a lot more mobile focus. Having the same application on smartphone, tablet and your desktop-PC (Do you still have one? 😉 ) is something like essential to everyone. It also solves a lot of business-issues as I heard on the conference. "Oh if we would have known that before. It would have saved us a lot of trouble!&"

### Why SPAs?

ASP.NET gives us great application-possibilities for this to achieve. ASP.NET MVC gives us a very established Framework (MVC) which does a great separation of your view, your logic and dealing with and between them. But it’s a server-sided technology. You are feeling it: There is a server I have to ask every time. I hated to ask my parents for almost everything I did when I was young, why should I love to ask a Server everything I do? And, which is the bigger point, why am I feeling it while working with my application?

Wouldn't it be nice to have an application browser-based, which looks the same on every device I have, which keeps my data synchronized no matter which device I take to change the information? I can start it on my smartphone, have it on the desktop and love the information AND the look and feel. Because I am used to it.

As I mentioned ASP.NET MVC gives us a great but server-sided-technology to build up web applications. ASP.NET WebAPI gives us only a small thing server sided: An API we can ask information from and push information to. The client-side programming language would be JavaScript. When you read "JavaScript&" the first thing which comes to your mind is "jQuery&". Why? Because jQuery is one of the most common DOM-Changing tools out there in the web. Okay okay, it’s more than a DOM-Changing-Tool I know. But without Require.js and a lot of tools it’s hard to get a real structure in your application by using jQuery.

### Angular.js

Frameworks like Angular.js are nowadays able to build up a complete MV*-Framework completely down on your client. Everybody who thought that JavaScript is a language without any structure, namespaces etc. can with tools like angular see, that this is not true. Angular.Js is a google-pushed Framework (that’s a reason why MS is not providing it in its templates 😉 ) where code can be separated into your well known controllers, into services and, of course, into your view model for html-views. The Dependency injection comes native with angular.js! With that you are facing real client-side architecture. It’s an architecture to write client-side-applications. Not only websites.

![Lightweight architecture with AngularJS]({{site.baseurl}}assets/articles/2014-03-05/5ab97616-0c2c-4953-9bca-8f5c20415c45.png)

The following screenshots shows an example of a view iterating over persons, which are called from a WebApi over services (see the following screenshots).

![Lightweight architecture with AngularJS]({{site.baseurl}}assets/articles/2014-03-05/f45c07ec-ef2b-4369-86ac-786ec18ab1ee.png)

The controller gets the “scope” injected, which is an angular.js-word for representing the view model. Here the persons are called from the service and set in the corresponding property.

![Lightweight architecture with AngularJS]({{site.baseurl}}assets/articles/2014-03-05/d76d36a2-13d9-4bf4-9a1d-42a29d36536f.png)

Here the services for the communication to the WebAPi are shown. I only divided the service which gets injected to the controller from the one who really gets the data. Theoretically this could be one single service.

![Lightweight architecture with AngularJS]({{site.baseurl}}assets/articles/2014-03-05/d7b243d3-9c6e-48dd-9e16-37ee9f27127d.png)

Your corresponding WebApi could look like:

![Lightweight architecture with AngularJS]({{site.baseurl}}assets/articles/2014-03-05/a3bc7793-7ecf-4bcc-9121-e26908d668dc.png)

The last piece which fits everything together to get a real feeling of client-based-architecture is the routing, which you can navigate to your application with without having the feeling there is a server behind.

![Lightweight architecture with AngularJS]({{site.baseurl}}assets/articles/2014-03-05/874e9c02-d238-4cc9-afca-686785cd9397.png)

With this angular.js-concept and WebAPI in the back you can get your information online, take it to your client and work with it. Navigation is client-based. Every behavior but the source of information is based on the client.

### Conclusion

Let’s summarize: The patterns to build up applications with a good architecture have been there so far. Since many years. Nowadays this grows further and further into JavaScript and client-side-applications. I think the word "Application&" has to be paid the most attention to. Frameworks like angular.js are very into giving you the well knows structures and architecture-patterns to build up applications with a lightweight architecture completely using the client.

On the mentioned historically view every C#-Developer has to face the new age with JavaScript as a language you have to pay attention to.

Personally I think now that JavaScript is not a language without structure etc. It’s not like your good old C# with namespaces and classes and stuff but the frameworks in this direction are growing and getting better and better. So here is something moving. There is something growing. Let’s grow with it!


