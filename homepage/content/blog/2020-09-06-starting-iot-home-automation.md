---
title: How to start with home automation for absolute beginners
date: 2020-09-10
tags: ['homeassistant']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to write how I started with home automation. Really starting from zero as I had no clue from home automation and only heard about it from colleagues. The only think I knew was a Raspberry Pi. I am sure that there is loads more to do and a lot of things to improve but lets go with what I have so far.

## The start

I live in a flat where I have a bathroom which has no window itself and a vent fan installed which sucks moist air out of the room during and after a shower before it causes damage or mold.

We have to leave the ventilator on until the air is dry as we think it is dry and then turn it off. Which was not a situation for because I had no measurement how much humidity and temperature we have in the bathroom. So this was the starting point.

I went with something like this in the first place

https://www.amazon.com/ORIA-Humidity-Thermometer-Temperature-Hygrometer/dp/B07KSTN3PF/ref=sr_1_21?dchild=1&keywords=humidifier+celsius&qid=1599413666&s=appliances&sr=1-21

but yet I had to turn off the ventilator/light manually. The first idea - and so the entrance to the iot rabbit whole - was this.

I read a lot about [Home Assistant](https://www.home-assistant.io/) but had absolutely no clue how to use it and what to do with it, connection the things I did not yet have to it. I thought it was an operating system like thing to flash on a card with a UI and I could basically use it to automatic the things in my home. I was half-wrong, but we will clarify this later on. How would things communicate with each other? And when x happens I want y to happen? No idea. I just started.

## What I already had

I already had a robot which is cleaning my house not regularly with a schedule but when I leave the house I can tell him over an app that I want him to run through the flat and clean it. So that was nice. [Roborock S6](https://www.digitec.ch/de/s1/product/roborock-s6-roboterstaubsauger-10731138) The robot does not directly has something to do with the home automation, however it is pat of it.

I also had an existing Raspberry Pi but I bought a new one for this, we will cover this in the next section.

And this was it.
