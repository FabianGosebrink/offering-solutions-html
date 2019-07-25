---
title: Sending Device Orientation Over ASP.NET Core SignalR
date: 2019-07-22
tags: ['aspnetcore', 'signalr', 'javascript']
draft: true
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blogpost I want to describe how I used plain Javascript and ASP.NET Core SignalR to broadcast the device orientation values over HTTP.

![device-orientation-video](https://github.com/FabianGosebrink/device-orientation-signalr/blob/master/.github/video.gif)

You canf ind the whole code on gihub here: [https://github.com/FabianGosebrink/device-orientation-signalr
](https://github.com/FabianGosebrink/device-orientation-signalr)

## Backend with ASP.NET Core and SignalR

For this demo I just created a small backend with the dotnet cli and

```
dotnet new webapi
```

to scaffold the basic files.

In the `ConfigureServices` method I added MVC and also configured CORS with the appropriate origins as well as added SignalR with `services.AddSignalR()`.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

    services.AddCors(options => options.AddPolicy("CorsPolicy",
            builder =>
            {
                builder.WithOrigins("http://localhost:3000", "https://motiondevice.azurewebsites.net")
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
            }));
    services.AddSignalR();
}`
```

In the `Configure` method I added MVC to the pipeline as wel as using the CORS policy. The important part is the mapping of the Hub `MotionHub` to the url `/motion` 

```csharp
app.UseSignalR(routes =>
{
    routes.MapHub<MotionHub>("/motion");
});
```

which the client will send values to later on.

```csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }
    else
    {
        app.UseHsts();
    }

    app.UseCors("CorsPolicy");
    app.UseHttpsRedirection();

    app.UseDefaultFiles();
    app.UseStaticFiles();

    app.UseSignalR(routes =>
    {
        routes.MapHub<MotionHub>("/motion");
    });

    app.UseMvcWithDefaultRoute();
}
```

### Implementing the SignalR Hub

The Hub is pretty easy as it only provides one method which can be calles from the outside which broadcasts the new motion data:

```csharp
public class MotionHub : Hub
{
    public async Task MySuperDuperAction(MotionDto data)
    {
        await Clients.All.SendAsync("motionUpdated", data);
    }
}
```

The `MotionDto` just reflects the data we will get from the client to make them easier to handle.

```csharp
public class MotionDto
{
    public long Alpha { get; set; }
    public long Beta { get; set; }
    public long Gamma { get; set; }
}
```

## The frontend in pure javascript

This time for me it was important not to use any framework - except signalr - but instead rely on the plain device motion API from HTML and working with it in plain Javascript. 