---
title: Hosting Hugo on Azure with Cloudflare, Azure Web Service and Azure Blob Storage
date: 2019-06-07
tags: ['cloudflare', 'azure', 'hugo']
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to describe how I moved my complete company homepage and my blog from static handwritten html and jekyll to a hugo solution which is hosted on azure and uses cloudflare as DNS, has a CI/CD pipeline and is hosted on azure.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Thinking about moving my blog from jekyll to <a href="https://twitter.com/GoHugoIO?ref_src=twsrc%5Etfw">@GoHugoIO</a>...</p>&mdash; Fabian Gosebrink @ 🏠🇨🇭 (@FabianGosebrink) <a href="https://twitter.com/FabianGosebrink/status/1118459324395921408?ref_src=twsrc%5Etfw">April 17, 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## The Situation in the past

As my company homepage and my blog have been two projects in the past I had two different repositories for both which were lying on an azure devops git repo (html page) and on github.com (blog).

The blog was a jekyll blog which was creating my html pages from markdown and then deployed to the same webserver as my website was hosted. The both repositories had two different CI/CD pipelines on dev.azure.com and if I checked in one of them, the build was triggered and either the blog was deployed in a subfolder or the website was deployed to root. But they did not have the same look and feel as this was grown historically.

The site was hosted on one.com including the domain. I am very satisfied with one.com. It ran all the time without any problem, support was good, had no pain with it. But I could not change the nameservers and because of that not use cloudflare. And I wanted to host my site on azure.com to get a feeling of this, better integration and find a good solution to combine site and blog in one.

Also the build time from my jekyll blog was incredible: 30 seconds when saving a blog until I saw the changes was definitely too much. I know that it does not sound that long, but if you are working on a page and are used to an instant refresh which you get normally 30 seconds is way too much for a blog post.
I also ran the bash shell on Windows to have a linux system which was running jekyll faster but it also took around 10 seconds to rebuild my blog...and I was tired of that.

So my plan was to:

- Find a solution which hosts my website _and_ my blog for one look and feel.
- Migrating my blog from jekyll to hugo, so using hugo for all of it: website and blog.
- Moving the domain from one.com to godaddy and host it on azure instead of one.com
- Adding a CI/CD pipeline in Azure DevOps to continually build and deploy my hugo site
- Using cloudflare as a DNS to improve caching and speed and reduce costs for the azure web service
- Using azure blob storage to work as cdn for static files like _.js, _.css, and images
- Costs should be manageable.

And the time I had was one weekend...so lets go :-)

## Finding a theme

That was one of the hardest parts to be honest. I wanted a clean (for me) nice looking theme which was covering the basic information and was able to display a list of blogs including a single page for one single blog post. I thought [forty](https://themes.gohugo.io/forty/) would fit very well. So I went for that one.

## Installing Hugo and adapting the theme

Hugo can be installed very quickly. Find the instructions [here](https://gohugo.io/getting-started/installing/). I used Chocolatey to install it and getting it up and running was really easy.

I tweaked the theme a bit, added all my pictures, adapted colors (mostly with google chromes dev tools) and overwrote the css etc. So web developer things which we are doing :) At some point "my" design was looking good so I could start adapting all my content.

## Moving from jekyll to hugo

Here is the thing: This was the most unspectacular part in the whole process of migrating from A to B. I copied over the \*.md files and had to modify the markdown metainformation in the header. Which was also because I did not want to use the old design but introduced a completely new one.

Old (Jekyll)

```
---
title: Refactoring Container Components to Fetch Data With Route Resolvers
date: 2019-02-27 10:00
author: Fabian Gosebrink
layout: post
tags: angular routeresolvers components
logo: 'assets/images/logo_small.png'
navigation: true
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---
```

new (hugo)

```
---
title: Refactoring Container Components to Fetch Data With Route Resolvers
date: 2019-02-27
tags: ["angular", "routeresolvers", "components"]
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: [
    "/blog/articles/2019/02/27/refactoring-container-components-to-fetch-data-with-route-resolvers/",
]
---
```

I had to get a little into the new markdown structure and into how hugo handles files. I did the migration of the markdown files all manually which took a while but for me it was the fastest way.

With `hugo server -D` a local webserver is started and you can access to complete page at `localhost:1313` in my case. This made it very easy to see the outcome, also because hugo is very very fast in reloading which was one of the main reason for me to switch.

I had to migrate the `.toml` file a bit and do a little html here and css there. But even for a non designer like me this was totally managable. But I think this also depends on how far you want to go with your theme.

Compared to jekyll I think that hugo is a little hard to get in and has a steep learning courve which I haven't mastered completely yet. However, with some searching and trial-error I got where I wanted to and could build up my site.

I put everything up to github which you can find here: [https://github.com/FabianGosebrink/offering-solutions-html](https://github.com/FabianGosebrink/offering-solutions-html)

So at the end of that chapter my blog was totally fine running locally.

## Preparing Azure

As the overview is best in resource groups and the costs can be seen best per resourcegroup I created a complete new one in Azure. I added four things into it:

- A app service to host my site
- A storage account to act as cdn later
- Application insights (were added automatically)
- An App Service Plan (which is needed anyway)

![Azure resourcegroup](https://cdn.offering.solutions/img/articles/2019-06-07/resource-group.png)

As these things were ready I wanted to next build up the CI/CD pipeline for the blog and homepage in Azure Devops.

I choose an Azure App Service for my blog because a blob storage _must_ have a subdomain and I want the page to be available via `http://offering.solutions/` without subdomains and a blob storage is case sensitive which is bad for getting recognized by search engines, so I went for an app service instead but wanted to use a blog storage to work as a "cdn"-like service to provide my static files.

## Preparing the static files

In the Azure Blob Storage I did a new container called `$web` where I upload all the files.

![cdn container](https://cdn.offering.solutions/img/articles/2019-06-07/cdn-container.png)

## Building a CI/CD pipeline for the blog

In Azure Devops which you can access via `https://dev.azure.com/<yourusername>/` I created a new CI/CD pipeline by clicking on the `Create new project` in the upper right corner and connected it to my existing github project.

For generating the site I used a build task which build my site running the needed hugo commands. You can find the extension here: [Visual Studio Marketplace Hugo extension](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension).

![CICD-1](https://cdn.offering.solutions/img/articles/2019-06-07/cicd-1.png)

So the source of my hugo site is the folder `homepage` and the destination is `homepage/public`. This is the folder all files are build to. I am overwriting the `BaseUrl` with the domain `https://offering.solutions`. I would not have to do this as in my `config.toml` file the `baseURL = "https://offering.solutions/"` is already set to the correct domain. It was more to try it out a bit :)

As next step I had to divide the files which are going to be deployed to the azure blob service and the files which are going to be deployed to the main domain web service on azure.

So in the next two steps the files from the `public` folder are separated.

![CICD-2](https://cdn.offering.solutions/img/articles/2019-06-07/cicd-2.png)

To the folder `homepage/public/dist-cdn` I am copying over all the static files like images, fonts, css and javascript.

![CICD-3](https://cdn.offering.solutions/img/articles/2019-06-07/cicd-3.png)

As in the `dist-blog` folder all the other files are getting copied.

To trigger a build everytime I check something into the repo I enable the "Continuous Integration" in the "Triggers" Tab at the checkbox "Enable Continuous Integration"

In the end I have to publish the two artifacts `blog` and `cdn` to make them available to my release manager where I pick them up and release them to Azure.

## Modifying the CI/CD pipeline to deploy to Blob Service and App Service

In the release manager I am referring to the dropped outputs now and moving the one to the cdn and the other to the azure web service.

![release manager first pic](https://cdn.offering.solutions/img/articles/2019-06-07/release-1.png)

![release manager second pic](https://cdn.offering.solutions/img/articles/2019-06-07/release-2.png)

With enabled Conitinuous Integration everytime I check in a new build and release is triggered. Perfect!

So now my new blog is available under the `azurewebsites` domain. Time to move the domain, too.

## Moving the domain to GoDaddy and adding cloudflare

To move my old domain to godaddy I canceled my subscription at one.com and they gave me a code I could use to move the domain. In GoDaddy I logged in and used this link [https://www.godaddy.com/domains/domain-transfer](https://www.godaddy.com/domains/domain-transfer) to transfer my domain.

After I did this I went to Cloudflare (see below) and signed in as well. I added my domain and controlled everything from there then. In GoDaddy I added the cloudflare nameservers like this:

![Godaddy nameservers](https://cdn.offering.solutions/img/articles/2019-06-07/godaddy.png)

## Adding the custom domain to the web service

So in Azure I added the custom domain names to the web service. I used the guide from the docs here [https://docs.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain](https://docs.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain).

I added the static custom domain like this:

![customdomain cdn](https://cdn.offering.solutions/img/articles/2019-06-07/customdomain-cdn.png)

And the custom domains for the app service like this. If you want to know how to exactly add them refer to the guide above.

> Do not be scared about the "Not Secure" in the picture. This means, that no SSL certificate has been added. We will serve our page with cloudflare and ssl in the end.

![customdomain-appservice](https://cdn.offering.solutions/img/articles/2019-06-07/customdomain-appservice.png)

Of course in Cloudflare I added these mappings then as we use the Cloudflare nameservers and not the ones from godaddy anymore.

![cloudflare-mappings](https://cdn.offering.solutions/img/articles/2019-06-07/cloudflare-mappings.png).

Notice that the `cdn.offeringsolutions` is pointing to my custom domain of the azure cdn blob storage and the `offering.solutions` and `www.offering.solutions` is pointing to the azure web service.

## Adding the CDN to Hugo

In hugo itself I had to pay attention to provide the correct domain of the cdn like this in the `config.toml` file.

```
# Site settings
baseURL = "https://offering.solutions/"

[params]
  cdnbaseurl = "https://offering.solutions/"

```

After I have done this I replaced all the references to the pictures in my blogposts to send the requests to the cdn as all static files are living there now.

## Adding the correct caching

So to serve as much as we can from the cache I went into Cloudflare and modified the caching up to 12 hours (which is not much, but read further)

![cloudflare-cache](https://cdn.offering.solutions/img/articles/2019-06-07/caching.png)

So the "Browser Cache Expiration" setting tells that it will fall back to the setting which is given in cloudflare but respect the caching headers if they are set. I wanted to try that out and was searching for a way to modify my cache headers on the static files on azure because this is where all the static files are coming from.

With the help of [Benjamin Abt](https://twitter.com/abt_benjamin) I got a script which was doing exactly that for me with the Azure CLI. So I wanted to improve my release pipeline to do that automatically for me.

The Azure App Service Deploy stayed the same but I removed the old task of deploying the files to the blog and used the azure cli instead with the following script

```
az storage blob upload-batch --account-name <storage-account-name-here> --destination <container-here> --source $(System.DefaultWorkingDirectory)\offering-solutions-hugo-CI\cdn --content-cache-control "public, max-age=2592000"
```

Where `$(System.DefaultWorkingDirectory)\offering-solutions-hugo-CI\cdn` refers to the name of the artifact getting dropped out.

![new release pipeline](https://cdn.offering.solutions/img/articles/2019-06-07/new-rls-pipeline-2.png)

The files on Azure can now be inpected with the correct values which were set when uploading them:

![azure-cache](https://cdn.offering.solutions/img/articles/2019-06-07/azure-cache.png)

![browser-cache](https://cdn.offering.solutions/img/articles/2019-06-07/browser-cache.png)

## The costs

So last but not least let us talk about what the whole thing costs in one month. For this, let us first look at some data from cloudflare:

![cloudflare-stats](https://cdn.offering.solutions/img/articles/2019-06-07/cloudflare-stats-2.png)

In the last 30 days the site delivered 8GB with nearly 80% cached. That is pretty cool! From 8 GB 6 GB were served out of the cache.

But what does the costs say in Azure? Let us hit the resource group we created in the beginning and take a look at the costs of the May 2019.

![azure-pricing](https://cdn.offering.solutions/img/articles/2019-06-07/azure-pricing.png)

So in the complete month May 2019 the whole website costed 9.74 CHF which is about 8.73 Euro or 9.86 USD. As I got a MSDN Subscription this totally lies in the scope of my free amount which I can spend over the months. So actually I am running it for free.

Of course you have to add the domain `offering.solutions` to it which is 25 CHF a year. So calculation the whole costs of this my website and domain cost me approcimately 144 CHF a year including a cloud based solution, the domain, CI/CD, a CDN etc.

For me this is, until now, a perfect solution.

## Conclusion

So in the beginning we wanted to fullfill the following points:

- Find a solution which hosts my website _and_ my blog for one look and feel.

Did that with hugo and Azure

- Migrating my blog from jekyll to hugo, so using hugo for all of it: website and blog.

Done by migration all in one repository

- Moving the domain from one.com to godaddy and host it on azure instead of one.com

Did taht with godaddy domains and the domains registered on azure as custom domains.

- Adding a CI/CD pipeline in Azure DevOps to continually build and deploy my hugo site

Done via Azure DevOps, Azure CLI and a Github Repo.

- Using cloudflare as a DNS to improve caching and speed and reduce costs for the azure web service

Also done that, Cloudflare acting as a DNS and takes care about the caching.

- Using azure blob storage to work as cdn for static files like _.js, _.css, and images

Did a separate artifact and released that one to the blob storage we used to serve static files.

- Costs should be managable.

The costs are very managable and if I encounter a higher cost during the time I would add cost allerts etc, so I have full control.

In the end I am very happy with the solution because it gives me full control by having nearly everthing automated. I really like the outcome. Once again, thanks [Benjamin Abt](https://twitter.com/abt_benjamin) for the help at this.
