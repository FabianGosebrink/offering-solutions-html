---
title: Paging in einer ASP.Net WebAPI und AngularJS
date: 2015-06-09
tags: ['angularjs', 'aspnet']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: [
    "/blog/articles/2015/06/09/paging-in-einer-asp-net-webapi-und-angularjs/",
]
---

In diesem Blogpost will ich zeigen, wie man paging in einer ASP.NET WebAPI und AngularJS realisieren kann.

Eine gute API sollte mehrere Features anbieten. Eins davon ist Paging. In diesem Beispiel zeige ich Paging mit AngularJS und wie man es auf dem Client konsumieren kann.

Als erstes sollte man dem Client anbieten per Parameter nur eine bestimmte Anzahl von Einträgen abzurufen.

```csharp
[Route("myRoute")]
public IHttpActionResult Get(int start = 0, int count = 10)
{
     //...
}
```

Man definiert ein Start und eine Anzahl von Items, die abgerufen werden. Per default weisen wir hier zehn Items zu (Range 0-10).

Somit geben wir als Ergebnis per LINQ nur die Anzahl der Items zurück, die der Client angefordert hat.

```csharp
[Route("schedules")]
public IHttpActionResult Get(int start = 0, int count = 10)
{
    try
    {
        IQueryable<MyItem> myItems = _repository.getMyItems();

        var result = myItems
            .Skip(start)
            .Take(count)
            .ToList();

        return Ok(result);
    }
    catch (Exception)
    {
        return InternalServerError();
    }
}
```

Das Problem an der Stelle ist nun, dass der Client wissen muss, wieviele Items es insgesamt gibt, damit er die richtige Anzahl der Seiten darstellen kann.

Um dem Client die komplette Anzahl der Items mitzuteilen erweitern wir den ResponseHeader um Informationen.

```csharp
[Route("schedules")]
public IHttpActionResult Get(int start = 0, int count = 10)
{
    try
    {
        IQueryable<MyItem> myItems = _repository.getMyItems();

        var paginationHeader = new
        {
            totalCount = myItems.Count(),
        };

        HttpContext.Current.Response.Headers.Add("X-Pagination",
           JsonConvert.SerializeObject(paginationHeader));

        var result = myItems
            .Skip(start)
            .Take(count)
            .ToList();

        return Ok(result);
    }
    catch (Exception)
    {
        return InternalServerError();
    }
}
```

Im Response-Header steht nun die Anzahl der kompletten Items:

![Paging in einer ASP.Net WebAPI und AngularJS](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/06/1.png)

Diese brauchen wir dann nur noch im Client parsen bzw. lesen.

Ich benutze die Pagination-Komponente der [Bootstrap-Direktiven](https://angular-ui.github.io/bootstrap/#/pagination).

Html:

```html
<pagination
  ng-show="totalItems > maximalItemsPerPage"
  items-per-page="maximalItemsPerPage"
  total-items="totalItems"
  ng-model="currentPage"
  ng-change="pageChanged()"
></pagination>
```

Hierbei wird die Leiste zum navigieren nur angezeigt, wenn die Anzahl der Items grösser ist als die, die maximal auf einer Seite angezeigt werden sollen.

```javascript
myModule.controller('myController', [
  '$scope',
  'myRepository',
  function($scope, myRepository) {
    $scope.currentPage = 1;
    $scope.maximalItemsPerPage = 5;

    var getMyItems = function(start, count) {
      myRepository.getAllItems(start, count).then(
        function(result) {
          //Success
          var totalPagesObject = JSON.parse(result.headers()['x-pagination']);
          $scope.totalItems = totalPagesObject.totalCount;
        },
        function() {
          //Error
        }
      );
    };

    //...

    $scope.pageChanged = function() {
      console.log('Page changed to: ' + $scope.currentPage);
      getMyItems(
        ($scope.currentPage - 1) * $scope.maximalItemsPerPage,
        $scope.maximalItemsPerPage
      );
    };
  }
]);
```

Hier werden die Standardwerte gesetzt und beim erfolgreichen Abrufen der Items wird der Header ausgelesen und die Variable "totalItems" gesetzt, auf die dann gebunden wird.

![Paging in einer ASP.Net WebAPI und AngularJS](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/06/2.png)

Grüsse

Fabian
