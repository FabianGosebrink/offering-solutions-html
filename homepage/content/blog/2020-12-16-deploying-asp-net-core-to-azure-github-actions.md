---
title: Deploy a .NET 5 ASP.NET Core Application to Azure with Github Actions
date: 2020-12-15
tags: ['aspnetcore', 'github']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to write about how you can deploy your ASP.NET Core Web App running on .NET 5 to Azure with Github Actions.

GitHub Actions use a yaml format as well as the new Azure pipelines but their format is a little bit different. However I want to move more and more into GitHub Actions because I enjoy having my code an my build together and most of my repositories are stored in GitHub since private repositories are free.

So how you can deploy your ASP.NET Core Web App to Azure.

## TL;DR
[Complete Example](#complete-example)


## What you need

What you need is an existing Azure Web App. Inside the Azure Web App make sure that you download the publish profile.

![Screenshot of Azure Web App](http://localhost:1313/img/articles/2020-12-16/2020-12-16-1.jpg)

Once downloaded open your repository on GitHub and switch to the `Settings` tab choosing `Secrets` from the menu on the left.

Add a name for the secret and _Copy the raw xml content of the `publishsettings` file you just downloaded_ in there.

![Screenshot of GitHub Secrets](http://localhost:1313/img/articles/2020-12-16/2020-12-16-2.jpg)

The variable `MY_SECRET_PUBLISH_PROFILE` is needed for the Azure deployment trough the yaml file.

## Structure of the repository

In the GitHub repository we have a file structure where we have `frontend` and `backend` separated. So we have to deploy an ASP.NET Core app from a subfolder which we will do in the `*.yml` file.


```
├── .github // <- add this folder
├── frontend
├── backend
   └── aspnetcore
        ├── Folder1
        ├── Folder2
        ├── ...
        └── MyAppSolution.sln
```

Inside of this folder we will create a `workflows` folder and then a `dotnetcore.yml` where we place our yaml definition to describe the pipeline.

```
├── .github 
    └── workflows               // <- add this folder
        └── dotnet-core.yml    // <- add this file
├── frontend
├── backend
   └── aspnetcore
        ├── Folder1
        ├── Folder2
        ├── ...
        └── MyAppSolution.sln
```

Now let us set up the yaml pipeline:

We want to listen to the `main` branch including the pull requests:

```
on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main
```

Next we can configure environment variables describing our build environment. In this case we want to provide an app name for our build pipeline and a working directory as we are NOT working in root but in a nested folder called `backend/aspnetcore`.

```
on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

env:
  AZURE_WEBAPP_NAME: sampletodobackend
  WORKING_DIRECTORY: backend/aspnetcore 

```

## Configuring the build steps

Now let us define the build steps one by one:

1. Checkout and Setup .NET Core
2. Install the dependencies
3. Build
4. Test
5. Publish locally
6. Upload that artefact to Azure

in yaml:

```
    // ...other things

    steps:
        # Checkout and Setup .NET Core
      - uses: actions/checkout@v2

      - name: Setup .NET Core
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '5.0.100'

      - name: Install dependencies
        run: dotnet restore
        
      - name: Build
        run: dotnet build --configuration Release --no-restore
        
      - name: Test
        run: dotnet test --no-restore --verbosity normal

      - name: dotnet publish
        run: dotnet publish --configuration Release --output 'dotnetcorewebapp' 
```

Notice that we publish to a folder `dotnetcorewebapp` which does NOT need the prefix of the working directory, because we are already there.

Now the last step is to publish. But _here_ we need the complete path when we provide the artefact or `package` to publish! With a `${{ }}` syntax we can use the `MY_SECRET_PUBLISH_PROFILE` secret from GitHub we created in the first step of this blog.

```
      - name: 'Deploy to Azure WebApp'
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ env.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.MY_SECRET_PUBLISH_PROFILE }}
          package: '${{ env.WORKING_DIRECTORY }}/dotnetcorewebapp'
```

And that is it!

## Complete Example

```
name: .NET Core

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

env:
  AZURE_WEBAPP_NAME: sampletodobackend
  WORKING_DIRECTORY: backend/aspnetcore 

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: bash
        working-directory: ${{ env.WORKING_DIRECTORY }}

    steps:
      - uses: actions/checkout@v2

      - name: Setup .NET Core
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '5.0.100'
          
      - name: Install dependencies
        run: dotnet restore
        
      - name: Build
        run: dotnet build --configuration Release --no-restore
        
      - name: Test
        run: dotnet test --no-restore --verbosity normal
        
      - name: dotnet publish
        run: dotnet publish --configuration Release --output 'dotnetcorewebapp' 
          
      - name: 'Deploy to Azure WebApp'
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ env.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.MY_SECRET_PUBLISH_PROFILE }}
          package: '${{ env.WORKING_DIRECTORY }}/dotnetcorewebapp'
```

Hope this helps

Fabian