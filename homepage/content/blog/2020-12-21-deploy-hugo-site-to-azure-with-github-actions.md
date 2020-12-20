---
title: Deploy a Hugo Static Site to Azure With GitHub Actions
date: 2020-12-21
tags: ['aspnetcore', 'github']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to write about how you can deploy your Static Site - maybe blog - generated with Hugo to Azure with Github Actions.

We will deploy two things in this article: First of all we deploy our hugo log to an Azure Web App and we deploy all static content like pictures, styles, javascript etc. to a CDN which is a Azure Storage Account. The main site is on the Azure Web App because I use multiple domains to point at my blog and IIRC the domains at an Azure Storage Account are case sensitive which I also ant to avoid. Both, the site and the cdn, are cached with cloudflare to not hit my Azure every time someone calls my url. This is served from cache then.

In this blog we will

- build our hugo site
- deploy one part to the Azure Web App
- deploy the other part to a cdn with the Azure CLI

Let's go.

## TL;DR

[Complete Example](#complete-example)

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
