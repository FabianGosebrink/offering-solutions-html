---
title: How to start with home automation for absolute beginners
date: 2020-11-30
tags: ['homeassistant']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to write how I started with home automation. Really starting from zero as I had no clue from home automation and only heard about it from colleagues. The only think I knew was a Raspberry Pi because I was using it already as a Pi-Hole in my home. Other than that I had no clue about home automation. In the end I am sure that there is loads more to do and a lot of things to improve but lets go with what I have so far.

## The start

I live in a flat where I have a bathroom which has no window itself and a vent fan installed which sucks moist air out of the room during and after a shower before it causes damage or mold. The ventilator is combined with the light so when the light is on a few seconds later the ventilator starts and when I turn the light off the ventilator runs for a bit and turns off then as well.

However, we have to leave the ventilator on until the air is dry as we think it is dry and then turn it off. Which was not a situation for because I had no measurement how much humidity and temperature we have in the bathroom. So this was the starting point.

I went with something like this in the first place

[Hygrometer on Amazon](https://www.amazon.com/ORIA-Humidity-Thermometer-Temperature-Hygrometer/dp/B07KSTN3PF/ref=sr_1_21)

but yet I had to turn off the ventilator/light manually. The first idea - and so the entrance to the iot rabbit hole - was this.

I read a lot about [Home Assistant](https://www.home-assistant.io/) but had absolutely no clue how to use it and what to do with it, how to connect the things I did not yet have. I thought it was an operating system like thing to flash on a card with a UI and I could basically use it to automatic the things in my home. I was half-wrong, but we will clarify this later on. How would things communicate with each other? And when x happens I want y to happen? No idea. I just started. But the goal was to turn off the light and the ventilator automatically when the humidity in the rooms was decreasing to a certain level.

## What I already had

I already had a robot vacuum cleaner which is cleaning my flat not regularly with a schedule but when I leave the house I can tell him over an app that I want him to run through the flat and clean it. So that was nice. [Roborock S6](https://www.digitec.ch/de/s1/product/roborock-s6-roboterstaubsauger-10731138) The robot does not directly has something to do with the home automation, however it is part of it.

I also had an existing Raspberry Pi but I bought a new one for this, we will cover this in the next section.

And this was it.

## What I bought

I was starting with getting a new Raspberry Pi with a touch screen because my Pi-Hole was already running on such a combination and I thought that I could flash the [Home Assistant](https://www.home-assistant.io/) on a SD Card, ramp up the system and control it over the touchscreen.

Then I bought a humidity sensor to get the humidity in my bathroom and I needed something to control the light or to turn it on and off, so I bought a Shelly. All in all I started with this.

- https://shelly.cloud/products/shelly-1-smart-home-automation-relay/
- https://www.amazon.com/Aqara-WSDCGQ11LM-Temperature-Humidity-Sensor/dp/B07D37FKGY
- https://www.amazon.com/Raspberry-Model-2019-Quad-Bluetooth/dp/B07TC2BK1X/ref=pd_sbs_147_1/138-0884345-6996938
- https://www.amazon.com/Raspberry-Pi-7-Touchscreen-Display/dp/B0153R2A9I

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Preparing to work with <a href="https://twitter.com/home_assistant?ref_src=twsrc%5Etfw">@home_assistant</a> <a href="https://twitter.com/hashtag/lookingforward?src=hash&amp;ref_src=twsrc%5Etfw">#lookingforward</a> 😍👍 <a href="https://t.co/zuPW6RGSzO">pic.twitter.com/zuPW6RGSzO</a></p>&mdash; Fabian Gosebrink @ 🏠🇨🇭 (@FabianGosebrink) <a href="https://twitter.com/FabianGosebrink/status/1287416630247673856?ref_src=twsrc%5Etfw">July 26, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## What I learned so far about...

### ... the Home Assistant

So I started with downloading the Home Assistant and assembling the Raspberry and the touchscreen. <blockquote class="twitter-tweet"><p lang="en" dir="ltr">Back home!!! <a href="https://t.co/YQxnf61zdb">pic.twitter.com/YQxnf61zdb</a></p>&mdash; Fabian Gosebrink @ 🏠🇨🇭 (@FabianGosebrink) <a href="https://twitter.com/FabianGosebrink/status/1288848695925055488?ref_src=twsrc%5Etfw">July 30, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Then I flashed the Home Assistant on the SD Card and just saw...nothing. No Ui. I said I was "half-wrong" with that I could flash it and use it on the new Raspberry Pi. What I did NOT know until now was that the Home Assistant is firing up a web server which you can access then via browser! I did not know that before! So I did not need the touchscreen for the home assistant. I could access it from the first Raspberry with the Pi-Hole on it which also has a touchscreen installed, because I just had to open a second browser tab to access the webserver running on the new bought new flashed Raspberry. I put the new Raspberry in a case (which I had as leftover from other projects) and now the raspberry _without_ any screen in my shelve.

What I could have done is running the Home Assistant on my first Raspberry (with the Pi-Hole in parallel) in a docker container. Then I would not have needed any of the Raspberry OR the touchscreen. However, I have it running on two separate Raspberries now.

[Bild Touchscreen]
[Bild Raspberry case]

Alright...I have a touchscreen left over now for future projects. All good 😀

So now the Home Assistant was running...and I learned a lot until here!

Takeaways:

- Home Assistant can be run in a docker container on an existing Raspberry Pi
- Flashed on a card it is a web server which can be accessed from a browser at any device in your network

### ... the humidity sensor

I took a look at the humidity sensor. The company was "Aqara" but the Design was looking familiar...and then I realized that I could add this sensor to the app I was controlling my vacuum cleaner with! Aqara is like a sub company from Roborock controlled with the [Mi Home App](https://play.google.com/store/apps/details?id=com.xiaomi.smarthome&hl=en&gl=US) app. Alright! Nice.

But my app was not able to find the sensor, no matter what I tried. I felt that I was missing something. So I read a little and found out that you have to have a Hub for this to work. So the Roborock was able to be connected with the app without a hub but for the humidity sensor you have to have a hub which is then added to the app which then connects the app and the sensor. Okay...So I bought a Aqara Hub as well.

[Aqara Hub](https://www.aqara.com/us/smart_home_hub.html)

Having done that I added this one to the [Mi Home App](https://play.google.com/store/apps/details?id=com.xiaomi.smarthome&hl=en&gl=US)

I added the Aqara Hub and added the Humidity sensor as well.

[Bild Mi Home App]

Nice that was working. But now I had to solve how the Shelly could control the light and talk to the humidity sensor and vice versa.

Takeaways:

- The humidity sensor alone is worth nothing, you need a hub.
- The Aqara app and devices work with the same app which is used to control the Roborock S6 vacuum cleaner although the vacuum cleaner does not need a hub.

### ...Shelly

The [Shelly](https://shelly.cloud/products/shelly-1-smart-home-automation-relay/) is basically "only" a relay which can be controlled wireless, has an own rest endpoint and runs in your WiFi. So it is like a device in your wifi with an IP, a UI, you can configure it and control it over the [Shelly App](https://play.google.com/store/apps/details?id=allterco.bg.shelly).

Alright then, sounds nice. So I was installing it, wiring it up and installed the app on my phone. And there it really was! The app found the shelly.

But how to add it to my network when you have a MAC filter? I needed the MAC from the shelly BEFORE adding it to my network. What I did was: Switching off the MAC filter, adding the device, then switching on the MAC filter again. What I did not know is that the name of the mac includes the MAC address!

(In the meantime I have A LOT of shellies working and this info saved me a lot of time).

So once added in the app I could control the light with the Shelly App. That was working.

Takeaways:

- The MAC address of the shelly is in the shelly name when you add it
- You need the app to add it to your network
- You can control/configure the shelly from every browser in your network, it has a web interface and an IP to access the UI

## Connecting the parts

Now every part for itself was working

- I was
