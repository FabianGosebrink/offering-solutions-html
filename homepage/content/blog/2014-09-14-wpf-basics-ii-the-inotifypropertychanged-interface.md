---
id: 994
title: WPF Basics II - The INotifyPropertyChanged Interface
date: 2014-09-14
author: Fabian Gosebrink
layout: post
tags: basics databinding tutorial wpf
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

> UPDATE
> Check the CallMemberName-Possibility [here](http://offering.solutions/blog/articles/2015/02/08/wpf-callmembername-for-inotifypropertychanged/)

In the first part I told something about the databinding [here](http://offering.solutions/blog/articles/2014/09/02/how-to-make-first-steps-of-databinding-in-wpf/). The second part should be something about refreshing the data at the UI. We said that the UI only knows the datacontext and its properties. So far so god. It is binding them at startup and we're done so far.

Just to calm down the ones who expect a solution: Can be found in the third article [here](http://offering.solutions/blog/articles/2014/10/01/correct-implementation-of-commands-in-wpf/)

But what if the data underneath is changing. What if a service or anything else has new data and want to tell the UI "Hey there, I have something new!"

Therefore the binding has to be "refreshed" and we have the INotifyPropertyChanged-Interface to get this job done.

Lets take our code from before and give it a timer which sets the name we want to display after 3 seconds:

```xml
<Grid>
    <StackPanel>
        <TextBlock Text="{Binding NameToDisplay}"></TextBlock>
    </StackPanel>
</Grid>
```

```csharp
public class MainViewModel
{
    public string NameToDisplay { get; set; }
    Timer _timer;

    public MainViewModel()
    {
        _timer = new Timer(3000);
        _timer.Elapsed += timer_Elapsed;
        _timer.Enabled = true;
    }

    void timer_Elapsed(object sender, ElapsedEventArgs e)
    {
        NameToDisplay = "Hallelujah";
        _timer.Enabled = false;
    }
}
```

> "Hallelujah" is always my testword because im pretty sure it occurs nowhere else in a solution ;) So if you see this, its mine

So, if you debug this you will see that the timer gets into the timer_elapsed-function and sets the name but the UI does not change. So lets implement a way to refresh the UI! Only implement the INotifyPropertyChanged-interface:

```csharp
public class MainViewModel : INotifyPropertyChanged
{
    public string NameToDisplay { get; set; }
    readonly Timer _timer;

    public MainViewModel()
    {
        _timer = new Timer(3000);
        _timer.Elapsed += timer_Elapsed;
        _timer.Enabled = true;
    }

    void timer_Elapsed(object sender, ElapsedEventArgs e)
    {
        NameToDisplay = "Hallelujah";
        _timer.Enabled = false;

        if (PropertyChanged != null)
        {
            PropertyChanged(this, new PropertyChangedEventArgs("NameToDisplay"));
        }

    }

    public event PropertyChangedEventHandler PropertyChanged;
}
```

So everthing we do is throwing the event that something has changed with the name of the property as a string. If you let this run you will see that the UI refreshes and after 3 seconds the "hallelujah" is displayed. But this has some disadvantages:

- We are throwing the event in the timer_elapsed. So only when **this** is done the property is refreshed
- We are having the name of the property as a string in it. So renaming the property will mostly NOT rename the string. (Magic String). And the refresh does not work again.
- Refreshing the UI is a base function. It should be outsourced in like a base file or something.

Lets tune this:

1.  First we will make a namespace for this (I love namespaces) called "Common" and make a basefile in there.
2.  We will make this function generic expecting a lambda-Expression to erase the magic string
3.  We will call the refreshing thing in the setter of the property itself. Then its getting refreshed everytime someone in the code sets it.

![WPF Basics II - The INotifyPropertyChanged Interface]({{site.baseurl}}assets/articles/2014-09-14/INotify_I.jpg)

which looks like:

```csharp
public class NotifyPropertyChangedBase : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler PropertyChanged;

    protected virtual void OnPropertyChanged<T>(Expression<Func<T>> propertyExpression)
    {
        MemberExpression memberExpr = propertyExpression.Body as MemberExpression;
        if (memberExpr == null)
        {
            throw new ArgumentException("Wrong PropertyExpression");
        }

        PropertyChangedEventHandler handler = PropertyChanged;
        if (handler != null)
        {
            handler(this, new PropertyChangedEventArgs(memberExpr.Member.Name));
        }
    }
}
```

This is taking the member and throwing the event for us on this member. That was Point 1 and 2. Let it be (three)!

We do inherit from the just created class and can access the event with the lambda-expression, which is more generic:

```csharp
public class MainViewModel : NotifyPropertyChangedBase
{
    readonly Timer _timer;
    private string _nameToDisplay;

    public string NameToDisplay
    {
        get { return _nameToDisplay; }
        set
        {
            _nameToDisplay = value;
            OnPropertyChanged(() => NameToDisplay);
        }
    }

    public MainViewModel()
    {
        _timer = new Timer(3000);
        _timer.Elapsed += timer_Elapsed;
        _timer.Enabled = true;
    }

    void timer_Elapsed(object sender, ElapsedEventArgs e)
    {
        NameToDisplay = "Hallelujah";
        _timer.Enabled = false;
    }
}
```

Remeber: In the elapsed-method we are setting the property (not the private variable) directly that the setter is called and the event is thrown.

> This is not the only way to implement this. This can be done in several ways. But for beginners this should do the trick.

Run it, it will show you the text after three seconds.

If you want to, read further how you can get this cleaner with services and erase the NotifyPropertyChangedBase from the viewmodel.

Lets tune this a little bit: The viewmodel does a lot of work. It does not have to do this, so lets extract this a bit and make it more clean.

First we do a NameProvider, which gives us the name. In my case again with a timer to see the UI changing. Normally this could be a service or something else without a timer. Could be anything which triggers the UI to change (not only) after a piece of work.

![WPF Basics II - The INotifyPropertyChanged Interface]({{site.baseurl}}assets/articles/2014-09-14/INotify_II.jpg)

```csharp
public class NameProviderImpl : NotifyPropertyChangedBase, INameProvider
    {
        private readonly Timer _timer;
        private string _nameToDisplay;

        public string NameToDisplay
        {
            get
            {
                return _nameToDisplay;
            }
            private set
            {
                if (_nameToDisplay == value)
                {
                    return;
                }

                _nameToDisplay = value;
                OnPropertyChanged(() => NameToDisplay);
            }
        }

        public NameProviderImpl()
        {
            _timer = new Timer(3000);
            _timer.Elapsed += timer_Elapsed;
            _timer.Enabled = true;
        }

        void timer_Elapsed(object sender, ElapsedEventArgs e)
        {
            NameToDisplay = "Hallelujah";
            _timer.Enabled = false;
        }
    }
```

```csharp
public interface INameProvider
{
    string NameToDisplay { get; }
}
```

Everything we did here is moving the timer-logic into a provider and offering the property through an interface to the outside.

Our viewmodel now has nearly no logic anymore:

```csharp
public class MainViewModel
{
    public INameProvider NameProvider { get; set; }

    public MainViewModel()
    {
        NameProvider = new NameProviderImpl();
    }
}
```

This principle I am also describing [here](http://offering.solutions/blog/articles/2014/07/03/clean-your-viewmodel-in-wpf-and-create-a-facade/).

Now we have to change the binding a bit. Because now the viewmodel is giving us the property to bind not directly but onto another property "NameProvider". So the Binding looks like this:

```xml
<Grid>
    <StackPanel>
        <TextBlock Text="{Binding NameProvider.NameToDisplay}"></TextBlock>
    </StackPanel>
</Grid>
```

Run this and you will see the result stays the same: After three seconds our string is displayed.

![WPF Basics II - The INotifyPropertyChanged Interface]({{site.baseurl}}assets/articles/2014-09-14/INotify_III.jpg)

So what we did now is: Getting our Viewmodel nice and clean. It gives us an overview of services and providers which the UI can use. It does not inherit from NotifyPropertyChangedBase. You saw how flexible databinding is. Not only with strings but you can bind also lists of objects etc.
