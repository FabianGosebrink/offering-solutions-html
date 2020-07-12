---
title: Clean your viewmodel in WPF and create a facade
date: 2014-07-03
tags: ['wpf']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases:
  ['/blog/articles/2014/07/03/clean-your-viewmodel-in-wpf-and-create-a-facade/']
---

In this post I want to show you how to Clean your viewmodel in WPF and create a facade.

We use a facade to get your viewmodel in WPF nice and clean. I want to show you how to get along with the seperation of concerns and how to write simple and testable code with databinding and WPF.

When you want to use a viewmodel for databinding you normally get your public properties on your viewmodel an do a normal binding on your xaml like this:

```xml
<Window x:Class="WPFViewModelAsFacade.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="350" Width="525">
<Grid>
<TextBlock Text="{Binding MyCalculatedNumber}"></TextBlock>
</Grid>
</Window>
```

Setting the datacontext:

```csharp
public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            DataContext = new MainViewModel();
        }
    }
```

and your viewmodel something like:

```csharp
public class MainViewModel
    {
        private int _myCalculatedNumber;

        public int MyCalculatedNumber
        {
            get { return _myCalculatedNumber; }
            set { _myCalculatedNumber = value; }
        }

        //other Properties here...

        public MainViewModel()
        {
            _myCalculatedNumber = 23;
        }
    }
```

of course you would give the viewmodel other values and it would grow like hell. Also when you do calculations or CRUD-operations etc. But when your application grows and gets bigger it would be necessary to move some thing into services, providers etc. to get into the seperation of concerns.

### Solution I -  Services

So lets introduce a service to do some work (a normal calculation with the result of 23 in my example):

![clean your viewmodel in WPF and create a facade](/img/articles/2014-07-03/1.jpg)

```csharp
namespace WPFViewModelAsFacade
{
    public interface ICalculationService
    {
        int CalculateNumber();
    }
}
```

```csharp
namespace WPFViewModelAsFacade
{
    public class CalculationService : ICalculationService
    {
        public int CalculateNumber()
        {
            //do some calculation/work
            //return result...
            return 23;
        }
    }
}
```

And your viewmodel could look like this

```csharp
namespace WPFViewModelAsFacade
{
    public class MainViewModel
    {
        private int _myCalculatedNumber;

        public int MyCalculatedNumber
        {
            get { return _myCalculatedNumber; }
            set { _myCalculatedNumber = value; }
        }

        //other Properties here...

        public MainViewModel()
        {
            ICalculationService calculationService = new CalculationService();
            _myCalculatedNumber = calculationService.CalculateNumber();
        }
    }
}
```

<span style="color: #999999;">Note: Normally you would use dependency injection here to avoid this "new ..." call and a link to the direct implementation of the service.</span>

So: Now we have outsourced the calculation and introduced a new service which is doing the work. But this is not a facade. Our viewmodel is still very big (image it bigger than it looks here: There are a lot more properties on it in a real application).

### Solution II - Facade

The viewmodel should now get a real facade and only offer the service which is doing the calculation. This makes you more flexible and the viewmodel is like only an interface for the view. Its like a provider for every service (or providers) which contain the information the view needs.

```csharp
namespace WPFViewModelAsFacade
{
    public interface ICalculationService
    {
        int CalculatedNumber { get; }
    }
}
```

```csharp
namespace WPFViewModelAsFacade
{
    public class CalculationService : ICalculationService
    {
        public int CalculatedNumber { get; private set; }

        public CalculationService()
        {
            // Do some stuff here and get the result in the defined property
            CalculatedNumber = 25;
        }
    }
}
```

```csharp
public class MainViewModel
{
    private readonly ICalculationService _calculationService;
    //other Properties here...

    public ICalculationService CalculationService
    {
        get { return _calculationService; }
    }

    public MainViewModel()
    {
        _calculationService = new CalculationService();
    }
}
```

So far until here. What we did is: We are only offering the service through our viewmodel and our viewmodel is not interested in what happens behind anymore. The service can do his work and only give back his results. But you have to correct you binding now because your number is not in the viewmodel anymore but in the service behind.

```xml
<Window x:Class="WPFViewModelAsFacade.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="350" Width="525">
<Grid>
<TextBlock Text="{Binding CalculationService.CalculatedNumber}"></TextBlock>
</Grid>
</Window>
```

We are now bind on our service "." our property. Its the same with Commands. Commands should be seperate classes (in a seperated namespace) and you be offered through the viewmodel.

If you do this your viewmodel gets a complete facade and you can change the services underneath without touching the viewmodel. So every testcase you write for the viewmodel would be untouched :)

Note: Your viewmodel does not have to implement `INotifypropertyChanged` then. If you make classes/interfaces which are providing information to the UI these classes are the only ones who have to implement INotifyPropertyChanged.

If you think further it would be better to separate the service one again and getting a provider between the service, which is doing the real job and the class/interface, which is giving the data to the outside world. This provider (or however you call it) can then be offered in the viewmodel and you would bind first over this one. But for now this should be it, I think you got my point ;) .

![clean your viewmodel in WPF and create a facade](/img/articles/2014-07-03/2.jpg)
![clean your viewmodel in WPF and create a facade](/img/articles/2014-07-03/Facade.jpg)

[WPFViewModelAsFacade Solution](/img/articles/2014-07-03/WpfViewModelAsFacade.zip)

```

```
