---
id: 83
title: Code-First with Entity Framework n:m relationship with additional information
date: 2014-04-06T17:18:15+00:00
author: Fabian Gosebrink
layout: post
tags: aspnet codefirst ef entityframework fluentapi relationships
logo: 'assets/images/logo_small.png'
navigation: True
cover: 'assets/images/aerial-view-of-laptop-and-notebook_bw_osc.jpg'
subclass: 'post tag-speeches'
disqus: true
categories: articles
---

In this blogpost I want to show you a way to realize code First with Entity Framework n:m relationship with additional information.

a few days ago I faced the problem of having a normal N:M Relationship in EF with additional information in the table which keeps the two entities together.

Well, without having these additional information this is easy:

```csharp
public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    //... everything else
    public virtual ICollection Groups{ get; set; }
}
```

```csharp
public class Group
{
    public int Id { get; set; }
    //... everything else
    public virtual ICollection Users { get; set; }
}
```

EF is now going to make the right decisions for you while creating the database. A third table is created (due to EF-magic) and shows you the right relation-table. Great things so far. But what if you want to have more information on the relation table which EF created for you? Well, the answer ist easy: EF is not able to do this without your help.

You have to create a third entity representing the relationship you want. I will now show how and I will show the right Fluent-Configuration to map the Keys etc. in a correct way. (Entities should not know what their fields are used for. So things like [Key], &#8230; have to be avoided! This is why you have Fluent-API!)

<a title="Code First Relationships Fluent API" href="http://msdn.microsoft.com/en-us/data/hh134698.aspx" target="_blank">Code First Relationships Fluent API</a>

<a title="Configuring/Mapping Properties and Types with the Fluent API" href="http://msdn.microsoft.com/en-us/data/jj591617.aspx" target="_blank">Configuring/Mapping Properties and Types with the Fluent API</a>

So first, please create your third entity:

```csharp
public class Groups2Users
    {
        public int UserId { get; set; }
        public int GroupId { get; set; }

        public virtual User User { get; set; }
        public virtual Group Group { get; set; }

        public MyAdditionalInformationType MyAdditionalInformation { get; set; }
    }
```

and extend your existing entities like the following:

```csharp
public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        //... everything else
        public virtual ICollection Groups2Users { get; set; }
    }
```

```csharp
public class Group
    {
        public int Id { get; set; }
        //... everything else
        public virtual ICollection Groups2Users { get; set; }
    }
```

Right now, you have made the three entities. Now, we have to wire everything together:

```csharp
public class DataBaseContext : DbContext
    {
        public DataBaseContext()
            : base("MyConnectionString")
        {

        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity().HasKey(q => new
                                        {
                                            q.GroupId,
                                            q.UserId
                                        });

            modelBuilder.Entity()
                .HasRequired(t => t.Group)
                .WithMany(t => t.Groups2Users)
                .HasForeignKey(t => t.GroupId);

            modelBuilder.Entity()
                .HasRequired(t => t.User)
                .WithMany(t => t.Groups2Users)
                .HasForeignKey(t => t.UserId);
        }

        public DbSet User { get; set; }
        public DbSet Groups { get; set; }
        public DbSet Groups2Users { get; set; }
    }
```

When you now run your application with the right code-first configuration your database should hold those 3 three tables.

Note: Now you have to think exactly about what you want to do (Well you should do this always while coding 😉 ). Adding a new group has to get another entry in the Group-Table. but adding or deleting users are only reached by editing the Groups2Users-Table. (Perhaps you should spend this table an own repository 😉 ).

When you for example want to have all Groups of a user just call:

```csharp
context.Groups2Users.Where(x => x.UserId == userId, includeProperties: "Group").ToList();
```

Adding a new group would be like

```csharp
Groups2Users groups2Users = new Groups2Users
{
    Group = //Define your group here or above,
    User = //your user here,
    MyAdditionalInformation = myAdditionalInformation
};

context.Groups2Users.Add(groups2Users);
```

Hope this helps,

Regards
