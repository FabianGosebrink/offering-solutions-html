---
title: How I started with Home Automation
date: 2020-11-30
tags: ['homeassistant']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to write about how I started with home automation. Really starting from zero as I had no clue from home automation and only heard about it from colleagues and friends. The only thing I knew already was a Raspberry Pi because I was using it already as a [Pi-Hole](https://pi-hole.net/) in my home. Other than that I had no clue about home automation. In the end I am sure that there is loads more to do and a lot of things to improve but lets go with my journey to it, what I have built up so far and how I got there.

You will have some good laughs because of my stupidity and lack of experience. But this was literally my story on how I got into this...with a lot of mistakes and lessons learned. They are all in here.

> You will see a lot of links to devices and hardware I bought. I do NOT get any money if you click on this. So this is not an promotional event.

## The start

I live in a flat where I have a bathroom which has no window itself and a vent fan installed which gets the moist air out of the room during and after a shower before it causes damage or mold. The ventilator is combined with the light switch in the bathroom. So when the light is on a few seconds later the ventilator starts and when I turn the light off the ventilator runs for a bit and turns off then as well.

However, we have to leave the ventilator/light on until the air is as dry as we want it to (guessing the humidity) and then turn it off manually. Which was not a situation for because I had no measurement how much humidity and temperature we have in the bathroom. Switching the light off would cause the ventilator to run a bit, but that was not enough for me. So this was the starting point. I wanted to measure the temperature and humidity to see when to switch off the light/ventilator.

I went with something like this in the first place

[Hygrometer on Amazon](https://www.amazon.com/ORIA-Humidity-Thermometer-Temperature-Hygrometer/dp/B07KSTN3PF/ref=sr_1_21)

but yet I had to turn off the ventilator/light manually. The first idea - and so the entrance to iot - was this: Controlling the light automatically when temperature and humidity changes.

I read a lot about [Home Assistant](https://www.home-assistant.io/) but had absolutely no clue how to use it and what to do with it, how to connect the things I did not yet have and how all that stuff worked. I thought it was an operating system like thing to flash on a card with a UI and I could use it to automatic the things in my home. I was half-wrong but we will clarify this later on. How would things communicate with each other? And how could I tell what system that when x happens I want y to happen? No idea. I started. But the goal was to turn off the light and the ventilator automatically when the humidity in the rooms was decreasing to a certain level.

## What I already had

I already had a robot vacuum cleaner which is cleaning my flat not regularly with a schedule but when I leave the house I can tell it over an app that I want it to run through the flat and clean it. So that was nice. [Roborock S6](https://www.digitec.ch/de/s1/product/roborock-s6-roboterstaubsauger-10731138) was controller over the [Mi Home App](https://play.google.com/store/apps/details?id=com.xiaomi.smarthome&hl=en&gl=US) I had already installed. The robot does not directly has something to do with the home automation, however it is part of it.

I also had an existing Raspberry Pi with a touch screen running for my Pi-Hole but I bought a new one for the home automation. We will cover this in the next section.

And this was it. That was all I had.

## What I bought

I was starting with getting a new Raspberry Pi with a touch screen because my Pi-Hole was already running on such a combination and I thought that I could flash the [Home Assistant](https://www.home-assistant.io/) on a SD Card, ramp up the system and control it over the touchscreen _on that new Raspberry Pi_.

Then I bought a humidity sensor to get the humidity in my bathroom and I needed something to control the light or to turn it on and off, so I bought a Shelly. All in all I started with this.

- [Shelly Cloud - Shelly 1](https://shelly.cloud/products/shelly-1-smart-home-automation-relay/)
- [Amazon Aqara Temperature & Humidity Sensor](https://www.amazon.com/Aqara-WSDCGQ11LM-Temperature-Humidity-Sensor/dp/B07D37FKGY)
- [Amazon Raspberry Pi](https://www.amazon.com/Raspberry-Model-2019-Quad-Bluetooth/dp/B07TC2BK1X/ref=pd_sbs_147_1/138-0884345-6996938)
- [Amazon Raspberry Pi Touchscreen](https://www.amazon.com/Raspberry-Pi-7-Touchscreen-Display/dp/B0153R2A9I)

![Tweet 1](https://cdn.offering.solutions/img/articles/2020-11-30/tweet1.png)

[https://twitter.com/FabianGosebrink/status/1287416630247673856](https://twitter.com/FabianGosebrink/status/1287416630247673856)

![Humidity Sensor in Shower](https://cdn.offering.solutions/img/articles/2020-11-30/IMG_20201129_173137.jpg)

## What I learned so far about...

### ... the Home Assistant

So I started with downloading the [Home Assistant](https://www.home-assistant.io/getting-started/) and assembling the Raspberry and the touchscreen.

![Tweet 2](https://cdn.offering.solutions/img/articles/2020-11-30/tweet2.png)

[https://twitter.com/FabianGosebrink/status/1288848695925055488](https://twitter.com/FabianGosebrink/status/1288848695925055488)

Then I flashed the Home Assistant on the SD Card and saw...nothing. No Ui. A console which was periodically printing out values. I said I was "half-wrong" and here is why: I could flash the Home Assistant and install it on the new Raspberry Pi. What I did NOT know until now was that the Home Assistant is starting up a web server which you can access then via browser! I did not know that before! (And yes if you read the instructions on the homepage of Home Assistant carefully there is `On another computer, navigate to http://homeassistant.local:8123 to access Home Assistant.`. ON ANOTHER COMPUTER!!!! I did not read. My bad.) So I did not need the touchscreen for the home assistant on this Raspberry Pi. I could access it from the first Raspberry with the Pi-Hole on it which already had a touchscreen installed, because I had to open a second browser tab to access the webserver running on the new bought new flashed Raspberry on `http://homeassistant.local:8123`. So I let go off the Touchscreen and the case behind the touchscreen and put the new Raspberry in a case (which I had as leftover from other projects) and now the Raspberry _without_ any screen in my shelve.

What I could have done is running the Home Assistant on my first Raspberry (with the Pi-Hole in parallel) in a docker container. Then I would not have needed any of the new Raspberry OR the touchscreen. However, I have it running on two separate Raspberries now. My bad.

This is the Raspberry Pi where I have the Browser UI for the Pi-Hole and the Home Assistant always open. Pi-Hole is running on that Raspberry, the Home Assistant itself runs on a separate Raspberry Pi shown in the picture below.
![Raspberry pi with touchscreen and two tabs one with Home Assistant and one with the Pi Hole](https://cdn.offering.solutions/img/articles/2020-11-30/IMG_20201129_172738.jpg)

And this is the Pi the Home Assistant is always running on
![Case of a Raspberry Pi](https://cdn.offering.solutions/img/articles/2020-11-30/IMG_20201129_172750.jpg)

Alright...I have a touchscreen left over now for future projects. All good 😀

So now the Home Assistant was running...and I learned a lot until here!

Takeaways:

- Home Assistant can be run in a docker container on an existing Raspberry Pi
- Flashed on a card it is a web server which can be accessed from a browser at any device in your network
- Read. Read the docs.

### ... the humidity sensor

Next thing was the humidity sensor. The company was "Aqara" but the Design was looking familiar...and then I realized that I could add this sensor to the app I was controlling my vacuum cleaner with! Aqara is like a sub company from Roborock and I could control/read the values with the [Mi Home App](https://play.google.com/store/apps/details?id=com.xiaomi.smarthome&hl=en&gl=US) app. Alright! Nice.

But my app was not able to find the sensor, no matter what I tried. I felt that I was missing something. So I read a little and found out that you have to have a hub for this to work. So the Roborock was able to be connected with the app without a hub but for the humidity sensor you have to have a hub which is then added to the app which then connects the app and the sensor. Okay...So I bought a Aqara Hub as well.

[Aqara Hub](https://www.aqara.com/us/smart_home_hub.html)

Having done that I added this one to the [Mi Home App](https://play.google.com/store/apps/details?id=com.xiaomi.smarthome&hl=en&gl=US)

I added the Aqara Hub and added the Humidity sensor as well.

Nice that was working. But now I had to solve how the Shelly could control the light and talk to the humidity sensor and vice versa.

Takeaways:

- The humidity sensor alone is worth nothing, you need a hub.
- If they offer you a Combo (!!!) with a hub AND a starting device...maybe... maybe consider reading what the hub is for!
- The Aqara app and devices work with the same app which is used to control the Roborock S6 vacuum cleaner although the vacuum cleaner does not need a hub.

### ...Shelly

The [Shelly](https://shelly.cloud/products/shelly-1-smart-home-automation-relay/) is a relay which can be controlled wireless, has an own web server, a rest endpoint and runs in your WiFi. So it is like a device in your WiFi with an IP, a UI, you can configure it and control it over the [Shelly App](https://play.google.com/store/apps/details?id=allterco.bg.shelly).

Alright then, sounds nice. So I was installing it in my socket, wiring it up and installed the [Shelly App](https://play.google.com/store/apps/details?id=allterco.bg.shelly&hl=en&gl=US) on my phone. And there it really was! The app found the Shelly.

But how to add it to my network when you have a MAC filter? I needed the MAC from the shelly BEFORE adding it to my network. What I did was: Switching off the MAC filter in my router, adding the Shelly over the Shelly App, then switching on the MAC filter again. What I did not know is that the name of the Shelly shown to you by the app includes the MAC address! So the name of the shelly is something like `Shelly-12AB34CD...` you get the idea.

(In the meantime I have A LOT of Shellies working and this info saved me a lot of time).

So once added in the app I could control the light with the Shelly App. That was working.

Takeaways:

- The MAC address of the shelly is in the shelly name when you add it. It is visible in the app
- You need the app to add it to your network
- You can control/configure the shelly from every browser in your network, it has a web interface and an IP to access the UI

## Connecting the parts

Now every part for itself was working: I could see the temperature and humidity in the Mi Home App, I could switch the light on and off over the shelly with the shelly app and the home assistant was up and running on my Raspberry Pi and I could access the ui via a browser. Great. But the connection...how could I bring the parts together?

The answer is that the Home Assistant has ["integrations"](https://www.home-assistant.io/integrations/) where you can add different systems into the Home Assistant system. Hue lights. your FritzBox, if you have one. Your Samsung Printer. The Pi-Hole. The weather. Home Assistant has nearly endless integrations for all the different systems you can image. And also the Shellies. And the Aqara Hub! And there was the connection!

So once configured and added the [integration for the Shelly](https://www.home-assistant.io/integrations/shelly/) found all my shellies! That is good.

Then I added the [Mi Home Aqara Integration](https://www.home-assistant.io/integrations/xiaomi_aqara/).

![Home Assistant integrations](https://cdn.offering.solutions/img/articles/2020-11-30/integrations-home-assistant.png)

And suddenly the devices were found and added! And inside those `devices` the Home Assistant shows `entities`. And those entities are providing the functionalities you search for for this device. So for example my Aqara Humidity and Temperature Sensor device (!) has the entities(!) for `humidity` and one for `temperature`.

![Home Assistant device and entities](https://cdn.offering.solutions/img/articles/2020-11-30/home-assistant-device.png)

In the `automation` part in the Home Assistant you can now use those devices/entities and create rules which are for example:

"Look at the humidity from the sensor and turn off the light with the shelly in the bathroom when the humidity of the sensor is below 60%"
"Look at the humidity from the sensor and turn on the light with the shelly in the bathroom when the humidity of the sensor is over 60%"

I reached my goal!...For now...

> If you have added for example the printer and if provides the entity of a cartridge being empty you can like flash a light when xyz is empty, it ran out of paper etc. With the Home Assistant you can connect everything with everything. But there has to be an [integration](https://www.home-assistant.io/integrations/).

Takeaways:

- `Devices` are mostly the physical devices you install in your home
- `Entities` are the functionalities this device has!
- `Integrations` are the glue between your physical devices and the Home Assistant
- There are a lot of integrations
- Read. Read the docs.

## Be aware! - The Problems

As good as this sounds: It leads to problems. So my light was turning on and off now when the humidity changed, all good.

One day I was in the bathroom, stepping out of the shower and after some time the light turned off. Which was completely okay because the humidity level was decreasing because the ventilator was running and told my Shelly over theHome Assistant system to switch off the light. But it was not okay because I was standing in the dark!

I had to extend the rule:

"Look at the humidity from the sensor and turn off the light with the shelly in the bathroom when the humidity of the sensor is below 60%"

was new

"Look at the humidity from the sensor and turn off the light with the shelly in the bathroom when the humidity of the sensor is below 60% AND THERE IS NO MOTION DETECTED"

So what do to? how to detect motion? You buy a motion detector [Aqara motion detector](https://www.aqara.com/us/motion_sensor.html). You add it like the previous items and extend your automation with "Turn of the light when humidity is below 60% AND there is no motion detected". Problem solved 😊 I had this moment a few times that when I added a rule I was forgetting about some situations. Like "Only turn on the lights at evening _when somebody is at home_" and stuff. This and seeing all the possibilities is how you sloooowly get into the rabbit hole of home automation.

![Motion Sensor 1](https://cdn.offering.solutions/img/articles/2020-11-30/IMG_20201129_140444.jpg)

![Motion Sensor 2](https://cdn.offering.solutions/img/articles/2020-11-30/IMG_20201129_140510.jpg)

## Current situation

The current situation is that it took a long way to get there but I am very satisfied with my setup. I have 7 Shellies in my flat, 9 motion detectors or humidity and temperature sensors, 5 Hue lights a pi hole and so on. I could do a lot more, maybe over the winter time now when you are more at home. I am at a stand where I have to tweak something from time to time but all in all it works pretty well. The releases of the Home Assistant and Shellies are coming very often and you have to update everything from time to time. But this works pretty well over the provided UIs.

Some of my actions currently are:

- My lights turn on when I get home or am home and the sun is set
- My lights turn on in the morning when I get up and the sun is still down
  - but only the small one in the hallway, the big one are too bright
- The fan in the hallway gets on and off based on the humidity completely self controlled
- Me and my significant other get notifications when one of us gets home
- I can control all lights with my app
- When I open the window in the morning in my bedroom I get a notification if the temperature drops under 15 degrees Celsius as a reminder to close it
- When I say "Alexa, clean the flat" my robot starts cleaning
- My lights turn on when I want to go to the bathroom at night
- All lights turned on automatically also turn off when no motion is detected
- So much more

It is so much fun! When you see the possibilities you can do. Maybe a pressure sensor underneath my bed or chair to check if I am in bed or in the office or something? Having a open/close detector on my windows to tell me if a window is open when I leave the apartment? Aqara and all the other sensors out there provide incredible functionality. But I will take it step by step.

I am using several apps which I need to control all the things.

![All smart home apps](https://cdn.offering.solutions/img/articles/2020-11-30/Screenshot_20201129-140357.jpg)

1. "Shelly" to add, and control all the Shelly devices. (I only need them for adding the Shellies, controlling is over Home Assistant App)
2. "Mi Home" to start my vacuum cleaner and control all my Aqara devices (I only need them to add the new devices, controlling is over the Home Assistant App)
3. "Hue" app to integrate new Hue lights (Also Controlling and automation are done with Home Assistant)
4. "Amazon Alexa" to control and configure my Amazon Alexa and speech commands which control my shellies etc then.
5. "Aqara Home" I never opened this app to be honest. "Mi Home" is enough
6. "Home Assistant" is THE MAIN app where I control everything with, add actions etc.
7. "ReoLink" for my security camera which is running in my flat as well

![Home Assistant App I](https://cdn.offering.solutions/img/articles/2020-11-30/Screenshot_20201129-140422.jpg)

![Home Assistant App II](https://cdn.offering.solutions/img/articles/2020-11-30/Screenshot_20201129-140431.jpg)

Here we are controlling the light with Home Assistant App which uses the Shelly integration of the Home Assistant running on a Raspberry Pi to switch the light on or off.

![Controlling the shelly with the Home Assistant App](https://cdn.offering.solutions/img/articles/2020-11-30/VID-20201129-WA0000.gif)

## Amazon Alexa

I have an Amazon Alexa as well. I have three to be precise, but only one of them is really used. To clarify how that fits in: Amazon Alexa acts like a Home Assistant from a technical perspective: It has integrations by itself over the Amazon Alexa app and then can control things like Hue or even Shellies and much more.

So you can integrate the Shellies into Alexa, all Hue lights and I think a lot of other things. You can also do "if this than that" things. Alexa can be controlled by voice. The Home Assistant possibly can also have an integration of voice anyhow I am sure, but I am running all voice controlled commands over my Amazon Alexa for now.

So for example I added all my Shellies and Hue Lights to Alexa as well and when I say "Alexa, Good night!" before I go to bed it turns out all the lights for me.

## Recap

I started with absolutely no clue how those things can work together. That made the curve steeper than it should be but in the end it was absolutely no problem anymore to integrate the things and in the meantime I know where I have to look out for what to pre check if my things work together.

But this is a rabbit hole: You have to stop yourself 😊 It is so much fun that you want to combine all the things together. I have so much ideas doing this and that if that and this happens. Once you got the system set up it is really nice to work with. I love it and will definitely add more and more things over the time.

The main thing you should consider when adding so much stuff to your WiFi network is: Name your devices properly. Give them names. Otherwise you are lost. You will drown and the iot thing will get you and never let you go 😊.

Alexa - Call it a day!

Hope you enjoyed this

Fabian
