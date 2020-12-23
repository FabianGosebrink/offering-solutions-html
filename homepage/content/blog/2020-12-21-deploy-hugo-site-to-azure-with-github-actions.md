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

## Setting up the environment

So for my case my blog is in a working directory `homepage` so we will set this to here, you can also pass a `.` as a root folder or delete the property at all. In addition to that we are listening to the main branch and PRs as the following

```
name: Build and Release Hugo Site

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

env:
  BASE_URL: https://offering.solutions/
  WORKING_DIRECTORY: homepage
```

As our build task for hugo can take a `baseURL` we will pass it like this.

Now let us set up a job called `build-and-deploy` and run it on ubuntu with the powershell and configure the working directory using the environment variable above.

```
env:
  BASE_URL: https://offering.solutions/
  WORKING_DIRECTORY: homepage

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: pwsh
        working-directory: ${{ env.WORKING_DIRECTORY }}

```

## Build our Hugo site

As one of the first steps we want to build our hugo blog. We can use the action `peaceiris/actions-hugo@v2` here passing the hugo version we are running locally when previewing our blog. We are building our hugo site and pass the baseURL with `hugo --minify --baseURL ${{ env.BASE_URL }}`

```
steps:
  - uses: actions/checkout@v2

  - name: Setup hugo
    uses: peaceiris/actions-hugo@v2
    with:
      hugo-version: '0.73.0'

  - name: Build hugo
    run: hugo --minify --baseURL ${{ env.BASE_URL }}
```

Having done that we now have a `public` folder where our hugo site was built in.

We want to get our blog items now to our Azure Web App and the other static content like images, js, css etc. to the static web app on Azure.

First, we copy all the items we need in a folder `public/dist-cdn`

```
- name: 'Copy Files to: homepage/public/dist-cdn'
      run: |
        Copy-Item -Path public/js/ public/dist-cdn/ -recurse
        Copy-Item -Path public/css/ public/dist-cdn/css -recurse
        Copy-Item -Path public/fonts/ public/dist-cdn/fonts -recurse
        Copy-Item -Path public/img/ public/dist-cdn/img -recurse
        Copy-Item -Path public/index.json public/dist-cdn -recurse
```

Inside the `public` folder a new folder called `public `

## Complete Example

```
name: Build and Release Hugo Site

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

env:
  BASE_URL: https://offering.solutions/
  WORKING_DIRECTORY: homepage

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: pwsh
        working-directory: ${{ env.WORKING_DIRECTORY }}

    steps:
      - uses: actions/checkout@v2

      - name: Setup hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.73.0'

      - name: Build hugo
        run: hugo --minify --baseURL ${{ env.BASE_URL }}

      - name: 'Copy Files to: homepage/public/dist-cdn'
        run: |
          Copy-Item -Path public/js/ public/dist-cdn/ -recurse
          Copy-Item -Path public/css/ public/dist-cdn/css -recurse
          Copy-Item -Path public/fonts/ public/dist-cdn/fonts -recurse
          Copy-Item -Path public/img/ public/dist-cdn/img -recurse
          Copy-Item -Path public/index.json public/dist-cdn -recurse

      - name: 'Copy Files to: homepage/public/dist-blog'
        run: |
          New-Item -Path public/dist-blog -ItemType Directory
          Copy-Item -Path public/blog/ -Destination public/dist-blog/blog -recurse
          Copy-Item -Path public/categories/ -Destination public/dist-blog/categories -recurse
          Copy-Item -Path public/tags/ -Destination public/dist-blog/tags -recurse
          Copy-Item -Path public/talks/ -Destination public/dist-blog/talks -recurse
          Copy-Item -Path public/newsletter/ -Destination public/dist-blog/newsletter -recurse
          Copy-Item -Path public/*.* -Destination public/dist-blog

      - name: 'Deploy Blog to Azure Web App'
        uses: azure/webapps-deploy@v2
        with:
          app-name: offeringsolutions
          publish-profile: ${{ secrets.AZURE_WEBAPP_OFFERING_SOLUTIONS_BLOG_SECRET }}
          package: '${{ env.WORKING_DIRECTORY }}/public/dist-blog'

      - name: Login via Az module
        uses: azure/login@v1
        with:
          creds: ${{secrets.AZURE_CDN_CREDENTIALS}}
          enable-AzPSSession: true

      - name: Reupload all blog items
        uses: azure/CLI@v1
        with:
          azcliversion: 2.0.72
          inlineScript: |
            az storage blob delete-batch --account-name 'offeringsolutionscdn' --source '$web'
            az storage blob upload-batch --account-name 'offeringsolutionscdn' --destination '$web' --source '${{ env.WORKING_DIRECTORY }}/public/dist-cdn' --content-cache-control "public, max-age=2592000"

```

Hope this helps

Fabian
