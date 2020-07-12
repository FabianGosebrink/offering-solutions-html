---
title: Using the Device Orientation API with ASP.NET Core SignalR
date: 2019-07-25
tags: ['aspnetcore', 'signalr', 'javascript']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blogpost I want to describe how I used plain Javascript and ASP.NET Core SignalR to broadcast the device orientation values over HTTP.

![device-orientation-video](/img/articles/2019-07-25/video.gif)

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

In the `Configure` method I added MVC to the pipeline as well as using the CORS policy. The important part is the mapping of the Hub `MotionHub` to the url `/motion`

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

The Hub is pretty easy as it only provides one method which can be called from the outside which broadcasts the new motion data:

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

This time for me it was important not to use any framework - except SignalR - but instead rely on the plain device motion API from HTML and working with it in plain Javascript.

I installed the SignalR library from npm [https://www.npmjs.com/package/@aspnet/signalr](https://www.npmjs.com/package/@aspnet/signalr) with

```
npm install @aspnet/signalr
```

So the first thing was to check if the browser supports the device motion or not.

```js
if ('DeviceOrientationEvent' in window) {
  window.addEventListener('deviceorientation', deviceOrientationHandler, false);
  // establishing SignalR Connection
} else {
  document.getElementById('logoContainer').innerText =
    'Device Orientation API not supported.';
}
```

The method `deviceOrientationHandler` is getting passed the eventData coming from the device orientation and is updating the text on the HTML which we will see later, but is also invoking the SignalR method if the connection exists.

```js
function deviceOrientationHandler(eventData) {
  var gamma = eventData.gamma;
  var beta = eventData.beta;
  var alpha = eventData.alpha;

  if (signalrConnectionExists()) {
    signalRConnection
      .invoke('MySuperDuperAction', { alpha, beta, gamma })
      .catch((err) => console.error(err.toString()));
  }

  setTextOnElement('gamma', Math.round(gamma));
  setTextOnElement('beta', Math.round(beta));
  setTextOnElement('alpha', Math.round(alpha));
}
```

Let us check the SignalR connection next.

So in beside adding the orientationhandler I also added and called a method to establish the SignalR connection.

```js
var signalRConnection = null;

if ('DeviceOrientationEvent' in window) {
  window.addEventListener('deviceorientation', deviceOrientationHandler, false);
  establishSignalR();
} else {
  document.getElementById('logoContainer').innerText =
    'Device Orientation API not supported.';
}

// ...

function establishSignalR() {
  signalRConnection = createSignalConnection(
    'https://motiondevice.azurewebsites.net/motion'
  );

  signalRConnection.on('motionUpdated', (data) => {
    console.log(data);

    if (!freezeMyself) {
      turnLogo(data.beta, data.gamma);
    }
  });

  signalRConnection.start().then(function () {
    console.log('connected');
    console.log(signalRConnection.state);
  });
}

function turnLogo(beta, gamma) {
  var logo = document.getElementById(logoId);
  logo.style.webkitTransform =
    'rotate(' + gamma + 'deg) rotate3d(1,0,0, ' + beta * -1 + 'deg)';
  logo.style.MozTransform = 'rotate(' + gamma + 'deg)';
  logo.style.transform =
    'rotate(' + gamma + 'deg) rotate3d(1,0,0, ' + beta * -1 + 'deg)';
}
```

So here first I am registering on the event `motionupdated` this time. In the callback method I call the `turnLogo` method which will just apply the `beta` and `gamma` properties to the logo.

After this I am starting the connection and listen for the events.

So everytime an event is read from the device API the handler is getting called and is invoking the SignalR action if the connection exists.

The only thing that is missing now is the `index.html` part. This is perhaps the most unspectacular part as we just have an `<img>` with the logo and including the `signalr.js` file and the `motion.js` which covers all the logic.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    //...
  </head>
  <body>
    <table>
      <tr>
        <td>gamma</td>
        <td id="gamma"></td>
      </tr>
      <tr>
        <td>beta</td>
        <td id="beta"></td>
      </tr>
      <tr>
        <td>alpha</td>
        <td id="alpha"></td>
      </tr>
    </table>

    <div>
      Hold me steady:
      <input type="checkbox" id="freeze" onclick="toggleFreeze()" />

      <p id="text" style="display:none">You are freezed</p>
    </div>

    <div>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/480px-Unofficial_JavaScript_logo_2.svg.png"
        id="imgLogo"
        alt="javascriptLogo"
      />
    </div>

    <script src="signalr.js"></script>
    <script src="motion.js"></script>
  </body>
</html>
```

I also installed a lightweight webserver to make this all hosting. If you upload that and access it with your mobile phone you can move the picture with your hpone just like that :)

![device-orientation-video](/img/articles/2019-07-25/video.gif)
