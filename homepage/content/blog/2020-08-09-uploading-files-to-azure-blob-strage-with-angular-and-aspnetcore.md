---
title: Uploading Files to Azure Blob Storage with Angular and ASP.NET Core
date: 2020-08-09
tags: ['aspnetcore', 'angular', 'azure']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to show how to upload files from an Angular application over an ASP.NET Core WebAPI to an Azure Blob Storage and save them there. Using an Azure Blob Storage for this is very easy and cheap as well so it is a perfect candidate not to pollute your App Service and store files there but use a dedicated system for this. In this blog post we will see how we can create the Azure Blob Storage in the Azure Portal, add the appropriate services into an ASP.NET Core WebAPI and add an Angular Client to upload the files.

[GitHub Repository](https://github.com/FabianGosebrink/angular-azure-blob-storage)

# TOC

- [Create the Azure Blob Storage](#create-the-azure-blob-storage)
- [The ASP.NET Core WebAPI](#the-asp.net-core-web-api)
  - [Installing the NuGet package](#installing-the-nu-get-package)
  - [Modifying the app settings](#modifying-the-app-settings)
  - [Registering the service](#registering-the-service)
  - [Creating a blob service](#creating-a-blob-service)
  - [Using the service in a controller](#using-the-service-in-a-controller)
- [Creating the Angular App](#creating-the-angular-app)
  - [The UploadService](#the-upload-service)
  - [The Uploading Component](#the-uploading-component)

# Create the Azure Blob Storage

Create the blob storage by entering your dashboard and select "Create Storage Account"

![Azure Dashboard Create New Storage Account](https://cdn.offering.solutions/img/articles/2020-08-09/1.png)

You can give it a name

![Azure Dashboard Naming New Storage Account](https://cdn.offering.solutions/img/articles/2020-08-09/2.png)

and then leave all the default values and click until "Review and Create" and then Create your Azure Storage Account.

When the Azure Storage Account is created you can go to the resource and hit the "Container" Button.

![Azure Storage Account Resource Container Button](https://cdn.offering.solutions/img/articles/2020-08-09/3.png)

We create a new container, set it to "Public access level" _"Blob"_ and give it a name. `firstcontainer` in this case.

![Azure Storage Account Resource Container Button](https://cdn.offering.solutions/img/articles/2020-08-09/4.png)

Then click "Create".

Inside of the container you can see no files yet, we will upload them with Angular and ASP.NET Core. Just read on 😉

![Azure Storage Account Resource Inside Container](https://cdn.offering.solutions/img/articles/2020-08-09/5.png)

If you go back into the Container Overview you can choose the "Access keys" in the menu on the left and then copy the first Connection string mentioned there.

![Azure Storage Account Connection String](https://cdn.offering.solutions/img/articles/2020-08-09/6.png)

We need this for later.

And that is basically it for setting up the Azure Blob Storage.

Let us move on and create the ASP.NET WebAPI.

# The ASP.NET Core WebAPI

## Installing the NuGet package

To upload files to the blob storage we will create a few services inside of the API which will communicate with our Azure Blob Storage. Before we do this we need to add a NuGet package:

[NuGet Azure Storage Blobs Package](https://www.nuget.org/packages/Azure.Storage.Blobs)

You can check if and which version o the package is installed by checking your `*.csproj` file to find an entry like this:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  // ...

  <ItemGroup>
    <PackageReference Include="Azure.Storage.Blobs" Version="<VERSION_HERE>" />
    // ...
  </ItemGroup>

   // ...

</Project>
```

## Modifying the app settings

Now let us enter the `appsettings.json` file to add an entry called `AzureBlobStorage` and paste the connection string you just copied here

```json
{
  // ...
  "AzureBlobStorage": "<SUPER_SECRET_CONNECTION_STRING>"
}
```

## Registering the service

In the `Startup.cs` file we can now register a `BlobServiceClient` into our services container using the namespace `Azure.Storage.Blobs` and pass it the previously added value from the configuration.

```csharp
using Azure.Storage.Blobs;

public void ConfigureServices(IServiceCollection services)
{
	// ...

	services.AddScoped(x => new BlobServiceClient(Configuration.GetValue<string>("AzureBlobStorage")));

	// ...
}
```

## Creating a blob service

Having done that we can inject the `BlobServiceClient` into a service `BlobService` we create next.

```csharp
public class BlobService : IBlobService
{
    private readonly BlobServiceClient _blobServiceClient;

    public BlobService(BlobServiceClient blobServiceClient)
    {
        _blobServiceClient = blobServiceClient;
    }

    public async Task<Uri> UploadFileBlobAsync(string blobContainerName, Stream content, string contentType, string fileName)
    {
        var containerClient = GetContainerClient(blobContainerName);
        var blobClient = containerClient.GetBlobClient(fileName);
        await blobClient.UploadAsync(content, new BlobHttpHeaders { ContentType = contentType });
        return blobClient.Uri;
    }

    private BlobContainerClient GetContainerClient(string blobContainerName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(blobContainerName);
        containerClient.CreateIfNotExists(PublicAccessType.Blob);
        return containerClient;
    }
}
```

The method `UploadFileBlobAsync` uploads a file to the blob storage we just created using the `BlobServiceClient`. First, we get the container client and call `CreateIfNotExists` on it.

> This will ensure the container is there when we upload something into it. However if you do not want to let your API decide which containers to be created or do this when seeding or not in the api at all you have to remove or move this line to another place. 😊

When returned the `containerClient` we create a `blobClient` and upload it setting the content type and returning the `Uri` object here.

Register the service with its interface in the `Startup.cs` as following

```csharp
services.AddScoped<IBlobService, BlobService>();
```

## Using the service in a controller

Inside our controller we can now inject the service and call the method to upload the file size. We are reacting to a `POST` request and reading the file from the `Request` object and return a JSON with a property `path` containing the absolute path to the resource we just uploaded.

Note that we are using the `DisableRequestSizeLimit` here for demo. Maybe you want to remove this in production apps. As a `blobContainerName` param we are passing the name of the container we want to store our data in. We just created this before when adding the storage in Azure but with our code a new one will be created as well automatically for us.

```csharp
using ...

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private IBlobService _blobService;

        public UploadController(IBlobService blobService)
        {
            _blobService = blobService;
        }

        [HttpPost(""), DisableRequestSizeLimit]
        public async Task<ActionResult> UploadProfilePicture()
        {
            IFormFile file = Request.Form.Files[0];
            if (file == null)
            {
                return BadRequest();
            }

            var result = await _blobService.UploadFileBlobAsync(
                    "firstcontainer",
                    file.OpenReadStream(),
                    file.ContentType,
                    file.FileName);

            var toReturn = result.AbsoluteUri;

            return Ok(new { path = toReturn });
        }
    }
}

```

Our upload url will be `<domain>/api/v1/upload` then.

That is it for the backend, we just have to add the frontend now and create an Angular app which will upload the files for us.

# Creating the Angular App

The Angular app is pretty straight forward. First let us create an `UploadService` which communicates to the backend.

## The UploadService

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private http: HttpClient) {}

  upload(formData: FormData) {
    return this.http.post<{ path: string }>(
      'https://localhost:5001/api/upload',
      formData
    );
  }
}
```

In the `app.module.ts` the `HttpClientModule` has to be added to the `imports` as well.

```ts
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, HttpClientModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## The Uploading Component

In the components template we use a button to open a hidden file input and we are setting the filename of the selected file so the user knows that a file was created. A `save` button then calls a `save()` method where the files are getting passed and kicks of the saving progress

```html
<button type="button" (click)="fileInput.click()">
  Choose File
</button>
<input
  hidden
  #fileInput
  type="file"
  id="file"
  (change)="setFilename(fileInput.files)"
/>
<label>{{ filename }}</label>
<br />
<button type="button" (click)="save(fileInput.files)">
  Save
</button>
<br />
<img [src]="imageSource" />
```

The component class gets injected the `UploadService` and calls the `upload` method passing the form data. When the call comes back we are extracting the `path` property and setting it as image source to display the picture we just uploaded.

```ts
import { Component } from '@angular/core';
import { UploadService } from './upload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  filename = '';

  imageSource = '';

  constructor(private uploadService: UploadService) {}

  setFilename(files) {
    if (files[0]) {
      this.filename = files[0].name;
    }
  }

  save(files) {
    const formData = new FormData();

    if (files[0]) {
      formData.append(files[0].name, files[0]);
    }

    this.uploadService
      .upload(formData)
      .subscribe(({ path }) => (this.imageSource = path));
  }
}
```

![Angular App showing the uploaded picture](https://cdn.offering.solutions/img/articles/2020-08-09/7.png)

And we can see the file in the blob container.

![Azure Container showing the uploaded picture](https://cdn.offering.solutions/img/articles/2020-08-09/8.png)

[GitHub Repository](https://github.com/FabianGosebrink/angular-azure-blob-storage)

And that is it, hope it helps!

Fabian
