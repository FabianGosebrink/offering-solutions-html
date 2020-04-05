---
title: TBD
date: 2020-03-24
tags: ['nx', 'plugin']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blogpost I would like to explain how you can write a schematic and turn it into an nx plugin or turn an existing schematic into an nx plugin.

There are a lot of blogposts out there which deal with how you can get started writing a schematic in much more detail as we do not cover this here one more time in depth. Be sure to check out:

- [https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2)
- [https://brianflove.com/2018/12/11/angular-schematics-tutorial/](https://brianflove.com/2018/12/11/angular-schematics-tutorial/)
- [https://medium.com/@tomastrajan/total-guide-to-custom-angular-schematics-5c50cf90cdb4](https://medium.com/@tomastrajan/total-guide-to-custom-angular-schematics-5c50cf90cdb4)

We will however cover the get started things.

In general a schematic can help you to create, move, delete, ... files automatically for you. it can help you to stay organised and automates tasks you would normally do manually inside your angular project or workspace. Schematics are pretty powerful and the possibilities are endless.

in the following we are going to

1. Create our first schematic
2. Turn it into an nx plugin
3. Test it locally
4. Release it to npm

## Creating a schematic

After installing the `@angular-devkit/schematics-cli` we can work with the cli command globally and execute `schematics` where we want to. If we want to create a schematic we can run

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

The `Tree` is like the projection of a workspace, an AngularCLI workspace for example. So with providing methods like `create(...)`, `delete(...)`, `exists(...)`, `overwrite(...)` etc. it is possible to modify the workspace the schematic is running on and move files around. Perfect fit.

But take a closer look. The method `myFirst()` is returning a `Rule`. What is getting returned is another anonymous function taking the `Tree` and a `context` as parameter and returning the unmodified `Tree` again.

That works, because if we take a deeper look the `Rule` type is specified as this

```
Rule = (tree: Tree, context: SchematicContext) => Tree | Observable<Tree> | Rule | Promise<void> | Promise<Rule> | void;
```

Perfect, let us think about what we want to achieve here.

## Separating into smaller actions

I was doing a schematic lately (which we will get to later on) but basically every schematic is made of several steps.

**Think about these steps first!!!**

So make a list of which actions should be performed, because this has a direct influence of what we are going to write down in code!

Because beside returning a single `Rule` we can also chain them as the `@angular-devkit/schematics` package is providing methods to combine rules and so on.

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
    // modifiying the tree in several rules
    return chain(arrayOfRules);
  };
}
```

See where this is gonna lead us? With `chain()` we have the possibility to run several rules one after another. That is a perfect fir if we want to break our task into smaller actions!

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

Now let us extract the inner code into a method to the new created `actions/index.ts` file and call it from the existing outter `my-first/index.ts` file.

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
  // modifiying the tree in several rules
  return chain(arrayOfRules);
}
```

> The abstraction on this level makes it easier to migrate to a nx plugin later.

Now think about the actions you have to perform based on what you schematic should do. For me there are two types of actions. Those who are modifying the root workspace (files like the angular.json for general properties or root files which are _not_ inside a specific project) and actions which are transforming files which exist in a specific project or `angular.json` but _for one or multiple specific projects_.

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

## Build specific Actions

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

inside the files we are exporting a function which exports a `Rule` again getting passed the parametes we get given from the schematic itself

Code of `delete-project-files.ts`

```js
export function deleteProjectFiles(/* Params _you_ want to give in */): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // modify the Tree with tree.delete(path);
    // or whatever you want to do in the action :-)

    return tree;
  };
}
```

and in the `project-actions/index.ts` file we give it a point where all the actions are gonna be collected and put in order:

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

> The `project-actions/index.ts` file is the place where you can iterate over all the project actions and execute them _per project_.

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

The code of the corresponsing index file is closely the same

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

in the `actions/index.ts` file we are collection the actions from `project-actions` and `root-actions` now and call the `chain()` method with the actions as param.

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

and from the `my-first/index.ts` file we only have to call our new created method like this:

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

## Testing your schematic locally

## Turning the schematic in an nx plugin
