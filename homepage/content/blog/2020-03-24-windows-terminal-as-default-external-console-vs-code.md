---
title: Setting Windows Terminal as Default External Terminal in Visual Studio Code
date: 2020-03-24
tags: ['vscode']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to write down how you can set the new windows Terminal as the default external console when working with VSCode.

I like to have the console in an external window and NOT inside my vscode instance so I often use the combination `Ctrl + Shift + C` to start an external console window at the folder I am currently with my vscode instance.

What bothered me was: I love the new Windows Terminal but I wanted it to start as default when I use my preferred combination on my keyboard.

So here is how I configured it:

## VSCode

To prepare VSCode open an instance and press `Ctrl + ,` to enter the settings. Set the `"terminal.external.windowsExec"` property to the path to the file `wt.exe`.

```
"terminal.external.windowsExec": "C:\\Users\\Fabian\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe",
```

> This is of course my local PC, your path may differ.

## Windows Terminal

To let the terminal open up at the path you are at currently open up the `profiles.json` file of your Windows Terminal. You can access it opening up a Windows Terminal Instance and Press `Ctrl + ,` again.

In there are the profiles which are currently active. You can now put the `"startingDirectory": "%__CD__%"` at the profiles you want to edit the startup directory.

> I got that hint from Rick Strahl's Blog (https://weblog.west-wind.com/posts/2019/Sep/03/Programmatically-Opening-Windows-Terminal-in-a-Specific-Folder)[https://weblog.west-wind.com/posts/2019/Sep/03/Programmatically-Opening-Windows-Terminal-in-a-Specific-Folder]. Thanks man!

```
// To view the default settings, hold "alt" while clicking on the "Settings" button.
// For documentation on these settings, see: https://aka.ms/terminal-documentation

{
  "$schema": "https://aka.ms/terminal-profiles-schema",

  "defaultProfile": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",

  "profiles": [{
      // Make changes here to the powershell.exe profile
      "guid": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",
      "name": "Windows PowerShell",
      "commandline": "powershell.exe",
      "hidden": false,
      "startingDirectory": "%__CD__%" // <--- Add this line!
    },
    // ...
  ],

  // ...
}
```

Of course you should add it to all the profiles/consoles you want to.

And that is it. After restarting VSCode pressing `Ctrl + Shift + C` opens up a Windows Terminal (with Powershell in my case) instead of the normal console.

Hope this helps

Fabian
