---
title: Create a build pipeline for Angular and ASP.NET Core apps with Visual Studio Team Services
date: 2018-03-08
tags: ['angular', 'aspnetcore', 'vsts']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  [
    '/blog/articles/2018/03/08/create-build-pipeline-for-angular-and-aspnetcore-app-with-visual-studio-team-services/',
  ]
---

In this blog post I want to describe how you can build up a build and release pipeline for your Angular and ASP.NET Core applications using Visual Studio Team Services.

## Preparation

First of all you need an user account with which you can login to `<yourname>.visualstudio.com`. Then we will need a github repository where your project is checked in. As an example I will take the repository located on [https://github.com/FabianGosebrink/ASPNETCore-Angular-Ngrx](https://github.com/FabianGosebrink/ASPNETCore-Angular-Ngrx). The repository has the client and the server code completely seperated which makes it easy for us to switch technologies or to keep things seperated like we will do it with our build and release pipelines in Visual Studio Team Services (VSTS).

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1000_43_53.jpg)

## The server build for ASP.NET Core

For the server build we first log into visual studio team services and add a new project.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1000_58_32.jpg)

We will call this project `createBuildPipelinePost` and leave all the other fields as they are as this is not about getting your team up to work with VSTS (which you can do) but "only" building a pipeline for your builds and releases. So hitting "Create" and let VSTS create the project should be enough for now.

Next we will add a new build definition by hitting the `New Definition` Button and select `Github` then because our project is checked in at Github. You can however, also build projects which are located somewhere else, like BitBucket and so on or even VSTS directly. In this case we will stick to our Github repository and we need to authorize VSTS to access Github for us.

In this case I authorized my VSTS to access Github and I could choose the projects then. I choose the one we mentioned earlier as this is the project we want to run the build on. So we are selecting the master branch here which means that this build pipeline will only listen to that branch. Other branches are not affected.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1001_14_55.jpg)

The next step you see are prepared build pipelines VSTS holds up for you. You can jump in right away but we will start with an empty process here.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1001_00_04.jpg)

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1001_29_24‎.jpg)

VSTS prepared everyting here for you which can stay like this. The only thing we have to do is adding new tasks to the build pipeline. The first task we will add is a Nuget task to the first phase. This will install Nuget so that we can do a restore in the second step.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1001_29_40.jpg)

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1001_34_03.jpg)

I choose version 4.5.1 here. But you can switch between different versions which are around.

> I was told that sometimes there are some problems with a Nuget restore command. This is why I choose to restore the nuget packages that way. However, if you got a normal Nuget restore task running you can of course use that one instead.

The Nuget restore command now searches for the solution file - which we have in the `server` folder - and restores the packages. Therefore we set the command to `restore` and we can name the task accordingly.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1001_34_27.jpg)

After we created that we can build the whole solution with a `dotnet build` command. We are adding the task listening on the `*.csproj`. Important are the arguments we are passing which should set the release `--configuration release` and `--no-restore` because we already did a restore in the previous task.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1001_51_43.jpg)

Although we have no tests in this repository at the moment we can add a task for that. My experience is that you are lucky if you have a build pipeline up and running _before_ the project coding starts. It's always nice to have that thing done and let the server do the heavy lifting of running all tests and stuff. At some point in your project you're glad that you built that pipeline up.

So we are using the wildcards to check for specific paths in our application which could be test projects (all Projects within a "Test" folder or a folder with _test_ in its name) and we let them run with `dotnet test` where the command is the `test` only.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1001_36_00.jpg)

One of the last steps is to execute a `dotnet publish` to get the final results of our build. We can add a new task like we did before running the `dotnet publish` command. Be aware that we also set the `--configuration release` again and also as an output we pass the `$(build.artifactstagingdirectory)` with `--output $(build.artifactstagingdirectory)`. This one gets automatically filled by VSTS. I also like to zip the output which you do not have to do, I like having one file as an output as this file gets unzipped automatically when it gets released to an azure web app.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1001_53_17.jpg)

The last step at the server side is to publish the build artifact so that our release pipeline can actually "see" what was the result out of this build process. We are calling this artifact `drop` and as a path we are giving it the `$(build.artifactstagingdirectory)` because that has been the output in the previous step.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1001_57_38.jpg)

## The client build for an Angular CLI

Remember the folder structure in the repository we had was like

```
Github
└── server
    └── // all server files
└── client
    └── // all client files
├── .github
└── // ... other top level files
...
```

and until here we came away with not caring about that because we only have _one_ ASP.NET Core project on it, so we could walk on with the wildcards `**/*.csproj` for example. For the client side however it is better to use the specific paths to point to a specific angular folder created with the cli.

So lets add a new phase for the client side build and add three tasks to it. Let's go!

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_37_12.jpg)

The first one is an npm install task. Nothing is installed globally as we want our repository being as standalone as possible.

> Avoid having a repository where the computer which wants to execute the programm has to install dependencies globally to execute your program. Your repo should be like a "black box" if you clone it you do an `npm install` and it should work. Unfortunately sometimes you have to and can not do anything about it ;-)

If you add a new npm task it is automatically an install task so you can leave it as is. The only change you have to make is to point the direction to the folder where the `package.json` lives which is the `client` folder in our case. You can browse to the repo by hitting the `...` button.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_57_42.jpg)

The next npm task is the `npm build` task. The `command` is now a custom command. Again the path is the `client` folder and the command is a run build. In our `package.json` file we are targetting the output folder `.dist/web`

```
 "scripts": {
    // scripts
    "build": "ng build --prod --output-path=\".dist/web\"",
    // more scripts
  },
```

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_57_48.jpg)

So that we have an output folder now we can also publish that result by publishing it as an artifact. The path to get is now `client/.dist/web`, as a name we can choose `dist` and the location should be `Visual Studio Team Services/TFS`.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_57_55.jpg)

So thats it. We created a pipeline for creating an artifact for the server app which is ASP.NET Core and the client application which is done via the AngularCLI.

But thats not all. Lets do a release taking the artifacts we created and dropping them to an Azure Web App in this case.

## Creating the release

### Preparation

Please log into you Azure Portal and create a new Web App with a name of your choice. In this case I took "AngularCliOnAzure" but that is really a sample name. But is should be mentioned that behind this runs a real web app on Azure.

### Releasing the server artifact

To release the server artifact we created (remember the \*.zip-file and the client artifact) we first have to create a new release. So head over ot the "Release" tab and hit "New Definition".

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_08_41.jpg)

The template we are going to select is a "Azure App Service Deployment" which we will use to get our artifact and drop it to Azure.

> This is an example. You can - maybe should - deploy your client and server code to different servers. That is why we separated them. In this example we will drop both artifacts to the same server. But I hope you get the idea.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_09_19.jpg)

The first artifact will be the server code. The artifact is a \*.zip file we created. So as a source we will select the build definition which produces the artifact as an output.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_09_40.jpg)

As we want to run a deployment everytime a successful build has run we can activate the continuous deployment trigger. Click on the flash and set the switch to "enabled".

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_09_53.jpg)

If you click on the "1 Phase, 1 Task" link it will redirect you to a page where we can take a closer look on _what_ should be done with the artifact. The general settings can be accessed within the environment tab which is called "Environment 1" in this case. Here we can choose where to put the artifact.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_17_27.jpg)

We can choose the artifact in the task directly. You can either select it by hitting the "..." button or give the path to it. Pay attention to the forward slashes and the name of the CI in front of the particular artifact. So this screenshot shows how to drop the \*.zip artifact to the web app on azure. This is our server code. It gets unzipped automatically for us.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1007_21_08.jpg)

### Releasing the client artifact

As the second artifact we have to pick the dist artifact from the client code which gets produced by build phase number two. So we can add another artifact and leave all the settings as is, except the source alias has to be different. We call it "createBuildPipelinePost-CI-client" in this case.

> The gray information tab below shows you which artifacts are getting produced, so this is another hint where you can see which artifacts are available.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_58_38.jpg)

The next screen is like the other one before, except we are taking the `dist` artifact which represents our client code now. See that this is not the dist folder we created but the dist (so the name of the) artifact.

![GithubRepository](https://cdn.offering.solutions/img/articles/2018-03-10/2018-03-1006_59_01.jpg)

And that is it. Now you should be able to check in something, a build should be triggered automatically and your app should be released to an Azure WebApp. Normally you should receive an email if everything ran smoothly or something went wrong.

### Conclusion

Although I personally think that many steps are needed to create a CI/CD (Continuous Integration/Continuous Deployment) pipeline for your apps with VSTS I think that it is very clear what is happening. The steps are well separated and when you create build you have a console output where you can see what is going wrong like it would appear on your console. Also separating the release from the build feels very clean and flexible. After getting into this a bit I am sure I will use it a lot in the future.

Cheers

Fabian
