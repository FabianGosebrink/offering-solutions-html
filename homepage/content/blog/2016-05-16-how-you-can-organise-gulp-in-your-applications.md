---
title: How you can organise gulp in your applications
date: 2016-05-16
author: Fabian Gosebrink
layout: post
tags: gulp javascript
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

In this blogpost I want to show one possibility of organising your gulp tasks in a way that you as a developer can find them quickly and print them to the console in an ordered way.

> I have taken all these examples from my cross platform examples on [GitHub](https://github.com/FabianGosebrink?tab=repositories). Especially from [Foodchooser](https://github.com/FabianGosebrink/Foodchooser-ASPNET-Angular-Cross-Platform).

## Motivation

No matter what you do with web development today you will have to have a task runner when it comes to distribute to a customer at the latest.

Gulp is one task runner which it makes easy to fulfill all then tasks like concatination and uglify-things we actually need to reduce request and optimize our performance etc.

But we as developers have also different tasks to face: We want a web application in dev-mode for our development environment. But we also want to have a distribution-ready environment for our staging and test environments etc.

When you are heading towards cross platfrom development this thing is even more important. Because your outputs differ from a webpage only with an additional executable (electron) and mobile apps for your phones.

## Organising your files

### Gulp and its config

I think the best practice here is to seperate gulp itself on the one hand and the paths to the files and folders on the other in different files.

The `gulpfile.js` only contains the tasks whereas a file named like `gulp.config.js` is containing all your files, (temp-)paths, ... .

![How you can organise gulp in your applications]({{site.baseurl}}assets/articles/wp-content/uploads/2016/05/gulpAndConfigFile.png 'gulptask folder')

You can include your config file in the gulpfile like this:

`var buildConfig = require('./gulp.config');`

If the files are on the same level.

The `gulp.config.js` can look like this:

```javascript
module.exports = {
    general: {
        appName: "FoodChooserAppAngular2",
        rootFolder: "app/",
        indexHtml: "./index.html"
    },
    sources: {
        sourceFolder: "src/",
        allAppJsFiles: [
            "./app/*.js",
            "./app/*/**/*.js",
        ],
        allAppHtmlFiles: [
            "./app/**/*.html"
        ],
        allVendorJsFiles: [
            "./js/*.js"
        ],
        allAppCssFiles: [
            "./node_modules/bootstrap/dist/css/bootstrap.min.css",
            "./css/*.css"
        ],
        allAppImgFiles: [
            "./img/*.*",
            "./img/windows/*.*"
        ],
        vendorScripts: [
            "node_modules/zone.js/dist/zone.js",
            "node_modules/reflect-metadata/Reflect.js",
            "node_modules/systemjs/dist/system.src.js",
            "node_modules/jquery/dist/jquery.js",
            "node_modules/bootstrap/dist/js/bootstrap.js"
        ],
        // ...
    },
    // ...
    targets: {
        webAppOutputPath: "../.dist/webapp/",
        electronOutputPath: "../.dist/electron/",
        cordovaOutputPath: "../.dist/cordova/",
};
```

It is only containing all the files, paths and general information you want to use.

The gulp-file itself is now only containing the tasks and is consuming the config file.

```javascript
gulp.task('web-copy-index-to-webapp-folder', function(done) {
  return gulp
    .src(buildConfig.general.indexHtml)
    .pipe(gulp.dest(buildConfig.targets.webAppOutputPath));
});
```

This makes the gulp tasks more generic.

### Tasks in folders

I've seen many ways how people organise the gulp tasks but it turned out for me it was the best way to have a folder called "gulpTasks" (or similar) where I put all my gulptasks in. I've seen this on many other repositories and also on conferences etc. It's always good to have a folder encapsulating all your gulpTasks like this:

![alt text]({{site.baseurl}}assets/articles/wp-content/uploads/2016/05/folderGulpTasks.png 'gulptask folder')

Here I seperate all the different systems I want to have an output for.

But that also means, that the task seen above is moving to the `web.js` file.

How do I build up the "architecture" for my gulp-tasks now?

## Manage your tasks

Well we have to go one step back before clarifying how to solve this:

Getting an app ready for distribution or even for development purposes is more than one task. Although I know the task-dependency-system in gulp where all the dependent tasks are executed in parallel before the called task is going to run I think it's easier to run the things in sequence. It's easier to read and easier to maintain IMHO.

Therefore you need to install a `run-sequence`-plugin available [here](https://www.npmjs.com/package/run-sequence). With this you can divide your tasks and seperate the responsibilities in your web gulpfile (e.g.) like this:

```javascript
var gulp = require('gulp');
var runSeq = require('run-sequence');

gulp.task('build:web:prod', function(done) {
  runSeq(
    'web-clean-webapp',
    'web-copy-index-to-webapp-folder',
    'web-copy-images-to-webapp-folder',
    'web-copy-css-to-webapp-folder',
    'web-concat-uglify-and-copy-vendor-scripts',
    // all the other tasks
    done
  );
});
```

I think this is a very good and clear documentation of what is done if I call the main task.

> As a tip: I do also use this for "debugging" when something is going wrong. I can easily comment out the single tasks and the which one is causing trouble

What we also did in this step is: We defined a _main task_! This task can be referenced and executed from the main gulp file.

```javascript
require('./gulpTasks/web');
//...
gulp.task('build:all', function(done) {
  runSeq(
    'build:web:prod',
    // maybe other main build tasks
    done
  );
});
```

You can repeat that for all your files and main tasks.

> I recommend to have 2 main tasks per file at the maximum: Dev and Prod.

So here we are building a small architecture and get some order in our tasks-, file- and folder-structure.

### The default tasks

Often I see that the default task is executing logic. It does something. And when the default task is doing something it's most likely something like a main task. Like "build-all" or something?

Let's picture the situation you cloned a repository and you just want to get started. Thats all you want to do. First step: "Let me see what you have got for me".

If you run `gulp` which executes the default task and something starts to run and I as a developer have NO IDEA what exactly runs there - that scares me.

Wouldn't it be better to have a kind of more defensive behaviour? This is why I prefer to list all the tasks the repo offers to the delevoper. And the developer can then decide which one he wants to execute.

But with this option I mentioned above we have **many** small tasks which can be executed.

This is why I do name the tasks in a special way:

All main tasks are divided with a ":", all child tasks with "-".

For the task-listing feature there is also an npm package available [here](https://www.npmjs.com/package/gulp-task-listing).

"gulp-task-listing - Adds the ability to provide a task listing for your gulpfile"

You can define filters to define which one is a main task and which one is a child task.

```javascript
var taskListing = require('gulp-task-listing');
//...
gulp.task('help', taskListing.withFilters(/-/));
```

Everything we need to do now is to point the default task on this help task to list all the tasks:

```javascript
var taskListing = require('gulp-task-listing');
//...
gulp.task('default', ['help']);
gulp.task('help', taskListing.withFilters(/-/));
```

Which brings the following output:

![tasks output]({{site.baseurl}}assets/articles/wp-content/uploads/2016/05/gulpTasks.png 'gulp task output')

## Further steps

### common.js

One possibility would be going along and define some "main"-tasks and be more generic which can be executed from the `web.js` and other files. Like a `common.js` containing generic tasks like:

```javascript
function copySourcesTo(targetFolder) {
  return gulp
    .src(getSourceFiles(buildConfig.source.folder), {
      base: buildConfig.source.folder
    })
    .pipe(gulp.dest(targetFolder));
}

function copyFromTo(sourceFolder, targetFolder) {
  return gulp
    .src(path.join(sourceFolder, '**', '*.*'))
    .pipe(gulp.dest(targetFolder));
}

function cleanTemp(done) {
  del(buildConfig.targets.tempFolder).then(function() {
    done();
  });
}
//...
```

For tasks which are all the same in every step. Perhaps this can be useful

> I did this in this repository [here](https://github.com/FabianGosebrink/Foodchooser-ASPNET-Angular-Cross-Platform)

### Prefixes

You could also prefix your private tasks with a "[private]-..." tag or something to clearify in the task overview that this task should be private.

## Conclusion

I hope with this post I could give you a small idea of how to treat your gulp files and tasks in order. Keep them seperated and let them have single tasks to do. I think with this you can keep also a big system organised.

## Links

[https://github.com/FabianGosebrink/ASPNET-Foodchooser-Cross-Platform-Angular2](https://github.com/FabianGosebrink/ASPNET-Foodchooser-Cross-Platform-Angular2/)

[https://github.com/FabianGosebrink/ASPNET-WebAPI-AngularJs-XPlatform-Example](https://github.com/FabianGosebrink/ASPNET-WebAPI-AngularJs-XPlatform-Example)

[https://www.npmjs.com/package/run-sequence](https://www.npmjs.com/package/run-sequence)

[https://www.npmjs.com/package/gulp-task-listing](https://www.npmjs.com/package/gulp-task-listing)
