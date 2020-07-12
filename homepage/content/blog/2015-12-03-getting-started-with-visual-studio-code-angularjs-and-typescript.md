---
title: Getting started with Visual Studio Code, AngularJS and Typescript
date: 2015-12-03
tags: ['aspnetmvc', 'typescript', 'vscode']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  [
    '/blog/articles/2015/12/03/getting-started-with-visual-studio-code-angularjs-and-typescript/',
  ]
---

This time I want to show you how getting started with Visual Studio Code, AngularJS and Typescript.

Before we start: A new Typescript version was announced!! You can see whats new [here](https://github.com/Microsoft/TypeScript/wiki/roadmap) and further information [here](http://www.typescriptlang.org/).

I always wanted to get to know Typescript and see the advantages of it compared to the "normal" javascript and so I just took my plain old sample application and tried to build it up with Typescript. I have to say: Typescript in combination with Visual Studio Code is absolutely awesome! I loved it.

## Getting Started:

Fist of all you need to install npm/nodejs from the installers [here ](https://nodejs.org/en/)if you are running a windows machine.

if you have npm installed you can install typescript with the command

`npm install -g typescript`

which will install typescript globally. With this installed you can run the typescript compiler "tsc" and compile typescript.

With

`npm install tsd -g`

You can install the [TypeScript Definition manager for DefinitelyTyped](http://definitelytyped.org/tsd/) to get the strong typed advantages from Typescript going.

In Visual Studio Code the first file you need when working with Typescript is the "tsconfig.json" which sets the basic behaviour of your typescript compiler.

```javascript
{
    "compilerOptions": {
        "target": "ES5"
    },
    "exclude": [
        "node_modules",
        "wwwroot"
    ]
}
```

The "compilerOptions" tell typescript in which language the typescript code should be compiled. The exclude-block, you guessed it, excluded several folders from being checked by the compiler.

Now you can write and compile Typescript files. :-)

In Visual Studio Code if you now press the CRTL-SHIFT-B-Buttons you should trigger Visual Studio Code to compile your written files. If you create a taskrunner Visual Studio Code generates a .vscode-folder with a "tasks.json" in it.

![Getting started with Visual Studio Code, AngularJS and Typescript](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/12/tyepscript01.jpg)

See that the "args" is not containing any files explicitly. That triggers the taskrunner to compile the whole code. Not only several files.

If you now type Typescript-code in a \*.ts file, save it and compile you will see a progress running in vs code for a short time. After this your file should be compiled into Typescript and appear in Visual Studio Code since Visual Studio Code is file based.

![Getting started with Visual Studio Code, AngularJS and Typescript](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/12/tyepscript02.jpg)
![Getting started with Visual Studio Code, AngularJS and Typescript](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/12/tyepscript03.jpg)

> If you do NOT see any compiled js/ts-files checking your typescript version is always a good hint.

### Adding AngularJs-Files

If you want to get also started with AngularJs (and have installed the tsd like mentioned above) you can go to the root of your application, open the console and simply type

`tsd install angular --resolve --save`

which causes the Typescript Definition Manager (tsd) to install the \*.d.ts files for AngularJs. The resolve parameter resolves all dependencies angular has (like jQuery in this case).

![Getting started with Visual Studio Code, Angular and Typescript](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/12/tyepscript04.jpg)

As you can see the typings-folder was generated with a "tsd.d.ts" file which holds the references and a tsd.json on the root of the application which holds all installed plugins for our project. This gets updated every time you install a new typescript.d-reference.

Thats it. You can now go ahead and implement Typescript with Visual Studio Code.

Check out the github repository of this code [here](https://github.com/FabianGosebrink/ASPNET-WebAPI-AngularJs-Typescript).

Hope this helps.

Regards

Fabian
