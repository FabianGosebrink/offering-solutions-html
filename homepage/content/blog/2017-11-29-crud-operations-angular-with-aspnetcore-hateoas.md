---
title: CRUD operations in Angular with ASP.NET Core and HATEOAS
date: 2017-11-29
tags: ['aspnetcore', 'angular', 'hateoas']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  ['/blog/articles/2017/11/29/crud-operations-angular-with-aspnetcore-hateoas/']
---

This blog post shows how to implement CRUD operations in Angular which are driven by an ASP.NET Core Web API using HATEOAS.

## A quick note

The HATEOAS in this repository does not follow any "standard" like e.g. [HAL](http://stateless.co/hal_specification.html). But it is enough that you get the idea and an impression how to use it.

I played around a little bit with this in the last time and maybe you can get some inspiration of how to get stuff going with that in your project. This is only one approach. I would love to hear yours in the comments :-)

## Code

You can find the code here: [https://github.com/FabianGosebrink/ASPNETCore-Angular-Material-HATEOAS-Paging](https://github.com/FabianGosebrink/ASPNETCore-Angular-Material-HATEOAS-Paging)

## Overview

1. [What is HATEOAS](#whatishateoas)
2. [The Backend](#thebackend)
   1. [Customer Controller](#customercontroller)
   2. [The response](#theresponse)
3. [The Frontend](#thefrontend)
   1. [The data services](#thedataservicesfrontend)
   2. [The components](#thecomponents)
4. [Links](#links)

## <a name="whatishateoas">What is HATEOAS</a>

HATEOAS stands for _hypermedia as the engine of application state_. Through the separation of client and server HATEOAS provides the possibility to both sides growing and evolving separately. With HATEOAS the server not only exposes the resource the client asked for but also the links telling how to navigate through the application. There is no standard for HATEOAS out there yet (maybe some day there will be one) but different ways to do HATEOAS. One of them is [HAL](http://stateless.co/hal_specification.html), but there is also [JSON-LD](https://json-ld.org/), etc. A nice blog post which discusses all the different approaches can be found in the links.

## <a name="thebackend">The Backend</a>

The backend is an ASP.NET Core Web API, which provides the data using JSON. Every HTTP response contains the specific links and also all links containing the paging links to the next page, previous page etc.

### <a name="customercontroller">Customer Controller</a>

```javascript
[Route("api/[controller]")]
public class CustomersController : Controller
{
	private readonly ICustomerRepository _customerRepository;
	private readonly IUrlHelper _urlHelper;

	public CustomersController(
		IUrlHelper urlHelper,
		ICustomerRepository customerRepository)
	{
		_customerRepository = customerRepository;
		_urlHelper = urlHelper;
	}

	[HttpGet(Name = nameof(GetAll))]
	public IActionResult GetAll(
		[FromQuery] QueryParameters queryParameters)
	{
		List<Customer> allCustomers =
			_customerRepository.GetAll(queryParameters).ToList();

		var allItemCount = _customerRepository.Count();

		var links = CreateLinksForCollection(queryParameters, allItemCount);

		var toReturn = allCustomers.Select(x => ExpandSingleItem(x));

		return Ok(new
		{
			value = toReturn,
			links = links
		});
	}

	[HttpGet]
	[Route("{id:int}", Name = nameof(GetSingle))]
	public IActionResult GetSingle(int id)
	{
		Customer customer = _customerRepository.GetSingle(id);

		if (customer == null)
		{
			return NotFound();
		}

		return Ok(ExpandSingleItem(customer));
	}

	[HttpPost(Name = nameof(Add))]
	public IActionResult Add([FromBody] CustomerCreateDto customerCreateDto)
	{
		if (customerCreateDto == null)
		{
			return BadRequest();
		}

		if (!ModelState.IsValid)
		{
			return BadRequest(ModelState);
		}

		Customer toAdd = Mapper.Map<Customer>(customerCreateDto);

		toAdd.Created = DateTime.Now;
		_customerRepository.Add(toAdd);

		if (!_customerRepository.Save())
		{
			throw new Exception("Creating an item failed on save.");
		}

		Customer newItem = _customerRepository.GetSingle(toAdd.Id);

		return CreatedAtRoute(nameof(GetSingle), new { id = newItem.Id },
			Mapper.Map<CustomerDto>(newItem));
	}

	[HttpDelete]
	[Route("{id:int}", Name = nameof(Delete))]
	public IActionResult Delete(int id)
	{
		Customer customer = _customerRepository.GetSingle(id);

		if (customer == null)
		{
			return NotFound();
		}

		_customerRepository.Delete(id);

		if (!_customerRepository.Save())
		{
			throw new Exception("Deleting an item failed on save.");
		}

		return NoContent();
	}

	[HttpPut]
	[Route("{id:int}", Name = nameof(Update))]
	public IActionResult Update(int id, [FromBody]CustomerUpdateDto updateDto)
	{
		if (updateDto == null)
		{
			return BadRequest();
		}

		var existingCustomer = _customerRepository.GetSingle(id);

		if (existingCustomer == null)
		{
			return NotFound();
		}

		if (!ModelState.IsValid)
		{
			return BadRequest(ModelState);
		}

		Mapper.Map(updateDto, existingCustomer);

		_customerRepository.Update(id, existingCustomer);

		if (!_customerRepository.Save())
		{
			throw new Exception("Updating an item failed on save.");
		}

		return Ok(ExpandSingleItem(existingCustomer));
	}

	private List<LinkDto> CreateLinksForCollection(
		QueryParameters queryParameters, int totalCount)
	{
		var links = new List<LinkDto>();

		links.Add(
		 new LinkDto(_urlHelper.Link(nameof(Add), null), "create", "POST"));

		// self
		links.Add(
		 new LinkDto(_urlHelper.Link(nameof(GetAll), new
		 {
			 pagecount = queryParameters.PageCount,
			 page = queryParameters.Page,
			 orderby = queryParameters.OrderBy
		 }), "self", "GET"));

		links.Add(new LinkDto(_urlHelper.Link(nameof(GetAll), new
		{
			pagecount = queryParameters.PageCount,
			page = 1,
			orderby = queryParameters.OrderBy
		}), "first", "GET"));

		links.Add(new LinkDto(_urlHelper.Link(nameof(GetAll), new
		{
			pagecount = queryParameters.PageCount,
			page = queryParameters.GetTotalPages(totalCount),
			orderby = queryParameters.OrderBy
		}), "last", "GET"));

		if (queryParameters.HasNext(totalCount))
		{
			links.Add(new LinkDto(_urlHelper.Link(nameof(GetAll), new
			{
				pagecount = queryParameters.PageCount,
				page = queryParameters.Page + 1,
				orderby = queryParameters.OrderBy
			}), "next", "GET"));
		}

		if (queryParameters.HasPrevious())
		{
			links.Add(new LinkDto(_urlHelper.Link(nameof(GetAll), new
			{
				pagecount = queryParameters.PageCount,
				page = queryParameters.Page - 1,
				orderby = queryParameters.OrderBy
			}), "previous", "GET"));
		}

		return links;
	}

	private dynamic ExpandSingleItem(Customer customer)
	{
		var links = GetLinks(customer.Id);
		CustomerDto item = Mapper.Map<CustomerDto>(customer);

		var resourceToReturn = item.ToDynamic()
			as IDictionary<string, object>;

		resourceToReturn.Add("links", links);

		return resourceToReturn;
	}

	private IEnumerable<LinkDto> GetLinks(int id)
	{
		var links = new List<LinkDto>();

		links.Add(
		  new LinkDto(_urlHelper.Link(nameof(GetSingle), new { id = id }),
		  "self",
		  "GET"));

		links.Add(
		  new LinkDto(_urlHelper.Link(nameof(Delete), new { id = id }),
		  "delete",
		  "DELETE"));

		links.Add(
		  new LinkDto(_urlHelper.Link(nameof(Add), null),
		  "create",
		  "POST"));

		links.Add(
		   new LinkDto(_urlHelper.Link(nameof(Update), new { id = id }),
		   "update",
		   "PUT"));

		return links;
	}
}
```

### <a name="theresponse">The response</a>

So if we now start the WebAPI with `dotnet run` and fire a request to the endpoint `http://localhost:5000/api/customers/` we get the following result

```json
{
  "value": [
    {
      "id": 1,
      "name": "Phil Collins",
      "created": "2017-11-17T20:23:36.2179591+01:00",
      "links": [
        {
          "href": "http://localhost:5000/api/customers/1",
          "rel": "self",
          "method": "GET"
        },
        {
          "href": "http://localhost:5000/api/customers/1",
          "rel": "delete",
          "method": "DELETE"
        },
        {
          "href": "http://localhost:5000/api/customers",
          "rel": "create",
          "method": "POST"
        },
        {
          "href": "http://localhost:5000/api/customers/1",
          "rel": "update",
          "method": "PUT"
        }
      ]
    }
    // ... more of values here
  ],
  "links": [
    {
      "href": "http://localhost:5000/api/customers?pagecount=50&page=1&orderby=Name",
      "rel": "self",
      "method": "GET"
    },
    {
      "href": "http://localhost:5000/api/customers?pagecount=50&page=1&orderby=Name",
      "rel": "first",
      "method": "GET"
    },
    {
      "href": "http://localhost:5000/api/customers?pagecount=50&page=1&orderby=Name",
      "rel": "last",
      "method": "GET"
    }
  ]
}
```

Because of the `QueryParameters` we can also fire a requeste like `http://localhost:5000/api/customers?pagecount=10&page=1&orderby=Name` and we can get paging going on over the link there.

## <a name="thefrontend">The Frontend</a>

The frontend application is implemented using AngularCLI and Angular Material. The SPA application has 3 modules:

- core - Provides the base services to the application
- customer - Has all customer related components such as the list and the details
- app - the application module

which you can see in the repository.

### <a name="thedataservicesfrontend">The data services</a>

The core module is implementing the data services to ensure the communication with the ASP.NET Core WebAPI.

```javascript
@Injectable()
export class HttpBaseService {

    private headers = new HttpHeaders();
    private endpoint = `http://localhost:5000/api/customers/`;

    constructor(
        private httpClient: HttpClient) {
        this.headers = this.headers.set('Content-Type', 'application/json');
        this.headers = this.headers.set('Accept', 'application/json');
    }

    getAll<T>() {
        return this.httpClient.get<T>(this.endpoint, { observe: 'response' });
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
```

The `HttpBaseService` is abstracts the HTTP requests for the application. The interesting part is that the `update` and `delete` methods are getting the complete URL passed as a parameter. This will be explained later. The `add` method is doing a post to the same URL as the `getAll` function.

> The url part before the `customer/` can be extracted in a seperate service if you want. This would come from the environment you are running on later.

The specific `CustomerDataService` then exposes only one method by extending the `HttpBaseService`. It switches around the method type which gets passed as a parameter for the corresponding method, like doing an Update (PUT), an Add (ADD) or a Delete (DELETE).

```javascript
@Injectable()
export class CustomerDataService extends HttpBaseService {
  fireRequest(customer: Customer, method: string) {
    const links = customer.links
      ? customer.links.find((x) => x.method === method)
      : null;

    switch (method) {
      case 'DELETE': {
        return super.delete(links.href);
      }
      case 'POST': {
        return super.add < Customer > customer;
      }
      case 'PUT': {
        return super.update < Customer > (links.href, customer);
      }
      default: {
        console.log(`${links.method} not found!!!`);
        break;
      }
    }
  }
}
```

### <a name="thecomponents">The components</a>

To use this in a component, only the `fireRequest` method with the correct HTTP verb needs to be called:

```javascript
export class DetailsComponent implements OnInit {

    customer = new Customer();

    constructor(
        private customerDataService: CustomerDataService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        this.customerDataService.getSingle<Customer>(+id)
            .subscribe(customer => this.customer = customer);
    }

    save() {

        const method = this.customer.id ? 'PUT' : 'POST';

        this.customerDataService
            .fireRequest(this.customer, method)
            .subscribe((customer: Customer) => this.customer = customer);
    }
}
```

Or to get all customers in this case

```javascript
export class OverviewComponent implements OnInit {

    dataSource: Customer[];

    constructor(
        private customerDataService: CustomerDataService) { }

    ngOnInit(): void {
        this.getAllCustomers();
    }

    delete(customer: Customer) {
        this.customerDataService.fireRequest(customer, 'DELETE')
            .subscribe(() => {
                this.dataSource =
                    this.dataSource.filter(x => x.id !== customer.id);
            });
    }

    getAllCustomers() {
        this.customerDataService.getAll<Customer[]>()
            .subscribe((result: any) => {
                this.dataSource = result.body.value;
            });
    }
}
```

So, you can see that for update, add and delete methods only one method with the correct HTTP verb has to be called. The URL comes from the entity (customer in this case) itself which gets served over the endpoint coming with its links.

I hope I could give you inspiration of what you can do with Angular and ASP.NET Core. If you made it that far: Thanks for reading.

Fabian

## <a name="links">Links</a>

[https://github.com/nbarbettini/BeautifulRestApi](https://github.com/nbarbettini/BeautifulRestApi)

[https://sookocheff.com/post/api/on-choosing-a-hypermedia-format/](https://sookocheff.com/post/api/on-choosing-a-hypermedia-format/)

[http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven](http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)
