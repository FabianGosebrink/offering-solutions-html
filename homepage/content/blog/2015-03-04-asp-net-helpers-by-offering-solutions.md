---
title: ASP.NET Helpers by Offering Solutions
date: 2015-03-04
tags: ['nuget']
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
draft: false
category: blog
aliases: ['/blog/articles/2015/03/04/asp-net-helpers-by-offering-solutions/']
---

I released a new version of the ASP.NET Helpers by Offering Solutions:

[Nuget: AspNetHelpers by Offering Solutions](https://www.nuget.org/packages/OfferingSolutions.AspNetHelpers/)

which includes

- ViewModelBase
- SubmitModelBase
- ModelValidator (for easier validation)

and features like

- Nullcheck with Exception
- Nullcheck with returning the type if not null, otherwise exception
- Return bool value if something is null
- Checking enumerable if its null or empty
- Checks if a string is a timespan
- Checks if a string is an email
- Converts a string to datetime
- Converts a string to timespan
- Checks a string for null, empty or a given length (e.g. for password purposes)
- Checks if a HttpPostedFile has a specific format
- Checks if a HttpPostedFile is an image
- Checks if a string can be converted to double
- Converts a string to double

Why ViewModels and Submitmodels you can read this [here](http://blog.noser.com/what-are-submitmodels-and-how-to-use-them/) and [here](http://blog.noser.com/why-and-how-to-avoid-viewbag-and-viewdata-in-asp-net-mvc/)

ViewModelBase and SubmitModelBase are two baseclasses for the introduced view- and submitmodels.

```csharp
public class AccountRegisterViewModel : ViewModelBase
{
    public AccountRegisterSubmitModel SubmitModel { get; set; }

    public AccountRegisterViewModel()
    {
        Url = "~/Here/Goes/My/Url.cshtml";
    }
}
```

And you can access InfoMessages, SuccessMessages and  ErrorMessages now from your ViewModel.

In your view you are filling up your submitmodel and sending it again to your Server. There you can now validate it:

```csharp
public AccountRegisterViewModel RegisterUser(AccountRegisterSubmitModel submitModel)
{
    AccountRegisterViewModel viewModel = GetAccountRegisterViewMmodel(submitModel);

    try
    {
        if (!_modelValidator.IsSubmitModelValid(viewModel, submitModel))
        {
            return viewModel;
        }

        // Do some stuff
    }
    catch (Exception)
    {
        viewModel.ErrorMessages.Add("There was an error. Can not register.");
    }

    return viewModel;
}
```

In this exampe the ModelValidator in the NuGet above is used which you register with Ninject for example like this:

```csharp
kernel.Bind(typeof(IModelValidator)).To(typeof(ModelValidatorImpl));
```

If you validate with the validator, your Errormessages are getting automatically filled with those defined in your submitmodel and you can easily return it. Of course you can do it the long way like this:

```csharp
public AccountRegisterViewModel RegisterUser(AccountRegisterSubmitModel submitModel)
{
    AccountRegisterViewModel viewModel = GetAccountRegisterViewMmodel(submitModel);

    try
    {
        ReadOnlyCollection<string> errors;
        if (!submitModel.IsValid(out errors))
        {
            viewModel.ErrorMessages.AddRange(errors);
            return viewModel;
        }

        // Do some stuff
    }
    catch (Exception)
    {
        viewModel.ErrorMessages.Add("There was an error. Can not register.");
    }

    return viewModel;
}
```

&nbsp;

```csharp
static void Main(string[] args)
{
    //Throws an exception
    Person person = null;
    person.CheckIsNull();

    // Throws an exception if null, gives you back the type otherwise --> Good for DI in public methods
    Person myPerson = person.CheckIsNull("Person must not be null");

    // Is true in this case
    bool personIsNull = person.IsNull();

    person = new Person() {Id = 1, Name = "Fabian"};
    List<Person> listOfPersons = new List<Person>() {person};

    //should be false
    bool isNullOrEmpty = listOfPersons.IsNullOrEmpty();

    // Checks a string for a valid TimeSpan
    string timeSpanToCheck = "11:20";
    bool isTimeSpan = timeSpanToCheck.IsTimeSpan();

    // Checks if a string is a valid email or not
    string email = "dont@ask.me";
    bool isEmail = email.IsEmail();

    //Converts a string to datetime
    string toDateTime = "01.01.2010";
    DateTime dateTime = toDateTime.ToDateTime();

    // COnverts a string to Timespan
    timeSpanToCheck = "11:20";
    TimeSpan timeSpan = timeSpanToCheck.ToTimeSpan();

    //Cheks, if a password has a specific length or is null or empty
    string password = "TheseAreAtLeastEightSigns";
    bool isValidPassword = password.IsValidPassword(8);

    // Checks if a file has a given format...
    HttpPostedFileBase httpPostedFile = null;//...
    bool hasFormat = httpPostedFile.HasFormat("txt");

    // ... or wth multiple extensions
    hasFormat = httpPostedFile.HasFormat("txt", "pdf");

    // Checks if a file is an image...
    bool isImage = httpPostedFile.IsImage();

    // ...also with formats
    isImage = httpPostedFile.IsImage("jpg", "gif");

    //Checks if a value is a double value (separation with . or ,
    string doubleToCheck = "3.5";
    bool isDouble = doubleToCheck.IsDouble();

    //COnverts a string to double
    doubleToCheck = "3.5";
    double doubleValue = doubleToCheck.ToDouble();
}
```

So, this is it. Hope you enjoy!

Regards

Fabian
