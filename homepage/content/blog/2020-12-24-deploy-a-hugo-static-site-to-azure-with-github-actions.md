---
title: Deploy a Hugo Static Site to Azure With GitHub Actions
date: 2020-12-24
tags: ['hugo', 'github']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to write about how you can deploy your Static Site - maybe blog - generated with Hugo to Azure with Github Actions.

We will deploy two things in this article: we deploy a Hugo blog to an Azure Web App and deploy all static content like pictures, styles and Javascript to a CDN which is implemented using an Azure Storage Account. The main site is an Azure Web App because I use multiple domains to point to my blog. As far as I know, the Azure Storage Account URLs are case sensitive. I want to avoid this. Both, the site and the CDN are cached with Cloudflare which prevents traffic to my Azure every time someone calls one of the sites. This is served from the Cloudflare cache.

In this blog we will

- build our hugo site
- deploy one part to the Azure Web App
- deploy the other part to a cdn with the Azure CLI

Let's go.

- [Setting up the environment](#setting-up-the-environment)
- [Build our Hugo site](#build-our-hugo-site)
- [Deploying to Azure Web App](#deploying-to-azure-web-app)
- [Uploading the files to a storage account](#uploading-the-files-to-a-storage-account)
- [Complete Example](#complete-example)

## TL;DR

[Complete Example](#complete-example)

## Setting up the environment

For my case, my blog is in a working directory `homepage`. We set the environment variable to `homepage` and you can also pass a `.` as a root folder or delete the property, if you are at root level. In addition to that, we are listening to the `main` branch for changes.

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

The build task Hugo can take a `baseURL` and we created an environment variable for this as well.

```
BASE_URL: https://offering.solutions/
```

Now let us set up a job called `build-and-deploy` and run it on ubuntu with the powershell and configure the working directory using the environment variable we declared.

```
env:
  BASE_URL: https://offering.solutions/
  WORKING_DIRECTORY: homepage

jobs:
  build-and-deploy:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action == 'closed' && github.event.pull_request.merged == true)
    runs-on: ubuntu-latest
    defaults:
      run:
        shell: pwsh
        working-directory: ${{ env.WORKING_DIRECTORY }}

```

## Build our Hugo site

In one of the first steps, we want to build the Hugo blog. We can use the action `peaceiris/actions-hugo@v2` here passing the Hugo version we are running. With the action building the Hugo site, pass the baseURL with `hugo --minify --baseURL ${{ env.BASE_URL }}` as a parameter.

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

Having set this up, we now have a `public` folder where the Hugo site was built.

We want to copy the blog items to the Azure Web App and the other static content like images, js, css etc. to the storage account on Azure.

First, we copy all the items for the storage account in a folder called `public/dist-cdn`

```
- name: 'Copy Files to: homepage/public/dist-cdn'
      run: |
        Copy-Item -Path public/js/ public/dist-cdn/js -recurse
        Copy-Item -Path public/css/ public/dist-cdn/css -recurse
        Copy-Item -Path public/fonts/ public/dist-cdn/fonts -recurse
        Copy-Item -Path public/img/ public/dist-cdn/img -recurse
        Copy-Item -Path public/index.json public/dist-cdn -recurse
```

Inside the `public` folder a new folder called `public/dist-cdn` was created which is like an artefact which we are going to upload to our storage account later. The other folder created is for the sites, ie the blog itself which we are going to deploy to the Azure Web App.

```
- name: 'Copy Files to: homepage/public/dist-blog'
      run: |
        New-Item -Path public/dist-blog -ItemType Directory
        Copy-Item -Path public/blog/ -Destination public/dist-blog/blog -recurse
        Copy-Item -Path public/categories/ -Destination public/dist-blog/categories -recurse
        Copy-Item -Path public/tags/ -Destination public/dist-blog/tags -recurse
        Copy-Item -Path public/talks/ -Destination public/dist-blog/talks -recurse
        Copy-Item -Path public/newsletter/ -Destination public/dist-blog/newsletter -recurse
        Copy-Item -Path public/*.* -Destination public/dist-blog
```

So now we have two folders: `public/dist-cdn` and we have `public/dist-blog` which we are going to deploy to different resources now.

## Deploying to Azure Web App

As we want to deploy the `public/dist-blog` to the Azure Web App, we can add the publish profile to the GitHub secrets as described [here](https://offering.solutions/blog/articles/2020/12/16/deploy-a-.net-5-asp.net-core-application-to-azure-with-github-actions/) and use the folder as the `package` to upload it directly.

```
- name: 'Deploy Blog to Azure Web App'
  uses: azure/webapps-deploy@v2
  with:
    app-name: offeringsolutions
    publish-profile: ${{ secrets.AZURE_WEBAPP_OFFERING_SOLUTIONS_BLOG_SECRET }}
    package: '${{ env.WORKING_DIRECTORY }}/public/dist-blog'
```

Great. As we have done that now, we can use the Azure CLI to upload our CDN files to the storage account.

## Uploading the files to a storage account

First, we have to login to have the rights to upload files. To login, we can use the [Azure Login Action](https://github.com/Azure/login). To get the secret, follow the steps described in [Configure deployment credentials](https://github.com/Azure/login#configure-deployment-credentials) or [Set up a GitHub Actions workflow to deploy your static website in Azure Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-static-site-github-actions)

So what I did was taking the blueprint of the command

```
az ad sp create-for-rbac --name "{sp-name}" --sdk-auth --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.Web/sites/{app-name}
```

and added my values. I was then executing it via the Azure CLI. I used the VSCode extension [Azure CLI Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.azurecli) but you can use whatever you like. The output was:

```
{
  "clientId": "<GUID>",
  "clientSecret": "<GUID>",
  "subscriptionId": "<GUID>",
  "tenantId": "<GUID>",
  (...)
}
```

I added this to my GitHub secrets as described above with the publish profile in the same way, only calling it `AZURE_CDN_CREDENTIALS`.

Now we can build the login action using the credentials.

```
- name: Login via Az module
  uses: azure/login@v1
  with:
    creds: ${{secrets.AZURE_CDN_CREDENTIALS}}
    enable-AzPSSession: true
```

As we are logged in now, we can upload all blog items to the CDN with the Azure CLI. We use the `$web` container and upload everything we have in the container. I added a cache time from 23 hours just to be sure.

```
- name: Reupload all blog items
  uses: azure/CLI@v1
  with:
    azcliversion: 2.0.72
    inlineScript: |
      az storage blob delete-batch --account-name 'offeringsolutionscdn' --source '$web'
      az storage blob upload-batch --account-name 'offeringsolutionscdn' --destination '$web' --source '${{ env.WORKING_DIRECTORY }}/public/dist-cdn' --content-cache-control "public, max-age=43200"

```

And that was it. After the build is finished our Hugo page got built, uploaded to the Azure Web App and to the Azure storage account. I have caching enabled with Cloudflare, so that all requests do not hit my Azure Web App every time.

Hope this helps.

Fabian

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
          Copy-Item -Path public/js/ public/dist-cdn/js -recurse
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
            az storage blob upload-batch --account-name 'offeringsolutionscdn' --destination '$web' --source '${{ env.WORKING_DIRECTORY }}/public/dist-cdn' --content-cache-control "public, max-age=43200"


```

Hope this helps

Fabian
