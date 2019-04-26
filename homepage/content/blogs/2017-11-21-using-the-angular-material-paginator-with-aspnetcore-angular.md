---
title: Using the Angular Material Paginator with ASP.NET Core and Angular
date: 2017-11-21 17:15
author: Fabian Gosebrink
layout: post
tags: aspnetcore angular material paging
logo: 'assets/images/logo_small.png'
navigation: true
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

In this blogpost I want to show you how to use Angular Material with Angular to use a table with paging which is driven by an ASP.NET Core WebAPI.

## Code

You can find the code here: [https://github.com/FabianGosebrink/ASPNETCore-Angular-Material-HATEOAS-Paging](https://github.com/FabianGosebrink/ASPNETCore-Angular-Material-HATEOAS-Paging)

## Overview

1. [What is HATEOAS](#getstarted)
2. [The Backend](#thebackend)
    1. [Customer Controller](#customercontroller)
3. [The Frontend](#thefrontend)
    1. [PaginationService](#paginationservice)
    2. [HttpBaseService](#httpbaseservice)
    3. [The Components](#thecomponents)
    4. [Include in module](#module)
    5. [ListComponent](#listcomponent)
    6. [OverviewComponent](#overviewcomponent)
4. [Links](#links)

## <a name="getstarted">Get started</a>

With the Angular Material Table and its Pagination Module it is quite easy to set up paging in a beautiful way so that you can use it on client side and only show a specific amount of entries to your users. What we do not want to do, is loading _all_ items from the backend in the first place just to get the paging going and then display only a specific amount. Instead we want to load only what we need and display that. If the user clicks on the "next page"-button the items should be loaded and displayed.

## <a name="thebackend">The Backend</a>

The backend is an ASP.NET Core WebAPI which sends out the data as JSON. With it, every entry contains the specific links and also all links containing the paging links to the next page, previous page etc, although we do not need them in this example because we already have some implemented logic from Angular Material. If you would not use Angular Material or another "intelligent" UI piece giving you a paging logic, you could use the links to make it all by yourself.

### <a name="customercontroller">Customer Controller</a>

{% highlight js %}

[Route("api/[controller]")]
public class CustomersController : Controller
{
[HttpGet(Name = nameof(GetAll))]
public IActionResult GetAll([FromQuery] QueryParameters queryParameters)
{
List<Customer> allCustomers = \_customerRepository
.GetAll(queryParameters)
.ToList();

    	var allItemCount = _customerRepository.Count();

    	var paginationMetadata = new
    	{
    		totalCount = allItemCount,
    		pageSize = queryParameters.PageCount,
    		currentPage = queryParameters.Page,
    		totalPages = queryParameters.GetTotalPages(allItemCount)
    	};

    	Response.Headers
    		.Add("X-Pagination",
    			JsonConvert.SerializeObject(paginationMetadata));

    	var links = CreateLinksForCollection(queryParameters, allItemCount);

    	var toReturn = allCustomers.Select(x => ExpandSingleItem(x));

    	return Ok(new
    	{
    		value = toReturn,
    		links = links
    	});
    }

}

{% endhighlight %}

We are sending back the information about the paging with HATEOAS but also with a header to read it with Angular later. The `totalcount` is especially interesting for the client. You could also send this back with the JSON response.

{% highlight js %}

var paginationMetadata = new
{
totalCount = allItemCount,
// ...
};

Response.Headers
.Add("X-Pagination",
JsonConvert.SerializeObject(paginationMetadata));

{% endhighlight %}

If you do send it back via the header, be sure to expand the headers in CORS that they can be read on client side.

{% highlight js %}

services.AddCors(options =>
{
options.AddPolicy("AllowAllOrigins",
builder => builder.AllowAnyOrigin()
.AllowAnyMethod()
.AllowAnyHeader()
.AllowCredentials()
.WithExposedHeaders("X-Pagination"));
});

{% endhighlight %}

There is also a parameter which can be passed to the `GetAll` method: `QueryParameters`.

{% highlight js %}

public class QueryParameters
{
private const int maxPageCount = 50;
public int Page { get; set; } = 1;

    private int _pageCount = maxPageCount;
    public int PageCount
    {
        get { return _pageCount; }
        set { _pageCount = (value > maxPageCount) ? maxPageCount : value; }
    }

    public string Query { get; set; }

    public string OrderBy { get; set; } = "Name";

}

{% endhighlight %}

The modelbinder from ASP.NET Core can map the parameters in the request to this object and you can start using them as follows:
`http://localhost:5000/api/customers?pagecount=10&page=1&orderby=Name` is a valid request then which gives us the possibility to grab only the range of items we want to.

## <a name="thefrontend">Frontend</a>

The frontend is build with Angular and Angular Material. Watch the details below.

### <a name="paginationservice">PaginationService</a>

This service is used to collect all the information about the pagination. We are injecting the PaginationService and consuming its values to create the URL and send the request.

{% highlight js %}

@Injectable()
export class PaginationService {
private paginationModel: PaginationModel;

    get page(): number {
        return this.paginationModel.pageIndex;
    }

    get selectItemsPerPage(): number[] {
        return this.paginationModel.selectItemsPerPage;
    }

    get pageCount(): number {
        return this.paginationModel.pageSize;
    }

    constructor() {
        this.paginationModel = new PaginationModel();
    }

    change(pageEvent: PageEvent) {
        this.paginationModel.pageIndex = pageEvent.pageIndex + 1;
        this.paginationModel.pageSize = pageEvent.pageSize;
        this.paginationModel.allItemsLength = pageEvent.length;
    }

}

{% endhighlight %}

We are exposing three properties here which can be changed through the "change()" method. The method takes a `pageEvent` as parameter which comes from the Angular Material Paginator. There every information about the current paging state is stored. We are passing this thing around to get the information about our state of paging having kind of an abstraction of the PageEvent of Angular Material.

### <a name="httpbaseservice">HttpBaseService</a>

{% highlight js %}

@Injectable()
export class HttpBaseService {

    private headers = new HttpHeaders();
    private endpoint = `http://localhost:5000/api/customers/`;

    constructor(
        private httpClient: HttpClient,
        private paginationService: PaginationService) {

        this.headers = this.headers.set('Content-Type', 'application/json');
        this.headers = this.headers.set('Accept', 'application/json');
    }

    getAll<T>() {
        const mergedUrl = `${this.endpoint}` +
            `?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`;

        return this.httpClient.get<T>(mergedUrl, { observe: 'response' });
    }

    getSingle<T>(id: number) {
        return this.httpClient.get<T>(`${this.endpoint}${id}`);
    }

    add<T>(toAdd: T) {
        return this.httpClient.post<T>(this.endpoint, toAdd, { headers: this.headers });
    }

    update<T>(url: string, toUpdate: T) {
        return this.httpClient.put<T>(url,
            toUpdate,
            { headers: this.headers });
    }

    delete(url: string) {
        return this.httpClient.delete(url);
    }

}

{% endhighlight %}

We are injecting the `PaginationService` and consume its values to create the url sending the request to.

### <a name="thecomponents">The Components</a>

Beside the services, the components consume those services and the values. They are reacting on the pageswitch event and are separated in stateful and stateless components.

### <a name="module">Include in module</a>

In the `ListComponent` we are now using the [paginator](https://material.angular.io/components/paginator/overview) module but first we have to include it in our module like this

{% highlight js %}
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
imports: [
MatPaginatorModule,
// ...
]
})

{% endhighlight %}

and then use it in our view like this:

### <a name="listcomponent">ListComponent</a>

<script src="https://gist.github.com/FabianGosebrink/32129a532cf2fee34f9c7a368697f799.js"></script>

The `pageSize` and `pageSizeOptions` come from the `PaginationService` which we inject in the underlying component. On the `(page)` event we are firing the eventemitter and call the action which is bound to it in the stateful component.

{% highlight js %}

export class ListComponent {

    dataSource = new MatTableDataSource<Customer>();
    displayedColumns = ['id', 'name', 'created', 'actions'];

    @Input('dataSource')
    set allowDay(value: Customer[]) {
        this.dataSource = new MatTableDataSource<Customer>(value);
    }

    @Input() totalCount: number;
    @Output() onDeleteCustomer = new EventEmitter();
    @Output() onPageSwitch = new EventEmitter();

    constructor(public paginationService: PaginationService) { }

}

{% endhighlight %}

As the `ListComponent` is a stateless service it gets passed all the values it needs when using it on the stateful component `OverviewComponent`

### <a name="overviewcomponent">OverviewComponent</a>

{% highlight html %}

<app-list
[dataSource]="dataSource"
[totalCount]="totalCount"
(onDeleteCustomer)="delete($event)"
(onPageSwitch)="switchPage($event)" ></app-list>

{% endhighlight %}

{% highlight js %}

export class OverviewComponent implements OnInit {

    dataSource: Customer[];
    totalCount: number;

    constructor(
        private customerDataService: CustomerDataService,
        private paginationService: PaginationService) { }

    ngOnInit(): void {
        this.getAllCustomers();
    }

    switchPage(event: PageEvent) {
        this.paginationService.change(event);
        this.getAllCustomers();
    }

    delete(customer: Customer) {
        this.customerDataService.fireRequest(customer, 'DELETE')
            .subscribe(() => {
                this.dataSource = this.dataSource.filter(x => x.id !== customer.id);
            });
    }

    getAllCustomers() {
        this.customerDataService.getAll<Customer[]>()
            .subscribe((result: any) => {
                this.totalCount = JSON.parse(result.headers.get('X-Pagination')).totalCount;
                this.dataSource = result.body.value;
            });
    }

}

{% endhighlight %}

The `switchPage` method is called when the page changes and first sets all the new values in the paginationService and then gets the customers again. Those values are then provided again in the dataservice, and are consumed there, and also used in the view where they get displayed correctly.

In the `getAllCustomers` method we are reading the `totalCount` value from the headers. Be sure to read the full response in the dataservice by adding `return this.httpClient.get<T>(mergedUrl, { observe: 'response' });` and exposing the header in the CORS options like shown before in this blogpost.

Thanks for reading

Fabian

## Links

[https://angular.io/guide/http#reading-the-full-response](https://angular.io/guide/http#reading-the-full-response)

[https://material.angular.io/components/paginator/overview](https://material.angular.io/components/paginator/overview)

[https://www.pluralsight.com/courses/asp-dot-net-core-restful-api-building](https://www.pluralsight.com/courses/asp-dot-net-core-restful-api-building)
