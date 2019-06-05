---
title: Hosting an hugo site on azure with cloudflare, godaddy and CDN
date: 2019-04-26
tags: ['cloudflare', 'azure', 'hugo']
draft: true
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blogpost I want to describe how I moved my complete company homepage and my blog from static handwritten html and jekyll to a hugo solution which is hosted on azure and uses cloudflare as DNS, has a CI/CD pipe line and is hosted on github.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Thinking about moving my blog from jekyll to <a href="https://twitter.com/GoHugoIO?ref_src=twsrc%5Etfw">@GoHugoIO</a>...</p>&mdash; Fabian Gosebrink @ 🏠🇨🇭 (@FabianGosebrink) <a href="https://twitter.com/FabianGosebrink/status/1118459324395921408?ref_src=twsrc%5Etfw">April 17, 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## The Situation in the past

As my company homepage and my blog have been two projects in the past I had two different repositories for both which were lying on azure dev ops (html page) and on github.com (blog).

The blog was a jekyll blog which was creating my sites statically and then deployed to the same webserver as my website was hostes. The both repositories had two different ci/cd pipelines on dev.azure.com and if I check in one of them, the build was triggered and either the blog was deployed in a subfolder or the website was deployed to root. But they just did not have the same look and feel as this was grown historically.

The site was hosted on one.com including the domain. I am very satisfied with one.com. It ran all the time without any problem, support was good, had no pain with it. But I could not change the nameservers and because of that not use cloudflare. And I wanted to host my site on azure.com and find a good solution to combine site and blog in one.

Also the build time from my jekyll blog was incredible: 30 seconds when saving a blog until I saw the changes was definetly too much. I know that it does not sound that long, but if you are working on a page and are used to an instant refresh which you get normally 30 seconds is way too much for a simple blogpost.
I also ran the bash shell on Windows to have a linux system which was running jekyll fast, but it also took around 10 seconds to rebuild my blog...and I was tired of that.

So my plan was to:

- Find a solution which hosts my website _and_ my blog for one look and feel.
- migrating my blog from jekyll to hugo, so using hugo for all of it: website and blog.
- moving the domain from one.com to godaddy and host it on azure instead of one.com
- adding a CI/CD pipeline in Azure DevOps to continually build and deploy my hugo site
- using cloudflare as a DNS to improve caching and speed and reduce costs for the azure web service
- using azure storage to work as cdn for static files like _.js, _.css, and images
- costs should be managable.

And the time I had was one weekend...so lets go :-) I will mention the steps I did one by one.

## Finding a theme

That was one of the hardest parts to be honest. I wanted a clean (for me) nice looking theme which was covering the basic information and was able to display a list of blogs including a simple single page for one single blogpost. I thought [forty](https://themes.gohugo.io/forty/) would fit very well. So I went for that one.

## Installing Hugo and adapting the theme

Hugo can be installed very quickly. Find the instructions [here](https://gohugo.io/getting-started/installing/). I used Chocolatey to install it and getting it up and running was really easy.

I tweaked the theme a bit, added all my picutres, adapted colors (mostly with google chromes dev tools) and overwrote the css etc. So web developer things which we a re doing :) At some point "my" design was looking good so I could start adapting all my content.

## Moving from jekyll to hugo

Here is the thing: This was the most unspectacular part in the whole process of migrating from A to B. I just copied over the \*.md files and had to modify the markdown metainformation in the header. Which was also because I did not want to use the old design but introduced a completely new one.

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
tags: ['angular', 'routeresolvers', 'components']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: [
    "/blog/articles/2019/02/27/refactoring-container-components-to-fetch-data-with-route-resolvers/",
]
---
```

I had to get a little into the new markdown structure and into how hugo handles files. I did the migration of the markdown files all manually which took a while, but for me it was the fastest way.

With `hugo server -D` a local webserver is started and you can access to complete page at `localhost:1313` in my case. This made it very easy to see the outcome, also because hugo is very very fast in reloading, which was one of the main reason for me to switch.

I had to migrate the `.toml` file a bit and do a little html here and css there. But even for a non designer like me this was totally managable. But I think this also depends on how far you want to go with your theme.

Compared to jekyll I think that hugo is a little hard to get in and has a steep learning courve which I haven't mastered completely yet. However, with some searching and trial-error I got where I wanted to and could build up my site.

I put everything up to github which you can find here: [https://github.com/FabianGosebrink/offering-solutions-html](https://github.com/FabianGosebrink/offering-solutions-html)

So at the end of that chapter my blog was totally fine running locally.

## Preparing Azure

As the overview is best in resource groups and the costs can be seen best per resourcegroup I created a complete new one in Azure. I added four things into it:

- A app service to host my site
- A storage account to act as cdn later
- Application insights (were added automatically)
- An App Service Plan (Which is needed anyway)

![Azure resourcegroup](https://cdn.offering.solutions/img/articles/2019-05-29/resourcegroup.png)

As these things were ready I wanted to next build up the CI/CD pipeline for the blog and homepage in Azure Devops.

## Preparing the cdn

In the CDN I did a new container called `$web` where I would upload all the files.

![cdn container](https://cdn.offering.solutions/img/articles/2019-05-29/cdn-container.png)

## Building a CI/CD pipeline for the blog

In Azure Devops which you can access via `https://dev.azure.com/<yourusername>/` I created a new CI/CD pipeline by clicking on the `Create new project` in the upper right corner and connected it to my existing github project.

For generating the site I used a build task which build my site running the needed hugo commands. You can find the extension here: [Visual Studio Marketplace Hugo extension](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension).

![CICD-1](https://cdn.offering.solutions/img/articles/2019-05-29/cicd-1.png)

So the source of my hugo site is the folder `homepage` and the destination is `homepage/public`. This is the folder all files are build to. I am overwriting the `BaseUrl` with the domain `https:/offering.solutions`. I would have to do this as in my `config.toml` file the `baseURL = "https://offering.solutions/"` is already set to the correct domain. It was more just to try it out a bit :)

As next step I had to divide the files which are going to be deployed to the cdn on azure and the files which are going to be deployed to the main domain web service on azure.

So in the next two steps the files form the public folder are separated.

![CICD-2](https://cdn.offering.solutions/img/articles/2019-05-29/cicd-2.png)

To the folder `homepage/public/dist-cdn` I am copying over all the static files like images, fonts, css and javascript.

![CICD-3](https://cdn.offering.solutions/img/articles/2019-05-29/cicd-3.png)

As in the `dist-blog` folder all the other files are getting copied.

To trigger a build everytime I check something into master branch I enable the "Continuous Integration" in the "Triggers" Tab at the checkbox "Enable Continuous Integration"

In the end I have to publish the two artifacts `blog` and `cdn` to make them available to my release manager where I pick them up and release them to Azure.

## Modifying the CI/CD pipeline to deploy to CDN and App Service

In the release manager I am referring to the dropped outputs now and moving the one to the cdn and the other to the azure web service.

![release manager first pic](https://cdn.offering.solutions/img/articles/2019-05-29/release-1.png)

![release manager second pic](https://cdn.offering.solutions/img/articles/2019-05-29/release-2.png)

With enabled Conitinuous Integration everytime I check in a new build and release is triggered. Perfect!

## Moving the domain to GoDaddy and adding cloudflare

To move my old domain to godaddy I canceled my subscription at one.com and they gave me a code I could use to move the domain. In GoDaddy I logged in and used this link [https://www.godaddy.com/domains/domain-transfer](https://www.godaddy.com/domains/domain-transfer) to transfer my domain.

After I did this I went to Cloudflare (see below) and signed in as well. I added my domain and controlled everything from there then. In GoDaddy I added the cloudflare nameservers like this:

![Godaddy nameservers](https://cdn.offering.solutions/img/articles/2019-05-29/godaddy.png)

## Adding the custom domain to the web service

So in Azure I added the custom domain names to the web service. I used the guid here [https://docs.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain](https://docs.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain).

I added the CDN custom domain like this:

![customdomain cdn](https://cdn.offering.solutions/img/articles/2019-05-29/customdomain-cdn.png)

And the custom domains for the app service like this. If you want to know how to exactly add them refer to the guide above.

> Do not be scared about the "Not Secure" in the picture. This means, that no SSL certificate has been added. We will serve our page with cloudflare and ssl in the end.

![customdomain-appservice](https://cdn.offering.solutions/img/articles/2019-05-29/customdomain-appservice.png)

Of course in Cloudflare I added these mappings then as we use the Cloudflare nameservers and not the ones from godaddy anymore.

![cloudflare-mappings](https://cdn.offering.solutions/img/articles/2019-05-29/cloudflare-mappings.png).

Notice that the `cdn.offeringsolutions` is pointing to my custom domain of the azure cdn blob storage and the `offering.solutions`, `www.offering.solutions` is pointing to the azure web service.

## Adding the CDN to Hugo

In hugo itself I had to pay attention to provide the correct domain of the cdn like this in the `config.toml` file.

```
# Site settings
baseURL = "https://offering.solutions/"

[params]
  cdnbaseurl = "https://cdn.offering.solutions/"

```

## Adding the correct Caching

So to serve as much as we can from the cache I went into Cloudflare and modified the caching up to 12 hours (which is not much, but read further)

![cloudflare-cache](https://cdn.offering.solutions/img/articles/2019-05-29/caching.png)

So the "Browser Cache Expiration" setting tells that it will fall back to the setting which is given in cliudflare but respect the caching headers if they are set. I wanted to try that out and was searching for a way to modify my cache headers on the cdn on azure because this is where all the static files are coming from.

With the help of Benjamin Abt I got a script which was doing exactly that for me with the Azure CLI.
