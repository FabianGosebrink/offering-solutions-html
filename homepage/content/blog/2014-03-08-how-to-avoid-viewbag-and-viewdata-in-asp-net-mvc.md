---
title: How to avoid ViewBag and ViewData in ASP.NET MVC
date: 2014-03-08
tags: ['aspnet', 'mvc']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  [
    '/blog/articles/2014/03/08/how-to-avoid-viewbag-and-viewdata-in-asp-net-mvc/',
  ]
---

In this blog post I want to show you How to avoid ViewBag and ViewData in ASP.NET MVC.

It could be so easy: When passing data from the Controller to the View in MVC one can use

```csharp
ViewBag.MyProperty = “ThisIsTheContentOfMyProperty”;
```

or

```csharp
ViewData["MyProperty"] = MyProperty;
```

And in the view you can access the data with:

```csharp
@ViewBag.MyProperty
```

or

```csharp
ViewData["MyProperty "] as ...
```

But what about spelling problems? _IntelliSense_ will not correct you if you would miss a character. Even the compiler does not give you any hint.

```csharp
@ViewBag.MProperty
```

would not be wrong but won’t show any data in your View. Also spelling problems in the ViewData-String would not be noticed in code.

In general: Using the MVC-Pattern is great. So when ASP.NET **MVC** gives us the possibility to use this pattern: Do so!

A Viewbag (also Viewdata, Viewbag is only a wrapper around Viewdata) can be used like a bucket for your data. But this is not nice and it’s harming the Mvc-Pattern!

The view knows its model and should not get any data from anything else. So to avoid using any pails for your data, use ViewModels to pass your data into the View.

This could look like this:

```csharp
public class MyViewModel
{
    public List MyModels { get; set; }
    public string Rooms { get; set; }
    public bool IsSomethingTrueOrNot { get; set; }
    ...
}
```

And in the View you can pass the complete ViewModel to your View

```csharp
public ActionResult MyMethod()
{
    MyViewModel viewModel = new MyViewModel();

    // Do anything with the ViewModel like filling it, etc.

    return View(viewModel);
}
```

With this technique you can keep all the data you need for creating a view separately from your MVC-Models.

This can be tested well; it can be used easily and gives you more structure arrangement to your MVC-Projects.

It’s so easy, isn’t it?

Happy coding!
