---
title: Uploading Files to Azure Blob Storage with Angular and Asp.Net Core
date: 2020-06-05
tags: ['aspnetcore', 'angular', 'azure']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to show how to upload files from an Angular application over an ASP.NET Core WebAPI to an Azure Blob Storage and save them there. Using an Azure Blob Storage for this is very easy and cheap as well so it is a perfect candidate not to pollute your App Service and store files there but use a dedicated system for this. In this blog post we will see how we can create the Azure Blob Storage in the Azure Portal, add the appropriate services into an ASP.NET Core WebAPI and add an Angular Client to upload the files.

# TOC

- [Create the Azure Blob Storage](#create-the-azure-blob-storage)

# Create the Azure Blob Storage

Create the blob storage by entering your dashboard and select "Create Storage Account"

![Azure Dashboard Create New Storage Account](https://cdn.offering.solutions/img/articles/2020-08-10/1.png)

You can give it a name

![Azure Dashboard Naming New Storage Account](https://cdn.offering.solutions/img/articles/2020-08-10/2.png)

and then leave all the default values and click until "Review and Create" and then Create your Azure Storage Account.

When the Azure Storage Account is created you can go to the resource and hit the "Container" Button.

![Azure Storage Account Resource Container Button](https://cdn.offering.solutions/img/articles/2020-08-10/3.png)

We create a new container, set it to "Public access level" _"Blob"_ and give it a name. `firstcontainer` in this case.

![Azure Storage Account Resource Container Button](https://cdn.offering.solutions/img/articles/2020-08-10/4.png)

Then click "Create".

Inside of the container you can see no files yet, we will upload them with Angular and ASP.NET Core. Just read on 😉

![Azure Storage Account Resource Inside Container](https://cdn.offering.solutions/img/articles/2020-08-10/5.png)

If you go back into the Container Ovweview you can choose the "Access keys" in the menu on the left and then copy the first Connection string mentioned there.

![Azure Storage Account Connection String](https://cdn.offering.solutions/img/articles/2020-08-10/6.png)

We need this for later.

And that is basically it for setting up the Azure Blob Storage.

Let us move on and create the ASP.NET WebAPI.
