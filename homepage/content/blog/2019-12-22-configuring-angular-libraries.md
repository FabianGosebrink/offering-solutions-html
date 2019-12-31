---
title: How to configure Angular libraries
date: 2019-12-21
tags: ['angular', 'libraries', 'configuration']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this article I want to explain two possible ways to configure Angular libraries.

With libraries we have a convenient way to separate logic which is used multiple times across more than one application or libraries can define our architecture especially when working with a monorepo.

Libraries build a standalone codebase where complete modules with all its services, components etc. can be stored away and can be included into your Angular app.

This works pretty fine but if you want to make the libraries more flexible you can pass a configuration into that library to make the library work as you need it based on values the consuming application provides.

In the following blog post I want to share two ways of configuring Angular Libraries and how that work in code.

Github: [https://github.com/FabianGosebrink/angular-library-configuration](https://github.com/FabianGosebrink/angular-library-configuration)

## Preparation

First of all we can create a new Angular project with

```
ng new configuring-libraries --createApplication=false
```

The `--createApplication=false` creates only the workspace files but does not add an application on root level. This gives us more flexibility and overview when working with libs and apps inside this workspace.

Now let us add an application with `ng generate app consumerApp` and a library with `ng generate library lib-to-configure`.

We now have a `projects` folder created with two applications in it.

```
└── projects
    ├── consumerApp
    └── lib-to-configure
```

In the `lib-to-configure` library we will find a scaffolded module like this:

```js
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { LibToConfigureComponent } from './lib-to-configure.component';

@NgModule({
  declarations: [LibToConfigureComponent],
  imports: [CommonModule],
  exports: [LibToConfigureComponent]
})
export class LibToConfigureModule {}
```

If we want to use the library we have to import this module into our `consumerApp`s `AppModule` by adding it to the `imports` array of the `app.module.ts`.

```js
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, LibToConfigureModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Now we can use the libraries components which are getting exported from that library inside our application.

## Configuration

If you now want to pass configuration to your library you have two ways: First one is to have this configuration statically if you already know what your library should deal with.

```js
const config = {
  name: 'Fabian'
};
```

...could be a possible configuration which can get passed into the library.

On the other side you may have a dynamic configuration in terms of not knowing the configuration before you start the application when you for example read it from a backend getting back a configuration json which then should get passed into the library. I call this one a dynamic configuration in the article here.

### Static configuration

If you want to pass a static configuration object in a library you first can create a file called `lib-configuration.ts` and place it inside the `lib` folder f your library. It contains the configuration you want to provide to the outside world:

```js
export class LibToConfigureConfiguration {
  name: string;
}
```

In the `public-api` export the file to make it visible to the outside world:

```js
export * from './lib/lib-configuration'; // <-- Add this line
export * from './lib/lib-to-configure.component';
export * from './lib/lib-to-configure.module';
export * from './lib/lib-to-configure.service';
```

Having done that we need to configure our lib to receive the config from the outside. For this, we will add a `forRoot(...)` method to the libraries module which will return the configured module and expect the static configuration object.

```js
import { LibToConfigureConfiguration } from './lib-configuration';

@NgModule({
  /*...*/
})
export class LibToConfigureModule {
  static forRoot(
    libConfiguration: LibToConfigureConfiguration
  ): ModuleWithProviders {
    return {
      ngModule: LibToConfigureModule,
      providers: [
        {
          provide: LibToConfigureConfiguration,
          useValue: libConfiguration
        }
      ]
    };
  }
}
```

With this we can now receive the class and inject it in the consuming maybe components like

```js
import { Component, OnInit } from '@angular/core';
import {
  LibConfigurationProvider,
  LibToConfigureConfiguration
} from './lib-configuration';

@Component({
  selector: 'lib-libToConfigure',
  template: `
    <p>
      lib-to-configure works!
    </p>
  `,
  styles: []
})
export class LibToConfigureComponent implements OnInit {

  ngOnInit() {
    console.log(this.libToConfigureConfiguration);
  }

  constructor(
    private readonly libToConfigureConfiguration: LibToConfigureConfiguration
  ) {}
}

```

which will print the current configuration to the console.

As the last step we have to call the `forRoot()` method and pass it some configuration. So in the `consumerApp` we will change the `app.module.ts` to

```js
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LibToConfigureModule } from 'lib-to-configure';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, LibToConfigureModule.forRoot({ name: 'Fabian' })],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

If you build the lib now and start the application using the component from the lib the `ngOnInit()` method prints `{ name: "Fabian" }` to the console.

Nice, so we know how to pass a static configuration to a library.

### Dynamic Configuration

Things get a little more complex if we do not know the configuration at the startup time of our application which means it is dynamic. We do not have a static JSON object we can simply pass down the lib. Let us target that next.

For this let us take a quick look what we can pass down to the providers array in the library in the `forRoot` method. The `providers` array takes a `Provider` type! We can use this one to expect it from the consuming application and we can provide a default config in case we as a library do not get given one configuration. This makes the configuration more flexible because we are not passing the static config, but a class which provides us the configuration object.

For this first of all in the `lib-configuration.ts` introduce a class which is the type for what we are gonna use:

```js
import {  Provider } from '@angular/core';

export class LibToConfigureConfiguration {
  name: string;
}

export class LibConfiguration {
  config?: Provider;
}
```

Next, let us write a `LibConfigurationProvider` as an abstract class which provides a property which represents the configuration then and let us create a default configuration `DefaultLibConfiguration` which is used if the consuming app does not pass a config down to the library:

```js
import { Injectable, Provider } from '@angular/core';

export class LibToConfigureConfiguration {
  name: string;
}

@Injectable({ providedIn: 'root' })
export abstract class LibConfigurationProvider {
  abstract get config(): LibToConfigureConfiguration;
}

@Injectable({ providedIn: 'root' })
export class DefaultLibConfiguration extends LibConfigurationProvider {
  get config(): LibToConfigureConfiguration {
    // return default config
    return { name: `Fallback` };
  }
}

export class LibConfiguration {
  config?: Provider;
}
```

In the `LibToConfigureModule`, so the module of the library, we are expanding it a bit. The `forRoot` method now expects a `LibConfiguration` with the `config` property on it which is of the `Provider` Type.

```js
import {   LibConfiguration } from './lib-configuration';

static forRoot(libConfiguration: LibConfiguration = {}): ModuleWithProviders {
  return {
    ngModule: LibToConfigureModule,
    providers: [
      libConfiguration.config
    ]
  };
}
```

Which makes it possible for the consuming app to provide a class as a config. But now we have to implement the fallback to the default as well by modifying the providers array like:

```js
import {
  LibConfiguration,
  LibConfigurationProvider,
  DefaultLibConfiguration
} from './lib-configuration';

static forRoot(libConfiguration: LibConfiguration = {}): ModuleWithProviders {
  return {
    ngModule: LibToConfigureModule,
    providers: [
      libConfiguration.config || {
        provide: LibConfigurationProvider,
        useClass: DefaultLibConfiguration
      }
    ]
  };
}
```

As we provide the `LibConfigurationProvider` now we have to modify our components in the lib to expect this `LibConfigurationProvider` instead of the config.

```js
import { Component, OnInit } from '@angular/core';
import {
  LibConfigurationProvider,
  LibToConfigureConfiguration
} from './lib-configuration';

@Component({
  selector: 'lib-libToConfigure',
  template: `
    <p>
      lib-to-configure works!
    </p>
  `,
  styles: []
})
export class LibToConfigureComponent implements OnInit {
  constructor(public configurationProvider: LibConfigurationProvider) {}

  ngOnInit() {
    console.log(this.configurationProvider.config);
  }
}
```

The `LibConfigurationProvider` exposes a property `config` which hold the configuration.

If you build the library now and import the `LibToConfigureModule` in the consuming application with a `forRoot()` method with _no_ parameters you should see the default config printed in to console.

```cmd
{ name: "Fallback"}
```

Now let us tweak our consuming application to pass the correct configuration down to the lib. We need to create a class which implements the `LibConfigurationProvider` again to fulfill the abstract contract providing a `config` Property. This config property is of the type `LibToConfigureConfiguration`. All of the types and classes are being exported from the libs `public-api.ts`

```js
export class ConfigFromApp implements LibConfigurationProvider {
  get config(): LibToConfigureConfiguration {
    return { name: 'Fabian' };
  }
}
```

Now we are passing down this configuration in the `forRoot` as a parameter

```js
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  LibConfigurationProvider,
  LibToConfigureConfiguration,
  LibToConfigureModule
} from 'lib-to-configure';
import { AppComponent } from './app.component';

export class ConfigFromApp implements LibConfigurationProvider {
  get config(): LibToConfigureConfiguration {
    return { name: 'Fabian' };
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    LibToConfigureModule.forRoot({
      config: {
        provide: LibConfigurationProvider,
        useClass: ConfigFromApp
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

If you check the console in the browser now you can see that

```cmd
{ name: "Fabian"}
```

is printed. So nice, this works! But the config is still "static" in the way it gets provided dynamically, but the object itself is provided as a static object still. So let us add the `APP_INITIALIZER` to read the config at startup time.

## Adding the APP_INITIALIZER

The `APP_INITIALIZER` provides the possibility to run a method before the complete angular application starts which is the perfect place for asking for a configuration and then bootstrapping the application.

Lets prepare the introduction of the `APP_INITIALIZER` a bit:

First we will build a new class which is responsible for storing the configuration once we have read it from wherever we gonna read it, most likely over http.

```js
import { NgModule, APP_INITIALIZER, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  LibConfigurationProvider,
  LibToConfigureConfiguration,
  LibToConfigureModule
} from 'lib-to-configure';
import { AppComponent } from './app.component';

@Injectable({ providedIn: 'root' })
export class ConfigurationStore {
  private internalConfig: LibToConfigureConfiguration;

  setConfig(config: LibToConfigureConfiguration) {
    this.internalConfig = config;
  }

  getConfig() {
    return this.internalConfig;
  }
}

export class ConfigFromApp implements LibConfigurationProvider {
  // ...
}

@NgModule({
  // ...
})
export class AppModule {}

```

This class only holds the configuration privately and provides it through a method `getConfig()`.

We modify the `ConfigFromApp` class which is now gonna use the `ConfigurationStore`

```js
import { NgModule, APP_INITIALIZER, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  LibConfigurationProvider,
  LibToConfigureConfiguration,
  LibToConfigureModule
} from 'lib-to-configure';
import { AppComponent } from './app.component';

@Injectable({ providedIn: 'root' })
export class ConfigurationStore {
 // ...
}

@Injectable({ providedIn: 'root' })
export class ConfigFromApp implements LibConfigurationProvider {
  constructor(private configStore: ConfigurationStore) {}

  get config(): LibToConfigureConfiguration {
    return this.configStore.getConfig();
  }
}

@NgModule({
  // ...
})
export class AppModule {}

```

Next we add a init method which is getting called at the beginning of our app. The method has the store as dependency and sets the configuration when it gets it from a specific endpoint, in our case it is just a promise which gets resolved after two seconds:

```js
import { NgModule, APP_INITIALIZER, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  LibConfigurationProvider,
  LibToConfigureConfiguration,
  LibToConfigureModule
} from 'lib-to-configure';
import { AppComponent } from './app.component';

@Injectable({ providedIn: 'root' })
export class ConfigurationStore {
  // ...
}

@Injectable({ providedIn: 'root' })
export class ConfigFromApp implements LibConfigurationProvider {
  // ...
}

export function initApp(configurationStore: ConfigurationStore) {
  return () => {
    return new Promise(resolve => {
      setTimeout(() => {
        configurationStore.setConfig({ name: 'Fabian' });
        resolve();
      }, 2000);
    });
  };
}

@NgModule({
  // ...
})
export class AppModule {}
```

> Of course you can add the `Http` Dependency here as well if you want to, but we will cover that after we wrapped everything up so far with the promise solution.

If we now add the `APP_INITIALIZER` to the providers array we will use the `initApp` method and pass the `ConfigurationStore` as a dependency

```js
import { NgModule, APP_INITIALIZER, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  LibConfigurationProvider,
  LibToConfigureConfiguration,
  LibToConfigureModule
} from 'lib-to-configure';
import { AppComponent } from './app.component';

@Injectable({ providedIn: 'root' })
export class ConfigurationStore {
  // ...
}

@Injectable({ providedIn: 'root' })
export class ConfigFromApp implements LibConfigurationProvider {
  // ...
}

export function initApp(configurationStore: ConfigurationStore) {
  // ...
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    LibToConfigureModule.forRoot({
      config: {
        provide: LibConfigurationProvider,
        useClass: ConfigFromApp
      }
    })
  ],
  providers: [
    /* ADD THIS */
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      multi: true,
      deps: [ConfigurationStore]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

If you now check your app it should be starting after two seconds and the console should print

```cmd
{ name: "Fabian"}
```

through the component in the library.

## Adding Http

To get this scenario more real world we can add the `HttpClient` as a dependency as well

```js
import { HttpClient, HttpClientModule } from '@angular/common/http';
// ...

export function initAppWithHttp(
  configurationStore: ConfigurationStore,
  httpClient: HttpClient
) {
  return () => {
    return httpClient
      .get('https://my-super-url-to-get-the-config-from')
      .toPromise()
      .then(config => {
        configurationStore.setConfig(config);
      });
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule, // <-- Add this
    LibToConfigureModule.forRoot({
      config: {
        provide: LibConfigurationProvider,
        useClass: ConfigFromApp
      }
    })
    // LibToConfigureModule.forRoot()
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initAppWithHttp,
      multi: true,
      deps: [ConfigurationStore, HttpClient] // <-- Add this
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

And that is it. Hope it helps.

Thanks

Fabian
