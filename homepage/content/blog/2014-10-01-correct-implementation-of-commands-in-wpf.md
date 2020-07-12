---
title: Correct implementation of Commands in WPF
date: 2014-10-01
tags: ['commands', 'wpf']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  ['/blog/articles/2014/10/01/correct-implementation-of-commands-in-wpf/']
---

In this blogost I want to show you the IMHO correct implementation of Commands in WPF. Feel free to discuss :)

Again we will take the code from the posts before ([Wpf Basics I](http://offering.solutions/blog/articles/2014/09/02/how-to-make-first-steps-of-databinding-in-wpf/) and [Wpf Basics II](http://offering.solutions/blog/articles/2014/09/14/wpf-basics-ii-the-inotifypropertychanged-interface/)) and make it nicer. Well: What we did was databind a string to the UI. Then we implemented a solution for notify the UI that something changed. Everything triggered with a small timer which was doing the work for "I have something new". But what if the user himself wants to trigger the event for "I want something to be changed"?

Therefore we have commands. Commands can maybe triggered from Buttons and are doing some work. In our case we will now remove the timer and give our UI a button to trigger the changes.

So first we get rid of our timer in the NameProvider:

```csharp
public class NameProviderImpl : NotifyPropertyChangedBase, INameProvider
{
    private string _nameToDisplay;

    public string NameToDisplay
    {
        get
        {
            return _nameToDisplay;
        }
        set
        {
            _nameToDisplay = value;
            OnPropertyChanged(() => NameToDisplay);
        }
    }
}
```

Then we will do a namespace for our commands and add one

![Correct implementation of Commands in WPF](/img/articles/2014-10-01/INotify_IV.jpg)

Important for the command is: Let it be a single class. It makes testing easier and decouples it from the viewmodel. Also let it inherit from ICommand and implement this interface. And let it inherit from your command Interface ;)

```csharp
public class MyCommandImpl : ICommand, IMyCommand
{
    private readonly INameProvider _nameProvider;

    public bool CanExecute(object parameter)
    {
        return true;
    }

    public void Execute(object parameter)
    {
        _nameProvider.NameToDisplay = "Hallelujah";
    }

    public MyCommandImpl(INameProvider nameProvider)
    {
        _nameProvider = nameProvider;
    }

    public event EventHandler CanExecuteChanged;
}
```

```csharp
public interface IMyCommand
{
    bool CanExecute(object parameter);
    void Execute(object parameter);
    event EventHandler CanExecuteChanged;
}
```

So what the command offers us are two methods: "CanExecute" is giving us a bool indicating if the command can be executed or not. Based on this the button will be greyed out or not. The "CanExecuteChanged" can be fired, if something, which the CanExecute is based on, has changed and it has to be evaluated again. The button may appear not greyed out in the UI after firing this. And the execute is for executing the Command. What a surprise ;)

The command is only taking the nameprovider and setting the name. Exactly what the timer did before.

> The name "Name**Provider**" does not match here. Because it does not provide a name to us. It is more a service. Image you would trigger like a calculation or something ;)

So now let the viewmodel offer the command that it can be triggered from the outside:

```csharp
public class MainViewModel
{
    public INameProvider NameProvider { get; set; }
    public IMyCommand MyCommand { get; set; }

    public MainViewModel()
    {
        NameProvider = new NameProviderImpl();
        MyCommand = new MyCommandImpl(NameProvider);
    }
}
```

Now we offer the UI a NameProvider to bind on and a Command to bind on. The only thing we now have to do is bind this button to the command:

```xml
<Grid>
    <StackPanel>
        <TextBlock Text="{Binding NameProvider.NameToDisplay}"></TextBlock>
        <Button Command="{Binding MyCommand}" Height="20"></Button>
    </StackPanel>
</Grid>
```

Now the command is getting executed from the button. It sets the name in the nameprovider and fires the event, that something has changed and the UI gets updated.

That should be it for the very basic of WPF.

Solution can be loaded here: [Correct implementation of Commands in WPF](/img/articles/2014-10-01/DataBindingGettingStarted.zip)

Enjoy

Fabian
