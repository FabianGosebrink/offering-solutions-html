---
id: 92
title: Deleting a Team Project on Visual Studio Team Services
date: 2014-04-14T06:37:53+00:00
author: Fabian Gosebrink
layout: post
tags: tfs visualstudio
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

In this bogpost I want to show you one possibility of deleting a Team Project on Visual Studio Team Services.

I just stumbled over the case that I wanted to delete an old project in my online TFS to keep it clean and up to date. As I noticed that it is not as easy as it sounds I thought about mentioning it here. So here is the walkthrough:

First log into your VSTS account by typing something like in the browser and entering your username and password.

<pre class="">http://[yourusername].visualstudio.com</pre>

Then navigate to your normal administration site on the upper right corner by selection the rack-wheel.

![Deleting a Team Project on Visual Studio Team Services]({{site.baseurl}}assets/articles/2014-04-14/86d30c51-7e99-4f27-b8b9-95dc01d70f34.png)

Then normally you would go to the team administration page and try to delete it:

![Deleting a Team Project on Visual Studio Team Services]({{site.baseurl}}assets/articles/2014-04-14/617af661-7546-4198-8760-396d4faff02b.png)

![Deleting a Team Project on Visual Studio Team Services]({{site.baseurl}}assets/articles/2014-04-14/874048f6-0be0-4d2b-b032-02aa182f5f57.png)

But as you see: Even if you are an adminsitrator of the project it is grayed out.

<h4>So here is the solution</h4>

If you navigate to your accounts administration page, do NOT go into a projects-administration site. Choose the collection-administrative site instead!

![Deleting a Team Project on Visual Studio Team Services]({{site.baseurl}}assets/articles/2014-04-14/97e130d0-5477-4745-a409-cd53bc3e8c1a.png)

There you can easily delete your project:

![Deleting a Team Project on Visual Studio Team Services]({{site.baseurl}}assets/articles/2014-04-14/ed78b714-3ef0-400a-8f41-b253cfd3f925.png)

I think it is not that easy to delete an existing team project. But to keep the VSTS clean and in good order this might be a useful hint to someone.

Hope it helps.

Regards.
