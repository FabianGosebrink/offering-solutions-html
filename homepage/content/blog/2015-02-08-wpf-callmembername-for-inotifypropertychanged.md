---
title: WPF CallMemberName for INotifyPropertyChanged
date: 2015-02-08
tags: ['wpf']
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  ['/blog/articles/2015/02/08/wpf-callmembername-for-inotifypropertychanged/']
---

In this blog post I want to show you how to use WPF CallMemberName for INotifyPropertyChanged.

Regarding to this blog post [here](http://offering.solutions/blog/articles/2014/09/14/wpf-basics-ii-the-inotifypropertychanged-interface/) I showed up how to implement the INotifyPropertyChanged.

Well with .Net-Framework 4.5 a new solution came up to make it even more easy:

Instead of the "old" (but working) base-class

```csharp
public class NotifyPropertyChangedBase : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler PropertyChanged;

    protected virtual void OnPropertyChanged<T>(Expression<Func<T>> propertyExpression)
    {
        MemberExpression memberExpr = propertyExpression.Body as MemberExpression;
        if (memberExpr == null)
        {
            throw new ArgumentException("propertyExpression should represent access to a member");
        }

        PropertyChangedEventHandler handler = PropertyChanged;
        if (handler != null)
        {
            handler(this, new PropertyChangedEventArgs(memberExpr.Member.Name));
        }
    }
}
```

The OnPropertyChanged can be replaced with:

```csharp
public class NotifyPropertyChangedBase : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler PropertyChanged;

    protected void NotifyPropertyChanged([CallerMemberName] string propertyName = null)
    {
        PropertyChangedEventHandler propChanged = PropertyChanged;
        if (propChanged != null)
        {
            propChanged(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
```

The CallMemberName-Attribute is automatically set to the PropertyName which calls it. So the usage in the ViewModel (or wherever you throw the event) is now easy:

```csharp
public string NameToDisplay
{
    get
    {
        return _nameToDisplay;
    }
    set
    {
        _nameToDisplay = value;
        NotifyPropertyChanged();
    }
}
```

See: You do not need to give a func. instead you are only calling the method without any parameters.

Happy coding!

Regards
