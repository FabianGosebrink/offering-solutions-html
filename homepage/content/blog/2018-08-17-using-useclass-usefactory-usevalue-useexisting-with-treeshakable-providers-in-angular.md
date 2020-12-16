---
title: Using UseClass, UseFactory, UseValue & UseExisting with treeshakable providers in Angular
date: 2018-08-17
tags: ['angular']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  [
    '/blog/articles/2018/08/17/using-useclass-usefactory-usevalue-useexisting-with-treeshakable-providers-in-angular/',
  ]
---

In this blog post I want to describe how to use the `useClass`, `useValue`, `useFactory`, `useExisting` providers in the new [treeshakable providers](https://angular.io/guide/providers) from Angular.

After this blog post you should have an example how to use those four providers and have an idea what to do with it in case they are a solution to some problems you might face when developing Angular applications.

## Introduction

Everybody is talking about the `providedIn` property of the configuration object which can be passed to the `Injectable()` decorator of the Angular services. Basically this means that a service can provide himself to a specific injector and is treeshakeable. That means if the service is not used it will get shaken out to get your application smaller and faster. Actually this is a pretty good thing and was mentioned many times already.

But the `providedIn` property is only one property of many which can describe how your service should be provided to your application. We got

- [UseClass](#useclass)
- [UseFactory](#usefactory)
- [UseValue](#usevalue)
- [UseExisting](#useexisting)
- [Testing](#testing)

too.

Let us start having the [AngularCLI](https://cli.angular.io/) installed and scaffolding a new project with `ng new myNewPlayground` and wait for it to finish. After it did we can `cd` into the folder with `cd myNewPlayground` and create a new service with `ng generate service Test`. The AngularCLI will create a new service for us looking a little something like this:

```javascript
@Injectable({
  providedIn: 'root',
})
export class TestService {
  constructor() {}
}
```

This is where we start basically.

Lets modify the service like this

```javascript
@Injectable({
  providedIn: 'root',
})
export class TestService {
  sayHello() {
    console.log(`From TestService --> Hello`);
  }
}
```

So we added a method which basically does nothing else than logging something out to the console. Nothing spectacular so far.

In our `AppComponent` let us use this service now

```javascript
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    title = 'myNewPlayground';

    constructor(private readonly testService: TestService) {
        testService.sayHello();
    }
}
```

Again, we are using the service, calling the method which logs something out. We will use the method to see which service is gonna be used later.

If we run that one with `npm start` we can see in the console that

```
From TestService --> Hello
```

is printed out.

## UseClass

So we see the `providedIn` already, which works, which is great, but we can use `useClass`, too in this case.

Lets add another class which is like the same service but has a different name.

```javascript
export class TestService2 {
  sayHello() {
    console.log(`From TestService2 --> Hello`);
  }
}
```

> Note that this is a normal typescript class. There is no Angular reference to this class, no decorator, nothing so far.

Lets use the `useClass` provider now. Modify the configuration object to our decorator like the following

```javascript
export class TestService2 {
  sayHello() {
    console.log(`From TestService2 --> Hello`);
  }
}

@Injectable({
  providedIn: 'root',
  useClass: TestService2, // <-- add this line
})
export class TestService {
  sayHello() {
    console.log(`From TestService --> Hello`);
  }
}
```

We are telling Angular now that if we are asking for this service anywhere in our application we want to use a different service instead! If we check the console we see that we are working with the instance of `TestService2` now.

```
From TestService2 --> Hello
```

Okay, so that is how we can switch services 'under the hood'.

Let's see what `useFactory` can do.

## UseFactory

With `useFactory` we can use a factory at runtime to decide which kind of service we want to return if it got requested by any other class in our application.

> Note that you do not want to change the method and/or property calls on your requesting instances when `ServiceB` is being returned instead of `ServiceA`. You could use interfaces as contracts and abstract classes here for example.

So lets create a new service first with has the same method as the other services and return a new instance in a function then. Aditionally lets a a method as factory which we can pass to the `useFactory` provider.

```javascript
export class TestService3 {
  sayHello() {
    console.log(`From TestService3 --> Hello`);
  }
}

export function xyzFactory() {
  return new TestService3();
}

export class TestService2 {
  // ...
}

@Injectable({
  providedIn: 'root',
  useFactory: xyzFactory,
})
export class TestService {
  sayHello() {
    console.log(`From TestService --> Hello`);
  }
}
```

Running that will result in printing

```
From TestService3 --> Hello
```

on the console. This factory pattern comes out of the box which is very powerful and gives your great possibilities when it comes to cross platform development.

### Adding dependencies to the factory

Sometimes you have to add some dependencies to the factory because you need it to decide whether to return serviceA or serviceB. However, you can add the dependencies with the `deps` property on the configuration object.

Let us assume that we have to have the `HttpClient` from `@angular/common/http` inside our factory we can add it to our `deps` property inside an array.

```javascript
export class TestService3 {
  sayHello() {
    console.log(`From TestService3 --> Hello`);
  }
}

export function xyzFactory(http: HttpClient) {
  console.log(!!http);
  return new TestService3();
}

export class TestService2 {
  // ...
}

@Injectable({
  providedIn: 'root',
  useFactory: xyzFactory,
  deps: [HttpClient],
})
export class TestService {
  sayHello() {
    console.log(`From TestService --> Hello`);
  }
}
```

> Do not forget to include the HttpClientModule in the app.module.ts in this case.

If we check the console now we can see

```
true
test.service.ts:6 From TestService3 --> Hello
```

Alright, so we can use the `deps` property like usual. Let's see `useValue` next.

## UseValue

You might get the idea that in relation to the others `useValue` is providing a single value. This way you can pass single values around and inject them into your components, services, etc.

To test the service now - remember we did not change our app.component at all until here - as the 'value' we could use an javascript object with a property on it which is a function doing something. This is a value, too :). So lets do this.

```javascript
@Injectable({
  providedIn: 'root',
  useValue: {
    sayHello: function () {
      console.log('whuuuut??');
    },
  },
})
export class TestService {
  sayHello() {
    console.log(`From TestService --> Hello`);
  }
}
```

Our console in the browser now prints out

```
whuuuut??
```

So this works, too. Instead of the `TestService` we are passing an object and to not let our app.component crash we give it a function called `sayHello` which gets called instead of the function of our `TestService`.

Last but not least let us take a look into `useExisting`

## UseExisting

Image you have a service `ServiceA` in your application which you want to update with `ServiceB` but you can't for any reason. It would be nice if you could do like an alias: Everybody who is asking for `ServiceA` should get `ServiceB` and all the new code you write will use `ServiceB` anyway. That brings you to _not_ have two services with the same interface in your app: an old one and a new one. You only have the new one.

We already know `useClass`. You could easily provide a `ServiceB` and everybody asking for `ServiceA`: `useClass` will come into play and provide `ServiceB` instead. But this has the problem that you have two instances of your services in your application.

```javascript
@Injectable({
  providedIn: 'root',
})
export class ServiceB {
  sayHello() {
    console.log(`From ServiceB --> Hello`);
  }
}

@Injectable({
  providedIn: 'root',
  useClass: ServiceB,
})
export class ServiceA {
  sayHello() {
    console.log(`From ServiceA --> Hello`);
  }
}
```

will create two instances of your `ServiceB` class which might not be what you want. And this is where `useExisting` comes into play. Using that you can refer to an already existing service and so act as an alias. Keep in mind that this time your class has to be an Angular service with a decorator and not a plain class like in the examples above. Lets use it and get our service names in again.

```javascript
@Injectable({
  providedIn: 'root',
})
export class TestService2 {
  sayHello() {
    console.log(`From TestService2 --> Hello`);
  }
}

@Injectable({
  providedIn: 'root',
  useExisting: TestService2,
})
export class TestService {
  sayHello() {
    console.log(`From TestService --> Hello`);
  }
}
```

will result in

```
From TestService2 --> Hello
```

on the console.

As we have mentioned that let us take a look at unit testing.

## Testing

When it comes to testing you do not need to provide the services in the testing module if you want to test a service in your unit tests.

Out of the box the AngularCLI creates a unit test for you looking like this.

```javascript
import { TestBed, inject } from '@angular/core/testing';

import { TestService } from './test.service';

describe('TestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestService],
    });
  });

  it('should be created', inject([TestService], (service: TestService) => {
    expect(service).toBeTruthy();
  }));
});
```

Thanks to the treeshakeable providers we can refactor this one to the following

```javascript
import { TestBed } from '@angular/core/testing';
import { TestService } from './test.service';

describe('TestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service = TestBed.get(TestService);
    expect(service).toBeTruthy();
  });
});
```

As we do not need the services in the providers array of the testing module. We can get it from the `TestBed` as if we provided it as our modules don't use the provider-array anymore because of the new syntax of threeshakeable providers.

> If you would like to change the class which is being used by the unit tests you still hav to use the `providers` array with your specific `useClass`, etc. property

### Testing with optional dependencies

So Angular searches for all the services which are `providedIn: 'root'` automatically. Let us take a look at optional dependencies and see how they behave.

```javascript
@Injectable({
  providedIn: 'root',
})
export class TestServieWithoutHttp {
  constructor() {
    console.log(`TestServieWithoutHttp created`);
  }
}

@Injectable({
  providedIn: 'root',
})
export class OptionalServiceWithHttp {
  constructor(private http: HttpClient) {
    console.log(`OptionalServiceWithHttp created`);
  }
}

@Injectable({
  providedIn: 'root',
})
export class TestServiceWithHttp {
  constructor(private http: HttpClient) {
    console.log(`TestServiceWithHttp created`);
  }
}

// ...
@Injectable({
  providedIn: 'root',
})
export class ServiceToTest {
  constructor(
    private testServiceWithHttp: TestServiceWithHttp,
    @Optional() private optionalServiceWithHttp?: OptionalServiceWithHttp
  ) {}
}
```

See the `@Optional()` decorator we use in the `ServiceToTest`? So the `ServiceToTest` uses a service which gets injected an `HttpClient` and an optional other service which also gets injected an `HttpClient`.

Our test looks like this:

```javascript
describe('ServiceToTest', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TestServiceWithHttp,
          useClass: TestServieWithoutHttp,
        },
        ServiceToTest,
      ],
    });
  });

  it('should be created', () => {
    const serviceToTest: ServiceToTest = TestBed.get(ServiceToTest);
    expect(serviceToTest).toBeTruthy();
  });
});
```

And this test if the service can get created blows up with an error:

```
Error: StaticInjectorError(DynamicTestModule)[HttpClient]:
    StaticInjectorError(Platform: core)[HttpClient]:
        NullInjectorError: No provider for HttpClient!
```

But why is that? We do not want to mock anything Http specific here and exactly because of that we are using the `useClass` to switch the service which relies on Http to a service which does not rely on Http.

So it turns out that Angular searches for the optional dependencies as well and the `OptionalServiceWithHttp` also uses Http. As we do not provide the `HttpClientTestingModule` in the test, because our test should not rely on Http, the test blows up. We can solve the issue by mocking our optional dependencies as well.

```javascript
describe('ServiceToTest', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TestServiceWithHttp,
          useClass: TestServieWithoutHttp,
        },
        { provide: OptionalServiceWithHttp, useValue: null }, // See this line?
        ServiceToTest,
      ],
    });
  });

  it('should be created', () => {
    const serviceToTest: ServiceToTest = TestBed.get(ServiceToTest);
    expect(serviceToTest).toBeTruthy();
  });
});
```

### Recap

- `useClass`, `useValue`, `useFactory`, `useExisting` can be used with the new syntax mostly like before
- The `TestBed` is "pre-provided" with all dependencies declared with `@Injectable({ providedIn: 'root' })`.
- That can be a big surprise if you _thought you had to provide everything to `TestBed`_
- It can bite you if you don’t _mock out optional dependencies_ too.

Big thanks to [@wardbell](https://twitter.com/wardbell) especially to point out the unit test scenarios.

HTH

Fabian
