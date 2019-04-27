---
title: Moving your Angular application from SystemJS to Webpack
date: 2017-02-26
author: Fabian Gosebrink
layout: post
tags: angular systemjs webpack
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

In this blogpost I want to show you how you can move from an existing Angular application using systemjs to an application with webpack.

Imagine the following application.

```
app
├── // modules, components and so on
├── app.component.ts
├── app.component.html
├── app.module.ts
└── main.ts
...
systemjs.config.js
tsconfig.json
tslint.json
...
```

Because we want to get away from systemjs here we will first introduce a webpack.config.js which holds your configuration and which can handle all you files and stuff.

But before we do please install webpack and the webpack-dev-server first:

`npm install webpack-dev-server webpack --save-dev`

So now we can add a webpack.config.js. This is the file webpack is searching per default.

```
app
├── // modules, components and so on
├── app.component.ts
├── app.component.html
├── app.module.ts
└── main.ts
...
systemjs.config.js
webpack.config.js // <---
tsconfig.json
tslint.json
...
```

Of course you have to modify the config that it fits to your application. A structure of this could be useful:

```javascript
module.exports = {

    entry: {
        // Here all your entry points from
        // your application are mentioned
    },

    output: {
        // Here we can specify the output
    },

    resolve: {
        extensions: // mention the extensions webpack should take care of
    },

    module: {
        rules: [
            // tell webpack HOW to react when a file is included in your application
        ]
    },

    plugins: [
		// finetune the behaviour of specific plugins
    ]
};
```

You can see an example here [webpack.dev.js](https://github.com/FabianGosebrink/ASPNETCore-Angular-Webpack-StarterTemplate/blob/master/src/ASPNETCoreAngularWebpackStarter/webpack.dev.js)

## Adding Polyfills

To have your Angular application ready for handling polyfills you have to introduce another file `polyfills.ts` where you import all polyfills your application needs.

```
app
├── // modules, components and so on
├── app.component.ts
├── app.component.html
├── app.module.ts
├── polyfills.ts // <---
└── main.ts
...
systemjs.config.js
webpack.config.js
tsconfig.json
tslint.json
...
```

The file could look like this:

```javascript
import 'ie-shim'; // Internet Explorer 9 support.

import 'core-js/es6/symbol';
import 'core-js/es6/object';
import 'core-js/es6/function';
import 'core-js/es6/parse-int';
import 'core-js/es6/parse-float';
import 'core-js/es6/number';
import 'core-js/es6/math';
import 'core-js/es6/string';
import 'core-js/es6/date';
import 'core-js/es6/array';
import 'core-js/es6/regexp';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/weak-map';
import 'core-js/es6/weak-set';
import 'core-js/es6/typed';
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';

import 'zone.js/dist/zone';
```

> Notice that when you import things you also have to install them via npm which also should be reflected in you package.json

## Adding Third-Party dependencies

If you have to include external libs like jquery or bootstrap you can manage them in a seperate file called `vendor.ts`. After installing them via npm you can consume them here:

```
app
├── // modules, components and so on
├── app.component.ts
├── app.component.html
├── app.module.ts
├── polyfills.ts
├── vendor.ts // <---
└── main.ts
...
systemjs.config.js
webpack.config.js
tsconfig.json
tslint.json
...
```

Which could look like this

```javascript
import 'jquery/dist/jquery';
import 'bootstrap/dist/js/bootstrap';

import 'bootstrap/dist/css/bootstrap.css';
import '../css/custom.css';

// import everything else here!!!
```

> You should include all your custom files here

## Delete systemjs.config.js

You can now delete the systemjs.config.js because you do not need it anymore.

```
app
├── // modules, components and so on
├── app.component.ts
├── app.component.html
├── app.module.ts
├── polyfills.ts
├── vendor.ts
└── main.ts
...
webpack.config.js
tsconfig.json
tslint.json
...
```

## Entrypoints

Note that you now have three entrypoint for your application: `main.ts`, `vendor.ts` and `polyfills.ts`. Due to the fact that webpack is reading all you files and going through all imports importing what is included you have the possibility to:

give your webpack config all three entrypoint like this:

```javascript
module.exports = {
    entry: {
        'app': './app/main.ts',
        'vendor': './app/vendor.ts',
        'polyfills': './app/polyfills.ts',
    },
```

or you import the two files in you main.ts like:

```javascript
import './polyfills';
import './vendor';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
```

and in your webpack.config.ts you only need one entrypoint then:

```javascript
module.exports = {
    entry: {
        'app': './app/main.ts'
    },
```

## Asking for the environment (dev/prod)

We will set the environment from the outside later. To consume it in your application we can simply ask for a variable like this:

```javascript
module.exports = function(env) {
  console.log(env);
  return require(`./webpack.${env}.js`);
};
```

With this you can apply multiple ways of generating your output based on the given environment asking for the variable "NODE_ENV" which we will set up later in our scripts.

You can see an example here [webpack.config.js](https://github.com/FabianGosebrink/ASPNETCore-Angular-Webpack-StarterTemplate/blob/master/src/ASPNETCoreAngularWebpackStarter/webpack.config.js)

## Triggering it from the npm scripts

Now that we introduced webpack we can add the commands to our package.json like this:

```javascript
{
    //...
    "scripts": {
        "start": "tsc && webpack-dev-server --open",
        // other scripts
        "build:dev": "webpack --env=dev --progress --profile --colors",
        "build:dist": "webpack --env=prod --progress --profile --colors",
    },
    //...
}
```

Here we are setting the environment variable accordingly and start webpack with the `webpack` command

When you run `npm start` and have the correct configuration in your webpack & package.json a browser should open up displaying your page while reloading if you change something.

Feel free to comment if I missed something.

Hope this helps and happy coding.
