---
title: Angular Ahead Of Time (AoT) compilation, lazy loading and treeshaking with webpack
date: 2017-02-08 16:42
author: Fabian Gosebrink
layout: post
tags: angular webpack lazyloading treeshaking aot
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

In this blogpost I want to show you how to get Ahead Of Time compilation enabled with lazy loading in combination with webpack 2.

### Code

[Github - ASPNET-ASPNETCore-AngularJS-Angular](https://github.com/FabianGosebrink/ASPNET-ASPNETCore-Angular-Webpack/tree/master)

### The Router

If you want to enable lazy loading in your application with aot you first have to configure your router to load the module lazy - when it gets requested. You can do that with the loadChildren-attribute.

```javascript
export const AppRoutes: Routes = [
    // normal routes
    { path: 'food', loadChildren: './path/to/module.file#ModuleName' },
    {
        path: '**',
        redirectTo: 'home',
    },
];
```

The syntax is `{ path: 'myPath', loadChildren: './path/to/module.file#ModuleName' },`

### The Module

If you did this you have to remove the module import from the module import array where you explicitly imported it in the first place!

```javascript
// imports

@NgModule({
    imports: [
        BrowserModule,
        // other imports but NOT your lazy loaded module anymore
        HomeModule,
    ],

    declarations: [AppComponent],

    providers: [
        // ...
    ],

    bootstrap: [AppComponent],
})
export class AppModule {}
```

### The ngc compiler

If done so you can install the needed packages to get started with the ngc compiler:

`npm install @angular/compiler-cli @angular/platform-server --save`

After this you have to configure a seperate tsconfig-aot.json for Ahead Of Time Compilation:

```json
{
    "compilerOptions": {
        "target": "es5",
        "module": "es2015",
        "moduleResolution": "node",
        "sourceMap": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "lib": ["es2015", "dom"],
        "noImplicitAny": true,
        "suppressImplicitAnyIndexErrors": true
    },
    "files": ["app/app.module.ts", "path/to/module.file", "app/main.ts"],
    "angularCompilerOptions": {
        "genDir": "aot",
        "skipMetadataEmit": true
    }
}
```

> Please pay special attention to the "files" array. Because the module is not imported in your application via the `import` statement anymore the compiler will not include it in the aot-folder (which is fixed in the "genDir"-attribute). So here you have to add it by yourself but only the path to the module.

If you now run

`node_modules/.bin/ngc -p tsconfig-aot.json`

an "aot" folder is created which should contain all your compilated files.

```
app
├── app.component.ts
├── app.component.html
├── ...
├── app.module.ts
└── main.ts
aot
└── app
    ├── module1
    ├── module2
    ├── module...
    └── ....ngfactory.ts
index.html
systemjs.config.js
tsconfig.json
tslint.json
styles.css
package.json
```

### The (new) entrypoint

Also as an entry point we specify the file(s) we have but the main file is different. Because we created an output in the aot folder we need to point our entrypoint to that compilated files!

We can do that by adding a new main.ts file called "main-aot.ts" and add the following into it:

```javascript
import { platformBrowser } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { AppModuleNgFactory } from '../aot/app/app.module.ngfactory';

enableProdMode();

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
```

Here we are consuming the generated files in the aot folder.

> If this file causes problems because of not finding any files it may be that the aot folder does not exist yet. This is normal. What does not exist cant be imported. Just create the folder and the errors should go away.

### Webpack: Comsuming the AoT output

After that output is created you can go along and consume this files via webpack.

Here it is very important to use the `angular-router-loader` which enables loading modules through the string we mentioned in the routes.

So if a route ts file comes along we want to send it through the `angular2-template-loader`, `angular-router-loader` and the `awesome-typescript-loader` to proceed with our files.

The rule for this looks like the following:

```json
{
    test: /\.ts$/,
    use: [
        'awesome-typescript-loader',
        'angular-router-loader?aot=true&genDir=aot/',
        'angular2-template-loader',
    ]
},
```

> Pay attention to the parameters we give to the `angular-router-loader`. the `genDir` has to match our directory containing our aot compiled output.

and as an entrypoint we are pointing to the new file we created:

```json
entry: {
    'app': './app/main-aot.ts'
},
```

With this webpack uses our aot-file as an entrypoint and follows all imports in this file.

We also have to tell webpack how to name the files which are recognized as lazy loaded. We can do this by adding a "chunkFilename" in the output-settings:

```json
output: {
    path: './.dist/web/aot/',
    filename: 'js/[name]-[hash:8].bundle.js',
    chunkFilename: 'js/[id].-[hash:8].chunk.js',
},
```

### Webpack: Adding tree shaking

To add tree shaking we have to use the `UglifyJsPlugin` from webpack which we can configure like this:

```json
var CompressionPlugin = require("compression-webpack-plugin");
// ...
plugins: [
    // ...
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        output: {
            comments: false
        },
        sourceMap: false
    }),
    new CompressionPlugin({
        asset: "[path].gz[query]",
        algorithm: "gzip",
        test: /\.js$|\.html$/,
        threshold: 10240,
        minRatio: 0.8
    }),
    // ...
]
```

> Here we also added the CompressionPlugin to get the compressed output too.

### Wrapping it up & beautify it

Ahead of Time compilation and treeshaking are two different things often used together. AoT is done via a different compiler. Treeshaking _can_ be done via webpack but also rollup.js is a way to go.

So we need to have two steps:

1. compile our files via the ngc compiler
2. use the output of that and consume it via webpack

#### beautify it

You can now "hide" those two commands in the `package.json` "scripts" section like this:

`"webpack-prod": "npm run ngc && webpack",`

which you can run via

`npm run webpack-prod`

> Be sure to have the ngc command globally installed then...

I hope i could clarify a bit how aot and treeshaking work with webpack 2 and angular.

Best regards

Fabian

#### Links

[Ahead of time compilation - Angular.io](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html)

[ASPNET-ASPNETCore-AngularJS-Angular](https://github.com/FabianGosebrink/ASPNET-ASPNETCore-Angular-Webpack/tree/master)
