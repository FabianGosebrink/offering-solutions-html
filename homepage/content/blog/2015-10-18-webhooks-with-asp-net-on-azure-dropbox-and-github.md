---
title: WebHooks with ASP.NET on Azure - DropBox and GitHub
date: 2015-10-18
tags: ['aspnet', 'azure', 'webhooks']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  [
    '/blog/articles/2015/10/18/webhooks-with-asp-net-on-azure-dropbox-and-github/',
  ]
---

Hi,

in this post I want to show you how to use ASP.NET-WebHooks with an example of DropBox and Github. This app will be hostet on Windows-Azure and we'll be using Visual Studio 2015.

The code in this example will be available on [GitHub](https://github.com/FabianGosebrink/ASPNET-WebHooks).

You can find a great summary [here](http://blogs.msdn.com/b/webdev/archive/2015/09/04/introducing-microsoft-asp-net-webhooks-preview.aspx) and [here](http://www.hanselman.com/blog/IntroducingASPNETWebHooksReceiversWebHooksMadeEasy.aspx) of what WebHooks exactly are. In short: You can receive updates from Websites and catch them with your own staying always up to date and seeing what is happening to your subscribed websites like Instagram, DropBox, GitHub etc. (We will only cover [GitHub](https://github.com/)and [DropBox](https://www.dropbox.com/) here)

WebHooks on GitHub: [Gogogo!](https://github.com/aspnet/WebHooks)

> You really should take a look at this repository. Its providing you a nice overview of which services are supported out-of-the-box. That is making the stuff nice and easy.

First of all we take the current stable Version of WebAPI 2.2 and create a new project.

After this you can either install the Nuget-Packages for DropBox and GitHub support seperately ([here](https://www.nuget.org/packages/Microsoft.AspNet.WebHooks.Receivers.Dropbox/1.2.0-beta3a) and [here](https://www.nuget.org/packages/Microsoft.AspNet.WebHooks.Receivers.GitHub/1.2.0-beta3a)), or you can install the extension for Visual Studio which can be found here. (Tools --> Extensions and Updates):

![WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/11.jpg)

once installed you will be able to add new services like this:

![WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/21.jpg)
![WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/32.jpg)

But before we do so, lets prepare GitHub and DropBox to send events when something is happening.

How Github is prepared you can see on the posted link above. But once again: [here](http://blogs.msdn.com/b/webdev/archive/2015/09/04/introducing-microsoft-asp-net-webhooks-preview.aspx)

### Prepare DropBox for WebHooks:

First check this link: [Apps for DropBox ](https://www.dropbox.com/developers/apps)and create a new app which is responsible for invoking the WebHooks.

![WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/42.jpg) I chose the whole DropBox-thing for this example.

After creating this new app we are interested in the details of this app. Click on it and you will ssee something like this:

![WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/5.jpg)

We are interested in the secret for your app and in the link we define for the target of our WebHooks.

> I will take the placeholder "_[MyDropBoxAppKey]_" as the key for this blog post. You will have to replace this with your own secret yu get when you click on "show" above.

Once we have the secret we can go back to our Visual Studio and select the both WebHook receivers we want to create: GitHub and DropBox.

![WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/6.jpg)

Add your secrets here and click finish:

![WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/7.jpg)

If everything worked fine the extension created everything for you: The handlers, the startup cofnig which can be in addition to your existing config and it updated the Web.config-file with your settings.

![WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/8.jpg)

```csharp
namespace WebHooksExample
{
    public static class WebHookConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.InitializeReceiveGitHubWebHooks();
            config.InitializeReceiveDropboxWebHooks();
        }
    }
}
```

Be sure to call this register method from your app start. In this case I use Owin-Startup class. In your case this can be global.asax etc.

```html
<configuration>
  <appSettings>
    <add key="MS_WebHookReceiverSecret_GitHub" value="[MyGitHubKey]" />
    <add key="MS_WebHookReceiverSecret_Dropbox" value="[MyDropBoxAppKey]" />
  </appSettings>
  ...
</configuration>
```

The handlers itself are self explaining. Note that you are only deriving a class from the the WebHookHandler-Class. You have to decide in the class itself whether this call is the one you want or not.

```csharp
public class DropboxWebHookHandler : WebHookHandler
    {
        public override Task ExecuteAsync(string receiver, WebHookHandlerContext context)
        {
            // make sure we're only processing the intended type of hook
            if("Dropbox".Equals(receiver, System.StringComparison.CurrentCultureIgnoreCase))
            {
                // todo: replace this placeholder functionality with your own code
                string action = context.Actions.First();
                JObject incoming = context.GetDataOrDefault<JObject>();
            }

            return Task.FromResult(true);
        }
    }
```

Once you have done this your app is ready for deploying it to Azure. Deploy it (Right-clikc your project in Visual Studio and deploy) and check the values in the application settings using portal.azure.com:

[WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/9.jpg)

There your two secrets should appear now. If not: Get them in there manually. The keys are
`MS_WebHookReceiverSecret_GitHub`
and
`MS_WebHookReceiverSecret_Dropbox`

Now your app is ready to receive WebHooks. But how do we connect DropBox to fire againt our application? Well, the github case mentioned in the [link above](http://blogs.msdn.com/b/webdev/archive/2015/09/04/introducing-microsoft-asp-net-webhooks-preview.aspx) is valid for dropbox, too! So lets enter the page in the dropbox-app we have been creating a few minutes before:

`https://[host]/api/webhooks/incoming/[receiver]`

is the form. So in our case this is:

`https://[host]/api/webhooks/incoming/dropbox`

![WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/10.jpg)

After a short check this should be working and get the state "Enabled" from DropBox.

If you now change something in your entire dropbox-space the webhook should be triggered like this:

![WebHooks with ASP.NET on Azure - DropBox and GitHub](https://cdn.offering.solutions/img/articles/wp-content/uploads/2015/10/111.jpg)

If you only want to watch a specific part of your dropbox you have to spcify this in your app. Above we selected "Full Dropbox".

In the WebHookHandler itself you can now do what you want with the POST-request from dropbox. Sending an Email, notify your apge with SignalR etc. Same applies for github. Any change should trigger a webhook and you can work with in on your website in a way you want to.

I hope this helps anybody and happy coding.

Fabian
