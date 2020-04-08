---
title: Creating an Angular schematic and turn it into an nx plugin
date: 2020-04-08
tags: ['nx', 'plugin']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I would like to explain how you can write a schematic and turn it into an nx plugin or turn an existing schematic into an nx plugin.

## Knowledge Prerequisites

There are a lot of blog posts out there which deal with how you can get started writing a schematic in much more detail as we do not cover this here one more time in depth. Be sure to check out:

- [https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2)
- [https://brianflove.com/2018/12/11/angular-schematics-tutorial/](https://brianflove.com/2018/12/11/angular-schematics-tutorial/)
- [https://medium.com/@tomastrajan/total-guide-to-custom-angular-schematics-5c50cf90cdb4](https://medium.com/@tomastrajan/total-guide-to-custom-angular-schematics-5c50cf90cdb4)

We will however cover the get started things to ramp you up.

## What is a schematic?

In general a schematic can help you to create, move, delete, ... files automatically inside your angular or nx workspace. It can help you to stay organized and automates tasks you would normally do manually. Schematics are pretty powerful and the possibilities are endless.

In the following we are going to

1. [Create our first schematic](#creating-a-schematic)
1. [Separating into smaller actions](#separating-into-smaller-actions)
1. [Preparing the schematic](#preparing-the-schematic)
1. [Building specific Actions](#building-specific-actions)
1. [Adding ng add support](#adding-ng-add-support)
1. [Building your schematic](#building-your-schematic)
1. [Testing your schematic locally](#testing-your-schematic-locally)
1. [Turning the schematic in an nx plugin](#turning-the-schematic-in-an-nx-plugin)
1. [Building your schematic locally](#building-your-schematic-locally)
1. [Testing the plugin locally](#testing-the-plugin-locally)
1. [Next Steps](#next-steps)
1. [Releasing it to npm](#releasing-it-to-npm)

## Creating a schematic

After installing the `@angular-devkit/schematics-cli` we can work with the cli command globally and execute `schematics` in the console. If we want to create a schematic we can run

```cmd
schematics blank --name=my-first
```

which will create a folder and a blank schematic for us.

You will find several files including an `index.ts` which shows the following code

```js
export function myFirst(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return tree;
  };
}
```

The `Tree` is like the projection of a file system of a workspace, an AngularCLI or an nx workspace for example. So with providing methods like `create(...)`, `delete(...)`, `exists(...)`, `overwrite(...)` etc. it is possible to modify the workspace the schematic is running on and move files around. Perfect fit.

But take a closer look. The method `myFirst()` is returning a `Rule`. What is getting returned is another anonymous function taking the `Tree` and a `context` as parameter and returning - in this case - the unmodified `Tree` again.

That works, because if we take a deeper look the `Rule` type is specified as this

```
Rule = (tree: Tree, context: SchematicContext) => Tree | Observable<Tree> | Rule | Promise<void> | Promise<Rule> | void;
```

A `Rule` is a function which returns a `Tree`, `Observable<Tree>` or the mentioned return types above.

So far so good. But before we start let us think of what we want to achieve with our schematic here.

## Separating into smaller actions

I was doing a schematic lately (which we will get to later on) but basically every schematic is made of several steps.

**Think about these steps first!!!**

So make a list of which actions should be performed, because this has a direct influence of what we are going to write down in code!

Because beside returning a single `Rule` we can also chain them as the `@angular-devkit/schematics` package is providing methods to for example combine rules.

So what also works is

```js
import {
  Rule,
  SchematicContext,
  Tree,
  chain,
} from '@angular-devkit/schematics';

export function myFirst(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const arrayOfRules: Rule[] = [];
    // modifying the tree in several rules
    return chain(arrayOfRules);
  };
}
```

See where this is gonna lead us? With `chain()` we have the possibility to run several rules one after another. That is a perfect fit if we want to break our task into smaller actions!

## Preparing the schematic

Let us create an `actions` folder and an `index.ts` inside of it.

```
├── src
│   ├── my-first
│   │   ├── actions             // <<< Add this
│   │   │   └── index.ts        // <<< Add this
│   │   ├── index_spec.ts
│   │   └── index.ts
│   └── collection.json
├── .gitignore
├── .npmignore
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

Now let us extract the inner code into a method to the new created `actions/index.ts` file and call it from the existing outer `my-first/index.ts` file.

Code of `my-first/index.ts`

```js
import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { executeSchematic } from './actions';

export function myFirst(_options: any): Rule {
  return (host: Tree, context: SchematicContext) => {
    return executeSchematic();
  };
}
```

Code of `actions/index.ts`

```js
import {
  Tree,
  SchematicContext,
  Rule,
  chain,
} from '@angular-devkit/schematics';

export function executeSchematic(host: Tree, context: SchematicContext): Rule {
  const arrayOfRules: Rule[] = [];
  // modifying the tree in several rules
  return chain(arrayOfRules);
}
```

> The abstraction on this level makes it easier to migrate to a nx plugin later.

Now think about the actions you have to perform based on what your schematic should do. For me there are two types of actions. Those who are modifying the root workspace (files like the `angular.json` file for general properties or root files which are _not_ inside a specific project) and actions which are transforming files which exist in a specific project or the `angular.json` file but _for project specific properties_.

This leads me to two folders `root-actions` and `project-actions`. Each of them gets an `index.ts` file in it again.

```
.
├── src
│   ├── my-first
│   │   ├── actions
│   │   │   ├── project-actions         // <<< Add this
│   │   │   │   └── index.ts            // <<< Add this
│   │   │   ├── root-actions            // <<< Add this
│   │   │   │   └── index.ts            // <<< Add this
│   │   │   └── index.ts
│   │   ├── index_spec.ts
│   │   └── index.ts
│   └── collection.json
├── .gitignore
├── .npmignore
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

## Building specific Actions

Now it is time to build specific actions which are gonna execute _something_ you want to. Let us for example update the `angular.json` file on root as an action and as a project action we delete some files which are no longer needed inside a project folder.

Create the file `update-angularjson.ts` inside the `root-actions` folder and the file `delete-project-files.ts` inside the `project-actions` folder.

```
.
├── src
│   ├── my-first
│   │   ├── actions
│   │   │   ├── project-actions
│   │   │   │   ├── delete-project-files.ts         // <<< Add this
│   │   │   │   └── index.ts
│   │   │   ├── root-actions
│   │   │   │   ├── index.ts
│   │   │   │   └── update-angularjson.ts         // <<< Add this
│   │   │   └── index.ts
│   │   ├── index_spec.ts
│   │   └── index.ts
│   └── collection.json
├── .gitignore
├── .npmignore
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

Inside the files we are exporting a function which exports a `Rule` again getting passed the parameters we get given from the schematic itself.

Code of `delete-project-files.ts`

```js
export function deleteProjectFiles(/* Params _you_ want to pass in */): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // modify the Tree with tree.delete(path);
    // or whatever you want to do in the action :-)

    return tree;
  };
}
```

and in the `project-actions/index.ts` file we give it a place where all the actions are gonna be collected and put in order:

Code of `project-actions/index.ts`

```js
import { Rule } from '@angular-devkit/schematics';
import { deleteProjectFiles } from './delete-project-files';

export function getRulesForProjects() {
  let projectRules: Rule[] = [];
  // Maybe iterate over all projects, fetch all of them and execute the actions
  // per project
  projectRules.push(deleteProjectFiles());
  // maybe push other actions in sequence?

  return projectRules;
}
```

> The `project-actions/index.ts` file is the place where you can iterate over all the projects in the workspace and execute them _per project_.

Let us do the same with the `root-actions` and the `update-angularjson.ts`. This time we are gonna receive the workspace which we modify to have an example of custom parameters and those which are getting passed fro the schematics.

Code of `update-angularjson.ts`

```js
import { experimental } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function updateAngularJson(
  workspace: experimental.workspace.WorkspaceSchema /* CUSTOM PARAM*/
): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // Modify workspace like you want
    // tree, _context and workspace are available here
    tree.overwrite(`angular.json`, JSON.stringify(workspace, null, '  '));
    return tree;
  };
}
```

The code of the corresponding index file is closely the same

Code of `project-actions/index.ts`

```js
import { experimental } from '@angular-devkit/core';
import { Rule } from '@angular-devkit/schematics';
import { updateAngularJson } from './update-angularjson';

export function getRulesForWorkspaceRoot(
  workspace: experimental.workspace.WorkspaceSchema
) {
  let rulesToApply: Rule[] = [];

  rulesToApply.push(updateAngularJson(workspace));
  // maybe more actions

  return rulesToApply;
}
```

In the `actions/index.ts` file we are collecting the actions from `project-actions` and `root-actions` now and call the `chain()` method with the actions array as param.

```js
import {
  chain,
  SchematicContext,
  Tree,
  SchematicsException,
} from '@angular-devkit/schematics';
import { getRulesForProjects } from './project-actions';
import { getRulesForWorkspaceRoot } from './root-actions';

export function executeSchematic(host: Tree, context: SchematicContext) {
  const workspace = getAngularWorkspace(host);

  const projectAndLibActions = getRulesForProjects();
  const workspaceActions = getRulesForWorkspaceRoot(workspace);
  const rulesToApply = [...projectAndLibActions, ...workspaceActions];

  return chain(rulesToApply);
}

export function getAngularWorkspace(tree: Tree) {
  const workspaceConfig = tree.read(`angular.json`);

  if (!workspaceConfig) {
    throw new SchematicsException(
      'Could not find Angular workspace configuration'
    );
  }

  const workspaceContent = workspaceConfig.toString();
  const workspace = JSON.parse(workspaceContent);

  return workspace;
}
```

and from the `my-first/index.ts` file we only have to pass the corresponding arguments to our new created method like this:

Code of `my-first/index.ts`

```js
import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { executeSchematic } from './actions';
export function myFirst(_options: any): Rule {
  return (host: Tree, context: SchematicContext) => {
    return executeSchematic(host, context);
  };
}
```

## Adding `ng add` support

To provide the executing via `ng add` to your schematic enter the file `collection.json` and add the `ng add` as follows:

```json
{
  "$schema": "../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "my-first": {
      "description": "A blank schematic.",
      "factory": "./my-first/index#myFirst"
    },
    "ng-add": {
      "description": "A blank schematic.",
      "factory": "./my-first/index#myFirst"
    }
  }
}
```

## Building your schematic

To build your schematic locally you can add the following scripts in the `scripts` section of your `package.json`.

```json
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "build:watch": "tsc -p tsconfig.json --watch",
  },
```

The `npm run build` command will build you schematic locally and create your `*.js` files.

## Testing your schematic locally

If you want to test your schematic locally you can do this using the

```cmd
npm link
```

command.

So first create a new workspace with the AngularCLI with

```cmd
ng new myWorkspace --createApplication=false
```

and then

```cmd
ng g app myApp
```

Pay attention that this is the workspace you are gonna test you schematics with. So bring it in the position that you can apply your changes.

Having done that: Commit! have a "clean" workspace. I am not saying to push it, just have the workspace clean that you can see what the schematic did. Checking the file changes is very easy like this.

Now you can link your schematic into your workspace to run it locally. Therefore run the `npm link` command _from the workspace you want to test on with the path to your `package.json` of the schematic without the `package.json` filename_.

```cmd
npm link path/to/my/schematics/packagejson
```

After linking it you can use the previously added `ng add` support.

```cmd
ng add my-first
```

After it ran through you can see what is has done in your workspace by comparing the differences with git for example.

_*Make sure to always build your schematic and execute `npm link <path>` before executing it again with `ng add` when testing new changes*_

## Turning the schematic in an nx plugin

At this point you should have a running schematic which does everything to your workspace as needed. Let us move this one into an nx plugin with the nx cli.

It would be helpful to get a feeling of nx plugins by reading this guide [https://nx.dev/angular/guides/nx-plugin](https://nx.dev/angular/guides/nx-plugin)

So we start off a blank ground by and create a new nx plugin with

```cmd
npx create-nx-plugin exampleorg --pluginName myFirstPlugin
```

this creates a workspace with a pre configured plugin called `my-first-plugin`. Inside of the `libs/my-first-plugin/src` folder you can see a `schematics` folder. This is where we gonna place our created schematic to turn it into an nx plugin.

> We will not cover how we can use the `builders` here beside the schematics. However the builders are very powerful and you should really consider taking a look at them in the link given above.

In the `libs\my-first-plugin\src\schematics\my-first-plugin\schematic.ts` file you can see a default function at the bottom which gets executed if the plugin is gonna be called

```js
export default function (options: MyFirstPluginSchematicSchema): Rule {
  return chain([
    /* actions */
  ]);
}
```

And the Nx Team provides incredibly useful methods like

```js
 updateWorkspace(workspace => {
      workspace.projects
        .add({
          name: normalizedOptions.projectName,
          root: normalizedOptions.projectRoot,
          sourceRoot: `${normalizedOptions.projectRoot}/src`,
          projectType
        })
        .targets.add({
          name: 'build',
          builder: '@exampleorg/my-first-plugin:build'
        });
    }),

```

or

```js
 addProjectToNxJsonInTree(normalizedOptions.projectName, {
      tags: normalizedOptions.parsedTags
    }),
```

Which we could use to achieve our goals with our schematic. However this time we gonna stick to what we have and just provide our existing schematic as an nx plugin.

First we can take the complete `actions` folder of our schematic and paste it into the `libs\my-first-plugin\src\schematics\my-first-plugin\` folder.

```
.
├── apps
│   ...
├── libs
│   ├── my-first-plugin
│   │   ├── src
│   │   │   ├── builders
│   │   │   │   └── ...
│   │   │   ├── schematics
│   │   │   │   └── my-first-plugin
│   │   │   │       ├── actions                     <<< paste this ...
│   │   │   │       │   ├── project-actions
│   │   │   │       │   │   ├── delete-project-files.ts
│   │   │   │       │   │   └── index.ts
│   │   │   │       │   ├── root-actions
│   │   │   │       │   │   ├── index.ts
│   │   │   │       │   │   └── update-angularjson.ts
│   │   │   │       │   └── index.ts                <<< ... w/ entry point
│   │   │   │       ├── files
│   │   │   │       │   └── ...
│   │   │   │       ├── schema.json
│   │   │   │       ├── schematic.spec.ts
│   │   │   │       └── schematic.ts
│   │   │   └── index.ts
│   │   ├── .eslintrc
│   │   ├── builders.json
│   │   ├── collection.json
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── tsconfig.lib.json
│   │   └── tsconfig.spec.json
│   └── .gitkeep
├── tools
│   ├── ...
├── ...
...
```

As we have defined an entry point in our schematic in the `index.ts` file

Code of `libs\my-first-plugin\src\schematics\my-first-plugin\actions\index.ts`

```js
import {
  chain,
  SchematicContext,
  Tree,
  SchematicsException,
} from '@angular-devkit/schematics';
import { getRulesForProjects } from './project-actions';
import { getRulesForWorkspaceRoot } from './root-actions';

export function executeSchematic(host: Tree, context: SchematicContext) {
  const workspace = getAngularWorkspace(host);

  const projectAndLibActions = getRulesForProjects();
  const workspaceActions = getRulesForWorkspaceRoot(workspace);
  const rulesToApply = [...projectAndLibActions, ...workspaceActions];

  return chain(rulesToApply);
}

export function getAngularWorkspace(tree: Tree) {
  const workspaceConfig = tree.read(`angular.json`);

  if (!workspaceConfig) {
    throw new SchematicsException(
      'Could not find Angular workspace configuration'
    );
  }

  const workspaceContent = workspaceConfig.toString();
  const workspace = JSON.parse(workspaceContent);

  return workspace;
}
```

We can call that one from the default function from our nx plugin.

Code of `libs\my-first-plugin\src\schematics\my-first-plugin\schematic.ts`

```js
import { Tree, Rule, SchematicContext } from '@angular-devkit/schematics';
import { MyFirstPluginSchematicSchema } from './schema';
import { executeSchematic } from './actions';

export default function (options: MyFirstPluginSchematicSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    return executeSchematic(host, context);
  };
}
```

Now merge the `collection.json`, too by adding `ng add` support

```json
{
  "$schema": "../../node_modules/@angular-devkit/schematics/collection-schema.json",
  "name": "my-first-plugin",
  "version": "0.0.1",
  "schematics": {
    "myFirstPlugin": {
      "factory": "./src/schematics/my-first-plugin/schematic",
      "schema": "./src/schematics/my-first-plugin/schema.json",
      "description": "my-first-plugin schematic"
    },
    "ng-add": {
      "description": "my-first-plugin schematic",
      "factory": "./src/schematics/my-first-plugin/schematic"
    }
  }
}
```

## Building your schematic locally

You can build your nx plugin with the nx command `nx build my-first-plugin`

```json
{
  //...
  "scripts": {
    //...
    "build:my:first:plugin": "nx build my-first-plugin"
    //...
  }
  //...
}
```

which will create a `dist` folder with your nx plugin.

## Testing the plugin locally

In general testing stays the same with the difference that we will use a nx workspace this time to test our schematic and we will use the artifact from our `dist` folder. but the commands stay the same.

So create an nx workspace as described on [https://nx.dev](https://nx.dev) and link your schematic with the `npm link` command and _use the path from your distribution from the nx plugin_.

Now you can see if it works or not and maybe modify it.

## Next Steps

At this point it would be nice to look at the amazing methods the nx team provides to us and maybe for your next schematic or nx plugin start with the scaffolded template immediately. The methods are really helpful. Consider taking a look!

## Releasing it to npm

If you want to release the plugin to npm you can use the npm commands as usual. Running `npm publish` from the `dist/<your-package>` folder. I can recommend you [https://www.npmjs.com/package/release-it](https://www.npmjs.com/package/release-it) to make the release process as smooth as possible. In my `package.json` I always have a release script like this

Code taken from [https://github.com/FabianGosebrink/nx-protractor-to-cypress](https://github.com/FabianGosebrink/nx-protractor-to-cypress)

```json
{
  "scripts": {
    "build:nx:protractor:to:cypress": "nx build nx-protractor-to-cypress && npm run copy:files",
    "build:nx:protractor:to:cypress:watch": "nx build nx-protractor-to-cypress -- --watch",
    "release:dryrun": "npm run release -- --dry-run",
    "release": "npm run build:nx:protractor:to:cypress && cd dist/libs/nx-protractor-to-cypress && release-it"
  }

  //...
}
```

That is it! I hope this journey did help you a bit.

Thanks for reading

Fabian
