---
title: Testing an Angular Http Service
date: 2017-10-02
tags: ['angular', 'testing']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: ['/blog/articles/2017/10/02/testing-angular-2-http-service/']
---

In this blog post I want to show you how you can test the new HttpClient introduced with the version 4.2 of angular.

## The HttpClient service

Lets take this service as a reference

```javascript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomHttpService {

  constructor(private httpClient: HttpClient) { }

  getSingle<T>(id: number) {
    return this.httpClient.get<T>(`http://replace.with.api/anything/${id}`);
  }

  post<T>(item: any) {
    return this.httpClient.post<T>(`http://replace.with.api/anything`, item);
  }

  put<T>(id: number, item: any) {
    return this.httpClient.put<T>(`http://replace.with.api/anything/${id}`, item);
  }

  delete(id: number) {
    return this.httpClient.delete(`http://replace.with.api/anything/${id}`);
  }
}
```

Here we are injecting the httpClient and using it firing a http request to an api.

## Preparation

At first we have to include the `HttpClientTestingModule` and our `CustomHttpService` in our testbed like so:

```javascript
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CustomHttpService } from './http.service';

describe('CustomHttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomHttpService],
    });
  });
});
```

The next step is to hold the `CustomHttpService` itself and the `HttpTestingController` to mock http calls. We need this later on. Modify your sources like this:

```javascript
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CustomHttpService } from './http.service';

describe('CustomHttpService', () => {
  let service: CustomHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomHttpService],
    });

    // inject the service
    service = TestBed.get(CustomHttpService);
    httpMock = TestBed.get(HttpTestingController);
  });
});
```

Notice that we store the service and the httpmock in variables we can access in every test and gets instanciated every time before a test runs `beforEach(...)`

## The testing method

Lets do a single test with the `it(...)` like we know it first.

```javascript
  it('should get the data successful', () => {
     // test goes here
  });
});
```

Next step is to consume the service and fire up a request like we would do it normally. Keep in mind that we are not using the real `HttpClient` but a mock of that provided by angular.

```javascript
  it('should get the data successful', () => {
    service.getSingle(1).subscribe((data: any) => {
      expect(data.name).toBe('Luke Skywalker');
    });
  });
});
```

Here we are also expecting the correct (but faked) result: A property `name` with the value `Luke Skywalker`.

So now we can tell the httpMock what kind of request we expect and toward which URL. We can do this like this:

```javascript
  it('should get the correct star wars character', () => {
    service.getSingle(1).subscribe((data: any) => {
      expect(data.name).toBe('Luke Skywalker');
    });

    const req = httpMock.expectOne(`http://replace.with.api/anything/1`, 'call to api');
    expect(req.request.method).toBe('GET');
  });
});
```

> Notice that the url has to be the same as the url in the service.

So we are expecting a call to this API and we consider it as a GET request.

Last thing is to "fire" the request with its data we really expect. So in this case we give a sample object with a property "name" and the value "Luke Skywalker" as expected.

```javascript
  it('should get the correct star wars character', () => {
    service.getSingle(1).subscribe((data: any) => {
      expect(data.name).toBe('Luke Skywalker');
    });

    const req = httpMock.expectOne(`http://replace.with.api/anything/1`, 'call to api');
    expect(req.request.method).toBe('GET');

    req.flush({
      name: 'Luke Skywalker'
    });

    httpMock.verify();
  });
});
```

With the `httpMock.verify();` we verify that there are not outstanding http calls.

Thats it for the GET request. We can fire up the other (POST/PUT/DELETE) requests in nearly the same way!

Lets do this:

```javascript
it('should post the correct data', () => {
  service.post <
    any >
    { firstname: 'firstname' }.subscribe((data: any) => {
      expect(data.firstname).toBe('firstname');
    });

  const req = httpMock.expectOne(
    `http://replace.with.api/anything`,
    'post to api'
  );
  expect(req.request.method).toBe('POST');

  req.flush({
    firstname: 'firstname',
  });

  httpMock.verify();
});

it('should put the correct data', () => {
  service.put <
    any >
    (3, { firstname: 'firstname' }).subscribe((data: any) => {
      expect(data.firstname).toBe('firstname');
    });

  const req = httpMock.expectOne(
    `http://replace.with.api/anything/3`,
    'put to api'
  );
  expect(req.request.method).toBe('PUT');

  req.flush({
    firstname: 'firstname',
  });

  httpMock.verify();
});

it('should delete the correct data', () => {
  service.delete(3).subscribe((data: any) => {
    expect(data).toBe(3);
  });

  const req = httpMock.expectOne(
    `http://replace.with.api/anything/3`,
    'delete to api'
  );
  expect(req.request.method).toBe('DELETE');

  req.flush(3);

  httpMock.verify();
});
```

You can see that the structure of the tests is the same.

With the new HttpClient you can test your http services with ease.

HTH

Fabian

## Links

https://blog.angular-university.io/angular-http/

https://angular.io/guide/http
