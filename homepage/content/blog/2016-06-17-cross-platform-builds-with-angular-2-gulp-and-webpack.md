---
title: Cross Platform Builds with Angular, Gulp and Webpack
date: 2016-06-17
tags: ['angular', 'gulp', 'webpack']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  [
    '/blog/articles/2016/06/17/cross-platform-builds-with-angular-gulp-and-webpack/',
    '/blog/articles/2016/06/17/cross-platform-builds-with-angular-2-gulp-and-webpack/',
  ]
---

In this blog post I want to show how to create Cross Platform Builds with Angular, Gulp and Webpack

<a href="https://webpack.github.io/" title="Webpack">Webpack</a>

<a href="http://gulpjs.com/" title="Gulp">Gulp</a>

<a href="http://angular.io/" title="Angular2">Angular</a>

Code can be found here: [https://github.com/FabianGosebrink/Foodchooser-ASPNET-Angular-Cross-Platform](https://github.com/FabianGosebrink/Foodchooser-ASPNET-Angular-Cross-Platform)

### Setting up the folder structure

The folder structure is very important but also one of the most discussed in the internet I think ;). Mine looks like the following:

![Angular2 webpack](https://offeringsolutionscdn.blob.core.windows.net/$web/img/articles/wp-content/uploads/2016/06/folderStructure.png)

Whereas "app" contains my Angular 2 application and the other files and folders speak for theirselves.

## The goal

The sense of this blog post is now to get a build with webpack AND gulp combined to have the same cross platform functionality we are used from a "gulp-only" build.

### The past

In the past the problem with Angular 2 and gulp was the bundling and the minification of the application. Gulp works with streams and files whereas angular 2 is build with related components which are imported and then used. We can not concat every file anymore in the correct order and minify it to distribute an application.

### The solution

The solution (or at least one of them) is webpack. Webpack is slightly different from gulp, where it can resolve the dependencies and use your "import" and "require" statements to see when which file is used and has to be included.

## The files

Now I want to show you the files which can make this whole thing possible. See the "gulptasks"-folder to divide the responsibilities of building each target platform.

![angular2 webpack](https://offeringsolutionscdn.blob.core.windows.net/$web/img/articles/wp-content/uploads/2016/06/gulpFiles.png)

### webpack.config.js

```javascript
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    polyfills: './app/polyfills.ts',
    vendor: './app/vendor.ts',
    app: './app/main.ts',
  },
  resolve: {
    extensions: ['', '.ts', '.js', '.css', '.html'],
  },
  output: {
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts',
      },
      {
        test: /\.html$/,
        loader: 'html',
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'file?name=fonts/[name].[hash].[ext]',
      },
      {
        test: /\.css$/,
        exclude: './app',
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap'),
      },
      {
        test: /\.css$/,
        include: './app',
        loader: 'raw',
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name].bundle.css'),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills'],
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  devServer: {
    historyApiFallback: true,
    stats: 'minimal',
  },
};
```

This file is plain easy:

First we tell webpack that we have three entry-points (three files to start) in our application which are "app", "vendor" and "polyfills"

```javascript
entry: {
'polyfills': './app/polyfills.ts',
'vendor': './app/vendor.ts',
'app': './app/main.ts'
},
```

Then we tell webpack which files to look for...

```javascript
resolve: {
extensions: ['', '.ts', '.js', '.css', '.html']
},
```

...how the js-files should be named on output...

```javascript
output: {
filename: '[name].bundle.js'
},
```

... and in the modules part we define how to treat the several file types.

The plugins section then sticks together every operation we do with the files. So this is normal webpack as you can see in several repositories as well.

But how to deal with gulp? Well...there is an npm package...;) It's called `webpack-stream` and allows us to do tasks like this:

```javascript
gulp.task('web-compile-with-webpack', function () {
  return gulp
    .src('./app/main.js')
    .pipe(webpack(require('../webpack.config.js')))
    .pipe(gulp.dest('../.temp/webapp/'));
});
```

So if we trigger this gulp-tasks our application is build an bundles and so on and will be copied to the specified folder with gulp.

After we did this we can go ahead like normal.

Because we also have a dev-server from webpack in the repository above we will have a index.html fully loaded to execute everything. The gulp-html-comments make sure that everything in between those comments gets overwritten when we inject sources with gulp.

```html
<html>
  <head>
    <title>FoodChooser Angular 2</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- inject:css -->
    <link rel="stylesheet" href="vendor.bundle.css" />
    <link rel="stylesheet" href="app.bundle.css" />
    <!-- endinject -->
  </head>

  <!-- 3. Display the application -->

  <body>
    <foodChooser-app>Loading...</foodChooser-app>
  </body>

  <script src="cordova.js"></script>

  <!-- inject:js -->
  <script src="polyfills.bundle.js"></script>

  <script src="vendor.bundle.js"></script>

  <script src="app.bundle.js"></script>
  <!-- endinject -->

  <script>
        <!-- Toggle Hamburger Menu on mobile -->
        $(document).on('click','.navbar-collapse.in',function(e) {
        if( $(e.target).is('a') &amp;&amp; $(e.target).attr('class') != 'dropdown-toggle' ) {
            $(this).collapse('hide');
        }
    });
  </script>
</html>
```

The complete tasks for the web solution are:

```javascript
gulp.task('build:web:prod', function (done) {
  runSeq(
    'web-clean-temp-folder', // cleans the temp folder
    'web-compile-with-webpack', // compiles the sources with webpack
    'web-copy-index-to-webapp-temp-folder', // copies the index.html to the temp folder
    'web-inject-in-html', // injects the webpack-output into the index.html with gulp
    'web-clean-dist-folder', // clean the dist folder first...
    'web-copy-to-dist', // copy it
    done
  );
});
```

After we run this the index.html looks quite the same:

```javascript
<html>

<head>
    <title>FoodChooser Angular 2</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- inject:css -->
    <link rel="stylesheet" href="vendor.bundle.css">
    <link rel="stylesheet" href="app.bundle.css">
    <!-- endinject -->

</head>

<!-- 3. Display the application -->

<body>
    <foodChooser-app>Loading...</foodChooser-app>


<script src="cordova.js"></script>

<!-- inject:js -->
<script src="polyfills.bundle.js"></script>
<script src="vendor.bundle.js"></script>
<script src="app.bundle.js"></script>
<!-- endinject -->

<script>
    <!-- Toggle Hamburger Menu on mobile -->
    $(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') &amp;&amp; $(e.target).attr('class') != 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});

</script>
</body>
</html>
```

But this time the sources got injected. See the dist folder here:

![dist](https://offeringsolutionscdn.blob.core.windows.net/$web/img/articles/wp-content/uploads/2016/06/dist.png)

With this approach we can go ahead as usual when building electron or cordova-things with gulp.

See the required steps fo r e.g. a cordova-build here:

```javascript
gulp.task('build:electron:prod', function (done) {
  runSeq(
    'electron-clean-temp',
    'electron-compile-with-webpack',
    'electron-copy-index-to-temp-folder',
    'electron-inject-in-html',
    'electron-copy-assets-to-temp-folder',
    'electron-build-win',
    done
  );
});
```

the only difference here is that we have to copy assets for electron into the temp folder. The whole procedure before is like we know it from the web solution.

I hope this helps to get out confusion and reduces the complexity of the topic "Cross platform".

HTH

Regards

Fabian

# Links

[https://angular.io/docs/ts/latest/guide/webpack.html](https://angular.io/docs/ts/latest/guide/webpack.html)

[https://webpack.github.io/docs/usage-with-gulp.html](https://webpack.github.io/docs/usage-with-gulp.html)

[https://www.npmjs.com/package/webpack-stream](https://www.npmjs.com/package/webpack-stream)

[https://github.com/shama/webpack-stream](https://github.com/shama/webpack-stream)

[https://www.xplatform.rocks/2016/02/14/angular2-and-electron-the-definitive-guide/](https://www.xplatform.rocks/2016/02/14/angular2-and-electron-the-definitive-guide/)
