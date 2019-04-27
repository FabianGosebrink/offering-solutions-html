---
id: 111
title: How to include DotNet.HighCharts in ASP.NET MVC with ViewModels
date: 2014-05-09T14:41:01+00:00
author: Fabian Gosebrink
layout: post
tags: aspnet charts highcharts mvc viewmodel
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

Hey,

I want to show you how to include DotNet.HighCharts in ASP.NET MVC working with ViewModels.
  
A charting component is always very cool to see on your page and makes normal plain numbers good-looking.
  
Highcharts are available on Codeplex: <a title="DotNet-Highcharts" href="https://dotnethighcharts.codeplex.com/" target="_blank">DotNet.HighCharts</a>

I will not dive into this whole ViewModel thing. This is something very common in ASP.NET MVC and can also bee seen in the second blog I am working on: <a href="http://blog.noser.com/why-and-how-to-avoid-viewbag-and-viewdata-in-asp-net-mvc/" target="_blank">How to avoid ViewBag and ViewData</a>

So, lets start:

First you have to install the highcharts-components. This can be done with nuget easily.

![How to include DotNet.HighCharts in ASP.NET MVC with ViewModels]({{site.baseurl}}assets/articles/2014-05-09/49c89940-c313-469c-8472-1cb324c8558e.png)

After this you see a folder created in your solution called "HighCharts3.0.1"

![How to include DotNet.HighCharts in ASP.NET MVC with ViewModels]({{site.baseurl}}assets/articles/2014-05-09/d4845434-1552-4a0a-92d3-cf25f79f1b81.png)

Next step would be to reference this file in your view. Do this by adding this to your bundle or doing it explicitly in your View:

![How to include DotNet.HighCharts in ASP.NET MVC with ViewModels]({{site.baseurl}}assets/articles/2014-05-09/591143f7-1526-4f4b-86d5-4d21a7a66fb7.png)

Be sure to have jquery included too. Otherwise this whole thing wont work in the end.

I will now publish the normal case with only having the charts on the ViewModel. Of course in your project the charts are only one of several properties which your viewmodel offers 😉

![How to include DotNet.HighCharts in ASP.NET MVC with ViewModels]({{site.baseurl}}assets/articles/2014-05-09/1ee45eef-47a8-4b91-a7a2-a735939f6830.png)

So add "Chart" as a "Highcharts"-Object to your viewmodel.

Now in your controller you can add your values. (I used just some for testing right here) and get it into the property.

![How to include DotNet.HighCharts in ASP.NET MVC with ViewModels]({{site.baseurl}}assets/articles/2014-05-09/e6b349b1-ebe7-41b4-9c35-28e04a9f3d28.png)

And return the viewmodel into your view.

In the view you can now work with your viewmodel and where you want to show your chart you simply have to get on the Chart-Property provided by your viewmodel:

![How to include DotNet.HighCharts in ASP.NET MVC with ViewModels]({{site.baseurl}}assets/articles/2014-05-09/492c928a-010b-4ff0-8868-eeafc2979c6b.png)The charts requires jQuery. So again: Be sure to have it included at the time your view takes access to your Chart-Property.

![How to include DotNet.HighCharts in ASP.NET MVC with ViewModels]({{site.baseurl}}assets/articles/2014-05-09/4926a6d6-fec6-45e8-95de-4c7cb1636d84.png)So at the end this should be your result.

I will play around with this a little and post more things concerning the DotNet.Highcharts-component in the next days.

Thanks and enjoy

Fabian
