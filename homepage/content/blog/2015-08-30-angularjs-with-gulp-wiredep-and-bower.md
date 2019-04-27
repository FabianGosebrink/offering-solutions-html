---
title: AngularJS with gulp, wiredep and bower
date: 2015-08-30
tags: ['angularjs', 'bower', 'gulp', 'wiredep']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: [
  "/blog/articles/2015/08/30/angularjs-with-gulp-wiredep-and-bower/",
]
---

With this blogpost I want to show you how to use AngularJS with gulp, wiredep and bower to provide the files to an angular application.

I just introduced Gulp in my AngularJSDemoApp on GitHub.

Check it out [here](https://github.com/FabianGosebrink/ASPNET-WebAPI-AngularJs).

### AngularJS with gulp wiredep and bower

#### gulp.js

```javascript
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var del = require('del');
var inject = require('gulp-inject');

var config = require('./gulp.config')();

gulp.task('vet', function() {
  return gulp
    .src(config.srcJSFiles)
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish', { verbose: true }));
});

gulp.task('injectJsIntoIndex', ['vet'], function() {
  var wiredep = require('wiredep').stream;
  var options = config.getWiredepDefaultOptions();

  var target = gulp.src(config.targetIndexHtmlFile);
  var sources = gulp.src(config.srcJSFiles);

  return target
    .pipe(
      inject(sources, {
        addRootSlash: false
      })
    )
    .pipe(wiredep(options))
    .pipe(gulp.dest(config.root));
});
```

The gulp task is checking via wiredep all dependencies and is injecting them into the index.html automatically. After this it is passing out the file into the destination.

#### gulp.config.js

The gulp-config is seperated:

```javascript
module.exports = function() {
  var config = {
    srcJSFiles: [
      './app/*.js',
      './app/*/*.js',
      './app/*/*/*.js',
      '!./node_modules/**/*.js'
    ],
    targetIndexHtmlFile: 'index.html',
    root: './',

    bower: {
      json: require('./bower.json'),
      directory: './libs',
      ignorePath: '../..'
    }
  };

  config.getWiredepDefaultOptions = function() {
    var options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath
    };

    return options;
  };

  return config;
};
```

Just run the corresponding gulp commands to start the default gulp task. Or, if you do not like gulp, just comment in all the files explicitly. That will do it, too :)

```html
<script src="libs/angular/angular.js"></script>
<script src="libs/angular-animate/angular-animate.js"></script>
<script src="libs/angular-bootstrap/ui-bootstrap-tpls.js"></script>
<script src="libs/angular-loading-bar/build/loading-bar.js"></script>
<script src="libs/angular-resource/angular-resource.js"></script>
<script src="libs/angular-route/angular-route.js"></script>
<script src="libs/angular-toastr/dist/angular-toastr.tpls.js"></script>
<script src="libs/jquery/dist/jquery.js"></script>
<script src="libs/bootstrap/dist/js/bootstrap.js"></script>
<script src="libs/lodash/lodash.js"></script>
<!-- endbower -->

<!-- inject:js -->
<script src="app/application.js"></script>
<script src="app/Contact/contactModule.js"></script>
<script src="app/Home/homeModule.js"></script>
<script src="app/Contact/Controllers/contactController.js"></script>
<script src="app/Home/Controllers/homeController.js"></script>
<script src="app/Home/Services/peopleServices.js"></script>
<!-- endinject -->
```

Regards and have fun. Happy coding

If you have VS 2013 you can install the [Task Runner Explorer](https://visualstudiogallery.msdn.microsoft.com/8e1b4368-4afb-467a-bc13-9650572db708), which is included in VS 2015 or you just run the commands from the command line being on the level of the gulp.js-file.

Fabian
