---
id: 979
title: ASP.NET WebAPI Datashaper to strip your json data
date: 2015-05-30 18:23
author: Fabian Gosebrink
layout: post
tags: datashaping github restapi webapi
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

With this blogpost I want to introduce you the ASP.NET WebAPI Datashaper to strip your json data before sending it back to the client.

The Datashaper gives you the possibility to strip the data you want to send based on the query of the client if you can not use Odata for a reason.

[GitHub](https://github.com/OfferingSolutions/OfferingSolutions-Datashaper)
[Project-Page](http://fabian-gosebrink.de/Projects/Datashaper)
[NuGet](http://www.nuget.org/packages/OfferingSolutions.DataShaper/)

[Demo](https://github.com/OfferingSolutions/OfferingSolutions-Datashaper-Demo)

With this Nuget you can add the fields you want to receive in your request like:

```javascript
GET /api/test?fields=Id,Title,Date
```

or

```javascript
GET /api/test?fields=Id,Title,Date,ChildClasses.Description,ChildClasses.Id ...
```

You only have to call

```csharp
Datashaper.CreateDataShapedObject(x, listOfFields)
```

in the end which is going to apply the list of Properties to your data.

This can be useful if you wnat to display a table of your data with only selected fields. You do not have to have every property from your model onto the client and display it. You only need specific fields which you can strip out with this package.

This is equivalent to the OData "$select"-Query option. But this package gives you the opportunity to get the same behaviour without using OData. But if you are interested you should take a look onto [Odata](http://www.odata.org/), too.

Here is an example

```csharp
[Route("myroute")]
public IHttpActionResult Get(string fields = null)
{
    try
    {
        //...

        List<string> listOfFields = new List<string>();
        if (fields != null)
        {
            listOfFields = fields.Split(',').ToList();
        }

        IQueryable<MyItems> myItems = _repository.GetMyItems();

        //...

        var result = myItems
            .ToList()
            .Select(x => Datashaper.CreateDataShapedObject(x, listOfFields));

        return Ok(result);
    }
    catch (Exception)
    {
         return InternalServerError();
    }
}
```

![ASP.NET WebAPI Datashaper to strip your json data]({{site.baseurl}}assets/articles/wp-content/uploads/2015/05/datashaper_1.png)

![ASP.NET WebAPI Datashaper to strip your json data]({{site.baseurl}}assets/articles/wp-content/uploads/2015/05/datashaper_2.png)

![ASP.NET WebAPI Datashaper to strip your json data]({{site.baseurl}}assets/articles/wp-content/uploads/2015/05/datashaper_3.png)

![ASP.NET WebAPI Datashaper to strip your json data]({{site.baseurl}}assets/articles/wp-content/uploads/2015/05/datashaper_4.png)

Regards & HTH

Fabian
