---
title: How to build a great RESTful Service
date: 2015-07-20
tags: ['webapi', 'aspnet']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: [
    "/blog/articles/2015/07/20/how-to-build-a-great-restful-service/",
]
---

In this blogpost I want to get you an idea of how to build a great RESTful Service. The idea for this blogpost came after I spent a whole [post](http://blog.noser.com/implementieren-von-paging-in-einer-asp-net-webapi-mitangularjs/) about implementing paging in a web API. Paging is a very important feature a REST API should offer. However, there are a lot more. Here I want to mention a few of them hoping to cover as much as you need to build great API’s ;-)

Before we dive deeper into what an API can do you may think that all this stuff can also be done on the client. But you do not know which kind of client in the future will consume your web API. This can be an intelligent client that can do all the stuff on client side. So why do you have to offer those features then? Because instead of an intelligent client this can also be a “stupid” client which does not support any features at all. And if it only supports simple http-calls it has to use the features you offer with your API. The more you offer, the better it is for those clients. Keep this in your mind during coding your API’s.

**Correct status codes**

_Always_ return the correct status codes in your web API. If you created a database entry, send the HTML-Code for “Created” (201). If something is forbidden send a different status code than for not authenticated and so on.

Modern web API’s are also consumed by applications which live in the internet (and not on a mobile device) like an Asp.Net MVC Application. They all rely on your status codes to get information about what was happening with their request. Moreover, you give them the chance to react to these codes accordingly.

So if you are handling exceptions, not authenticated states etc.: Always get clear information about what was happening to your client with status codes and messages.

**Paging**

On this point I want to refer to the blogpost I have already written. In addition to this I want to mention that the _pagination Header_ should also be filled up with the link to the next page, the link to the last page, the current page size, the total pages, the current page etc.

Yes, you can solve this in a modern client like the one I did in the blogpost with AngularJS. However, for clients which do not support those features: These links are essential to get paging working! So do include them and thank me later. ;-)

```javascript
var paginationHeader = new
{
totalCount = myItems.Count(),
//other Items here…
};
```

**Datashaping**

Datashaping describes the possibility to strip the data you want to send to the client based on what the client was demanding.

If the client only demands the Id, maybe the time point and a description of the objects in a query your API should be able to handle this an only send the requested information.

\*Example:

```javascript
https://myurl.com/api/test?fields=Id,Description,EntryDate
```

Of course, this should also be possible for child classes that are related to your parent class.

\*Example:

```javascript
https://myurl.com/api/test?fields=Id,Description,EntryDate,ChildClass.Id,Childclass.Title
```

Yes, I know OData. Moreover, I love it! I really do. Again: Your API _must_ give the client the opportunity to request only the data he wants to have. To achieve this web API should offer the data-shaping feature.

For this feature, I created a Nuget-Package and a Github-repository that can be downloaded and used.

**Sorting**

The client should also have the possibility to request the items he wants in a special order. Here think of ascending and descending order and this should be possible for every field on the request object the controller was built for. Ascending sort order should be the default while descending can be marked with an minus “-“ in the front of the field to sort after. This is usually a feature which you apply at the very end of your methods. Usually short before returning the data to the client.

Api:

```csharp
public IHttpActionResult Get(…, string sort = "Id")
{
    //use the Sort-string
}
```

\*Example: ´https://myurl.com/api/test?sort=Added´

Where “Added” is a Property of the receiving DTOs.

**Filtered Update**

A mostly forgotten HTTP verb in my opinion is the _Patch_ verb that allows partial updates of an object. So sending the update back to the server (like a post/put action) the patch only has the fields to change and the corresponding values included. After this you can apply the new object to the existing one and update the entry in your database.

Example [here](http://aspnet.codeplex.com/sourcecontrol/latest#Samples/WebApi/DeltaJsonDeserialization/DeltaJsonDeserialization.Server/Controllers/PatchController.cs) and [here](http://www.asp.net/web-api/overview/odata-support-in-aspnet-web-api/odata-v4/create-an-odata-v4-endpoint).

**Https**

Finally yet importantly it has to be mentioned to always use https to communicate with your server. All the data you are passing between your API and your clients has to be secure.

**Summing-up**

In the end building REST-APIs is great. You are very flexible choosing your clients. But always consider giving the client every possible mechanism to get, create, update and delete the data it neds. Thinking about this during the development of a RESTful-API may save you a lot of work later.
