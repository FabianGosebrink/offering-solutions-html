---
title: How to use tag helpers in ASP.NET MVC
date: 2015-11-16
author: Fabian Gosebrink
layout: post
tags: aspnet mvc taghelpers
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

Hey,

in this post I want to show you how to use tag helpers in ASP.NET.

First of all: What are the tag helpers good for?

If you are coding your links in your MVC-Views with normal strings its really hard to refactor or correct them in case you rename your routing, controller or your action. So you need a kind of generic approach to do this.

Razor in previous versions had this

```csharp
Url.Action("MyAction", "MyController", new { id = "123" })
```

which returned an url like `MyController/MyAction/123`

ASP.NET is now introducing a new more readable way to achieve the same result called TagHelpers.

> If you are using the normal Template from Visual Studio ASP-NET TagHelpers are already included! However, I will mention the necessary steps anyway.

Getting started:

First make sure you included a reference to the tag helpers in your project.json

![TagHelpers_1]({{site.baseurl}}assets/articles/wp-content/uploads/2015/11/TagHelpers_1.png)

And Because tag helpers do not throw an exception if you use them and they do not work you should also include a \_ViewImports.cshtml which is responsible to load all extra functionality to your views. You can simply add it via the context menu Add --> New Item.

![TagHelpers_2]({{site.baseurl}}assets/articles/wp-content/uploads/2015/11/TagHelpers_2.png)
![TagHelpers_3]({{site.baseurl}}assets/articles/wp-content/uploads/2015/11/TagHelpers_3.png)

Now all the cshtml files are able to handle ASP.NET-TagHelpers which get easily in your html like this:

`<li><a asp-controller="Home" asp-action="Contact">Contact</a></li>`

which is rendered to

`<li><a href="/Home/Contact">Contact</a></li>`

That is great because you do not have to use a non-html-syntax anymore and it it easier to understand and to read.

You can also write forms in this Html-Tag-Helper-Syntax which is really nice to understand

```
<form asp-controller="Home" asp-action="SendData" method="post" class="form-horizontal" role="form">
    <div asp-validation-summary="ValidationSummary.All" class="text-danger"></div>
    <div class="form-group">
        <label asp-for="Name" class="col-md-2 control-label"></label>
        <div class="col-md-10">
            <input asp-for="Name" class="form-control" />
            <span asp-validation-for="Name" class="text-danger"></span>
        </div>
    </div>
    <div class="form-group">
        <label asp-for="Age" class="col-md-2 control-label"></label>
        <div class="col-md-10">
            <input asp-for="Age" class="form-control" />
            <span asp-validation-for="Age" class="text-danger"></span>
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-10">
            <button type="submit" class="btn btn-default">Send person</button>
        </div>
    </div>
</form>
```

instead of using the "ugly" @-like Sytax before.

Hope to make you curious about tag helpers. Go and use them in your next ASP.NET-Project :)

Regards

Fabian
