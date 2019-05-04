---
title: Moving to hugo on azure with cloudflare
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

* Find a solution which hosts my website _and_ my blog for one look and feel.
* migrating my blog from jekyll to hugo, so using hugo for all of it: website and blog.
* moving the domain from one.com to godaddy and host it on azure instead of one.com
* adding a CI/CD pipeline in Azure DevOps to continually build and deploy my hugo site
* using cloudflare as a DNS to improve caching and speed and reduce costs for the azure web service
* costs should be managable. 

And the time I had was one weekend...so lets go :-) I will mention the steps I did one by one.

## Finding a theme

That was one of the hardest parts to be honest. I wanted a clean (for me) nice looking theme which was covering the basic information and was able to display a list of blogs including a simple single page for one single blogpost. I thought [forty](https://themes.gohugo.io/forty/) would fit very well. So I went for that one.

## Installing Hugo and adapting the theme

Hugo can be installed very quickly. Find the instructions [here](https://gohugo.io/getting-started/installing/). I used Chocolatey to install it and getting it up and running was really easy.

I tweaked the theme a bit, added all my picutres, adapted colors (mostly with google chromes dev tools) and overwrote the css etc. So web developer things which we a re doing :) At some point "my" design was looking good so I could start adapting all my content.

## Moving from jekyll to hugo

Here is the thing: This was the most unspectacular thing in the whole process of migration from A to B. I just copied over the *.md files and had to modify the markdown metainformation in the header. Which was also because I did not want to use the old design but introduced a completely new one.

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

I had to get a little into the new markdown structure 