---
id: 999
title: ASP.NET MVC - Generic Repositories and UnitOfWork
date: 2014-07-01 08:00
author: Fabian Gosebrink
layout: post
tags: aspnet mvc web architecture
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

This is the third and the last blogpost regarding ASP.NET MVC Architecture.

### NugetPackage

[NugetPackage](https://www.nuget.org/packages/OfferingSolutions.UnitOfWork.Structure)

### Previous Posts

[ASP.NET MVC Architecture (Part I): Structurize your project with areas and services in ASP.NET MVC](http://offering.solutions/blog/articles/2014/06/01/structurize-your-project-with-areas-and-services-in-asp-net-mvc/)

[ASP.NET MVC Architecture (Part II): Creating a business logic in ASP.NET MVC](http://offering.solutions/blog/articles/2014/06/10/creating-a-business-logic-in-asp-net-mvc/)

### Lets go

In the first two posts I handled UI things, how to organize your areas (controller-services) and I showed a possibility to create your business-logic regarding area-Services and business-services. In this post I want to show you (like in thousand other blogs before ;) ) the Unit-Of-Work-Pattern in use with generic repositories ([repository-pattern](http://msdn.microsoft.com/en-us/library/ff649690.aspx)). This makes the trilogy of the architecture posts complete (for this time. Maybe there will be others in the future ;) )

First things first: What is the repository-pattern? Well, if you built up your application the right way you should have several objects which should be persisted in the database. This can be Users, Projects, or whatever your applications wants to deal with.

For each of these objects you need the normal CRUD-operations. And when you implemented these operations the second and third time, at the latest, you can see that these methods are always the same. Adding an object, getting a single object, getting all objects, updating an object and deleting an object. Period. This is basically all you need.

If you need more operations, or you have to deal with many of these mentioned above sequential you can build a service for this. Read part I and II for handling this ;)

So these operations are always the same. So it would be nice if we could do like a class, with an interface, which offers us there operations, no matter which type we are going to use.

And exactly this is what this generic repositories are for.

But what is the Unit-Of-Work (UoW) and why another Unit-Of-Work-Abstraction?

If you already dealed with the Entity-Framework (EF) you have used the UoW-Pattern all the time. The repository-pattern, too. And so you have already seen how it works: The UoW is tracking all your changes, gathering them together to get every information and changes on the database you need and sending them altogether into the database when you have finished your request. Like the DatabaseContext does. So the UoW with the repositories represents an abstraction of your database and it “reminds” all your changes.

```csharp
public class DataBaseContext : DbContext
{
    public DataBaseContext()
            : base("MyConnectionString")
    {

    }

    public DbSet<User> User { get; set; }
    public DbSet<Project> Projects { get; set; }
        // Your entities here...
}
```

_Note: "Projects" is a normal DTO which is used for dealing with the Entity Framework. Could look like this_

```csharp
public class Project
{
    public int Id { get; set; }
    public DateTime EntryDate { get; set; }
    public DateTime LastChangedDate { get; set; }
    public string Name { get; set; }
}
```

You should have a normal DatabaseContext with all your entities on it and your model-creating-stuff using the FluentAPI.
Nothing new until here. I am always hiding things in namespaces, so in my root-folder I am creating a "Repositories"-Folder which is hiding all my Repo-stuff.

![ASP.NET MVC - Generic Repositories and UnitOfWork]({{site.baseurl}}assets/articles/2014-07-01/11.png)

Let’s go into this in detail:
For offering the same operations on every entity we have we need something like a base-class (with interface) which offers us everything we can do with an object (CRUD with a little bit more. Let’s call it CRUD+ ;) ).

_Note: I just looked into the web and found a good solution for this generic-things_

<a href="http://codereview.stackexchange.com/questions/31822/unit-of-work-and-repository-design-pattern-implementation" target="_blank">StackExchange</a>

<a href="http://www.ASP.NET/mvc/tutorials/getting-started-with-ef-5-using-mvc-4/implementing-the-repository-and-unit-of-work-patterns-in-an-asp-net-mvc-application" target="_blank">ASP.NET MVC - Generic Repositories - UoW</a>

So I combined them and just put in a little effort then.

This is the RepositoryBase. With its interface IRepositoryBase.

```csharp
public interface IRepositoryBase<T> where T : class
    {
        List<T> GetAll(Expression<Func<T, bool>> filter = null,
                       Func<IQueryable<T>, IOrderedEnumerable<T>> orderBy = null,
                       string includeProperties = "");

        T FindSingle(int id);

        T FindBy(Expression<Func<T, bool>> predicate, string includeProperties = "");

        void Add(T toAdd);

        void Update(T toUpdate);

        void Delete(int id);

        void Delete(T entity);
    }
```

```csharp
public class RepositoryBaseImpl<T> : IRepositoryBase<T> where T : class
    {
        private readonly DataBaseContext _dataBaseContext;

        public RepositoryBaseImpl(DataBaseContext context)
        {
            _dataBaseContext = context.IsNotNull("context");
        }

        public virtual List<T> GetAll(Expression<Func<T, bool>> filter = null,
            Func<IQueryable<T>, IOrderedEnumerable<T>> orderBy = null,
            string includeProperties = "")
        {
            IQueryable<T> query = _dataBaseContext.Set<T>();

            if (filter != null)
            {
                query = query.Where(filter);
            }

            foreach (string includeProperty in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            if (orderBy != null)
            {
                return orderBy(query).ToList();
            }

            return query.ToList();
        }

        public virtual T FindSingle(int id)
        {
            return _dataBaseContext.Set<T>().Find(id);
        }

        public virtual T FindBy(Expression<Func<T, bool>> predicate, string includeProperties = "")
        {
            IQueryable<T> query = _dataBaseContext.Set<T>();
            foreach (string includeProperty in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }
            return query.Where(predicate).FirstOrDefault();
        }

        public virtual void Add(T toAdd)
        {
            _dataBaseContext.Set<T>().Add(toAdd);
        }

        public virtual void Update(T toUpdate)
        {
            _dataBaseContext.Entry(toUpdate).State = EntityState.Modified;
        }

        public virtual void Delete(int id)
        {
            T entity = FindSingle(id);
            _dataBaseContext.Set<T>().Remove(entity);
        }

        public virtual void Delete(T entity)
        {
            _dataBaseContext.Set<T>().Remove(entity);
        }
    }
```

So here right in the beginning we see the heart of the thing we want to take a look at with this blogpost.
In this generic repository we are able to perform every operation we want with an object, while being able to include some child-properties, to find all, to find a single entry (with the find-method which will eventually not force a direct query), to get a single entry with a query etc.
But let’s put this interface into a more flexible context. I added, like shown in the links above, a repository-provider which is caching the repositories and creating them with a factory (factory-pattern).

```csharp
internal interface IRepositoryProvider
    {
        DataBaseContext DbContext { get; set; }

        IRepositoryBase<T> GetGenericRepository<T>() where T : class;

        T GetCustomRepository<T>(Func<DataBaseContext, object> factory = null) where T : class;
    }
```

```csharp
internal class RepositoryProviderImpl : IRepositoryProvider
    {
        public DataBaseContext DbContext { get; set; }

        private readonly Factory _factory;
        protected Dictionary<Type, object> Repositories { get; private set; }

        public RepositoryProviderImpl()
        {
            _factory = new Factory();
            Repositories = new Dictionary<Type, object>();
        }

        public IRepositoryBase<T> GetGenericRepository<T>() where T : class
        {
            Func<DataBaseContext, object> repositoryFactoryForEntityTypeDelegate = _factory.GetRepositoryFactoryForEntityType<T>();
            return GetCustomRepository<IRepositoryBase<T>>(repositoryFactoryForEntityTypeDelegate);
        }

        public virtual T GetCustomRepository<T>(Func<DataBaseContext, object> factory = null)
            where T : class
        {
            object repository;
            Repositories.TryGetValue(typeof(T), out repository);
            if (repository != null)
            {
                return (T)repository;
            }
            return CreateRepository<T>(factory, DbContext);
        }

        private T CreateRepository<T>(Func<DataBaseContext, object> factory, DataBaseContext dbContext)
        {
            Func<DataBaseContext, object> repositoryFactory;
            if (factory != null)
            {
                repositoryFactory = factory;
            }
            else
            {
                repositoryFactory = _factory.GetRepositoryFactoryFromCache<T>();
            }
            if (repositoryFactory == null)
            {
                throw new NotSupportedException(typeof(T).FullName);
            }
            T repository = (T)repositoryFactory(dbContext);
            Repositories[typeof(T)] = repository;
            return repository;
        }
    }
```

### Factory:

```csharp
internal class Factory
    {
        private readonly IDictionary<Type, Func<DataBaseContext, object>> _factoryCache;

        public Factory()
        {
            _factoryCache = GetFactories();
        }

        public Func<DataBaseContext, object> GetRepositoryFactoryForEntityType<T>()
            where T : class
        {
            Func<DataBaseContext, object> factory = GetRepositoryFactoryFromCache<T>();
            if (factory != null)
            {
                return factory;
            }

            return DefaultEntityRepositoryFactory<T>();
        }

        public Func<DataBaseContext, object> GetRepositoryFactoryFromCache<T>()
        {
            Func<DataBaseContext, object> factory;
            _factoryCache.TryGetValue(typeof(T), out factory);
            return factory;
        }

        private IDictionary<Type, Func<DataBaseContext, object>> GetFactories()
        {
            Dictionary<Type, Func<DataBaseContext, object>> dic = new Dictionary<Type, Func<DataBaseContext, object>>();
            dic.Add(typeof(IMembershipRepository), context => new MembershipRepositoryImpl(context));
            //Add Extended and Custom Repositories here
            return dic;
        }

        private Func<DataBaseContext, object> DefaultEntityRepositoryFactory<T>() where T : class
        {
            return dbContext => new RepositoryBaseImpl<T>(dbContext);
        }
    }
```

So the factory is creating all the repositories you want to have including caching them. While creating it checks the cache first and if not available it creates a new one (RepositoryProviderImpl).

_I will go into this later, but while looking into this code: Not every Repository has to follow the CRUD-Things in the repository-base like shown above._ You can also build up extended repositories and custom ones you complete implemented on your own way.

So at this point you have implemented the repository for each entity and you are able to give these things to the outside world through your provider who creates the repositories as implemented.
Now you need a UnitOfWork to use in your application to access these repositories and use them. This could look like this:

```csharp
public interface IUnitOfWork : IDisposable
    {
        IRepositoryBase<Project> ProjectRepository { get; }

        IMembershipRepository MembershipRepository { get; }

        int Save();
    }
```

```csharp
public class UnitOfWorkImpl : IUnitOfWork
    {
        private readonly DataBaseContext _context;
        private readonly IRepositoryProvider _repositoryProvider;

        public UnitOfWorkImpl()
        {
            _context = new DataBaseContext();

            if (_repositoryProvider == null)
            {
                _repositoryProvider = new RepositoryProviderImpl();
            }

            _repositoryProvider.DbContext = _context;
        }

        public IRepositoryBase<Project> ProjectRepository
        {
            get
            {
                return GetGenericRepository<Project>();
            }
        }

        public IMembershipRepository MembershipRepository
        {
            get
            {
                return GetCustomRepository<IMembershipRepository>();
            }
        }

        public int Save()
        {
            return _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        private IRepositoryBase<T> GetGenericRepository<T>() where T : class
        {
            return _repositoryProvider.GetGenericRepository<T>();
        }

        private T GetCustomRepository<T>() where T : class
        {
            return _repositoryProvider.GetCustomRepository<T>();
        }
    }
```

_Notice the IDisposable-Interface which the implementation of the UoW is implementing. This is why you can use it with a “using” in the end._

The `GetGenericRepository()` can be used if you would like to have standard CRUD-Functions on your entity. This should be the case in like 80% of your use-cases.
The `GetCustomRepository()` can give you back the custom repository which you have implemented because you want to have like other functions or for any other reason. You just have to implement its interface and offer it through the UoW-Interface.
You can also do extended interfaces, if you want to extend the CRUD-Methods because they are not enough.

![ASP.NET MVC - Generic Repositories and UnitOfWork]({{site.baseurl}}assets/articles/2014-07-01/21.png)

Just let the repository-interface inherit from your repositorybase-interface and the class from the repositorybase-implementation. Because the methods are virtual you can override them or just add new functions.
You can provide it again with the normal UoW-Interface:

![ASP.NET MVC - Generic Repositories and UnitOfWork]({{site.baseurl}}assets/articles/2014-07-01/31.png)

Now you have a generic repository which you can user for every entity. Its extendable with very few steps and you are also free if you want to use own repositories.
Wrapped in namespaces this it how it could look to you:

![ASP.NET MVC - Generic Repositories and UnitOfWork]({{site.baseurl}}assets/articles/2014-07-01/41.png)

You can use it now from the outside with

```csharp
using (IUnitOfWork unitOfWork = new UnitOfWorkImpl())
{
    unitOfWork.MembershipRepository...
}
```

And you are done :)
If you want to add new repositories you just have to extend your UoW-interface and add your new entities to your databaseContext.

_Note:
If you are using Ninject to inject your stuff and for IoC you can simply make your UnitOfWork present in the NinjectWebCommon.cs as InRequestScope. So it is injected once per request and you can Use DI_

```csharp
private static void RegisterServices(IKernel kernel)
{
    kernel.Bind(typeof(IUnitOfWork)).To(typeof(UnitOfWorkImpl)).InRequestScope();
}
```

```csharp
private readonly IUnitOfWork _unitOfWork;

public MyCtor(IUnitOfWork unitOfWork)
{
    _unitOfWork = unitOfWork.IsNotNull("unitOfWork");
}
```

```csharp
using (_unitOfWork)
{
    unitOfWork.MembershipRepository...
}
```

I hope I could give you a view into the UoW-Thing with generic repositories. But, like I said in the beginning, I only gathered information and put them together in one scope. And, of course, this is only one of soooo many articles in the web concerning UnitOfWork and Generic-Repos.

But I hope you liked reading it ;)

This is the last part of the architecture-posts in ASP.NET MVC. This was planned as a trilogy and here it is.

Thanks for reading

Regards

Fabian

#### Links

[Entity Framework](http://msdn.microsoft.com/en-US/data/ef)

[Agile Entity Framework 4 Repository: Part 1- Model and POCO Classes](http://thedatafarm.com/data-access/agile-entity-framework-4-repository-part-1-model-and-poco-classes/)
