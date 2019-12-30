---
title: How to configure Angular libraries
date: 2019-12-21
tags: ['angular', 'libraries', 'configuration']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this article I want to explain two possible ways to configure Angular libraries.

With libraries we have a convenient way to seperate logic which is used multiple times across more than one application or libraries can define our architecture especially when working with a monorepo.

Libraries build a standalone codebase where complete modules with all its services, components etc. can be stored away and can be included into your Angular app.

This works pretty fine but if you want to make the libraries more flexible you can pass a configuration into that library to make the library work as you need it based on values the consuming application provides.

In the following blogpost I want to share two ways of configuring Angular Libraries and how that work in code.

## Preparation

First of all we can create a new Angular project with

```
ng new configuring-libraries --createApplication=false
```

The `--createApplication=false` creates only the workspace files but does not add an application on root level. This gives usmore flexibility and overwiew when working with libs and apps inside this workspace.

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

If we want to use the library we have to import this module into our apps module by adding it to the `imports` array of the `app.module.ts`.

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

In the `public-api` export the file to make it visibile to the outside world:

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
