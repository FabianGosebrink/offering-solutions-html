---
title: Adding ESLint and Cypress to a New Angular Project
date: 2021-09-30
tags: ["angular", "eslint", "cypress"]
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to describe how [Cypress](https://docs.cypress.io/guides/overview/why-cypress) and [ESLint](https://eslint.org/) can be added to a new Angular project.

Angular currently comes without any linting tool and without an end to end testing tool as [protractor](https://github.com/angular/protractor/issues/5502) is not included in Angular anymore and [TSLint](https://palantir.github.io/tslint/) is marked as deprecated.

As a replacement [Cypress](https://docs.cypress.io/guides/overview/why-cypress) and [ESLint](https://eslint.org/) jump into place to fill this gap. [Cypress](https://docs.cypress.io/guides/overview/why-cypress) is the go to tool for end to end testing here and [ESLint](https://eslint.org/) can replace the deprecated [TSLint](https://palantir.github.io/tslint/).

In this article we will cover how we can add [Cypress](https://docs.cypress.io/guides/overview/why-cypress) and [ESLint](https://eslint.org/) to a new Angular Project. We will also briefly cover a migration from [TSLint](https://palantir.github.io/tslint/) to [ESLint](https://eslint.org/).

## TOC

- [Creating a new project](#creating-a-new-project)
- [Adding ESLint to an Angular Project](#adding-eslint-to-an-angular-project)
- [Speeding up the process](#speeding-up-the-process)
  - [Removing TSLint](#removing-tslint)
- [Adding Cypress to a project](#adding-cypress-to-a-project)
  - [Finishing touches for cypress](#finishing-touches-for-cypress)
- [Summary](#summary)

## Creating a new project

{{< tweet 1438590511137366018 >}}

With this tweet from Stephen Fluin I learned that if you always want to have the latest version of Angular when starting a new project, you can use

```cmd
npx @angular/cli new <my-project>
```

instead of the standard

```cmd
ng new <my-project>
```

Doing this brings us the following folder structure with the latest versios:

```cmd
├── src
│   └── ...
├── .browserslistrc
├── .editorconfig
├── .gitignore
├── angular.json
├── karma.conf.js
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```

At the time of writing the Angular Version is `12.2.0`. So we will ride with that for this post.

## Adding ESLint to an Angular Project

Adding [ESLint](https://eslint.org/) is done by using the schematics [James Henry](https://twitter.com/MrJamesHenry) is maintaining on GitHub: [https://github.com/angular-eslint/angular-eslint](https://github.com/angular-eslint/angular-eslint)

Also this video helps a lot when migrating or adding [ESLint](https://eslint.org/) to your Angular project.

{{< youtube IDBdtQlugtw >}}

You can add [ESLint](https://eslint.org/) by using the schematics with

```cmd
ng add @angular-eslint/schematics
```

![Screenshot of console adding eslint initially](https://cdn.offering.solutions/img/articles/2021-09-30/1.jpg)

After you have done this your `package.json` is showing those changes. A `lint` script and the dependencies have been added.

```json
{
  "name": "angular-eslint-cypress",
  "version": "0.0.0",
  "scripts": {
    // ...
    "lint": "ng lint"
  },
  "private": true,
  "dependencies": {
    // ...
  },
  "devDependencies": {
    // ...
    "@angular-eslint/builder": "12.5.0",
    "@angular-eslint/eslint-plugin": "12.5.0",
    "@angular-eslint/eslint-plugin-template": "12.5.0",
    "@angular-eslint/schematics": "12.5.0",
    "@angular-eslint/template-parser": "12.5.0",
    // ...
    "@typescript-eslint/eslint-plugin": "4.28.2",
    "@typescript-eslint/parser": "4.28.2",
    "eslint": "^7.26.0"
    // ...
  }
}
```

(I pointed out only the changes here).

The `angular.json` has changes as well. A `lint` property was added with the appropriate builders.

```json
{
  // ...
  "cli": {
    "defaultCollection": "@angular-eslint/schematics"
  },
  // ...
  "projects": {
    "angular-eslint-cypress": {
      // ...
      "architect": {
        "build": {
          // ...
        },
        "serve": {
          // ...
        },
        "extract-i18n": {
          // ...
        },
        "test": {
          // ...
        },
        "lint": {
          "builder": "@angular-eslint/builder:lint",
          "options": {
            "lintFilePatterns": ["src/**/*.ts", "src/**/*.html"]
          }
        }
      }
    }
  }
}
```

In the end a new `.eslintrc.json` was added as well containing all the rules.

```cmd
.
├── src
│   └── ...
├── .browserslistrc
├── .editorconfig
├── .eslintrc.json  // <-- Was added!
├── .gitignore
├── angular.json
├── karma.conf.js
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```

You can now apply rules from `@angular-eslint/`, `@typescript-eslint/...` or the standard rules from ESLint.

```json
{
  // ...
    "rules": {
        "@angular-eslint/...": [...],
        "@typescript-eslint/...": [...],
        "newline-before-return": "error",
        "max-len": "off",
        "no-useless-constructor": "off",
    }

  // ...
}

```

If we now run the `npm run lint` command we can see that [ESLint](https://eslint.org/) is being run.

![Screenshot of console executing eslint](https://cdn.offering.solutions/img/articles/2021-09-30/2.jpg)

## Speeding up the process

In a project I am working on I found the speed of ESLint pretty slow so I searched around and found the recommendation to introduce a separate `tsconfig.eslint.json` extending the normal `tsconfig.json` and only including the ts files.

`tsconfig.eslint.json`

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts"]
}
```

In the `.eslintrc.json` you can now use this file instead of the current one:

```json
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "parserOptions": {
        "project": ["tsconfig.eslint.json"],
        "createDefaultProgram": true
      }
      // ...
    }
    // ...
  ]
}
```

### Removing TSLint

If you have [TSLint](https://palantir.github.io/tslint/) in your project you can remove or migrate as mentioned in the video above. This is the cmd to do it. The specific parameters are explained on the [GitHub Repo](https://github.com/angular-eslint/angular-eslint)

```
ng g @angular-eslint/schematics:convert-tslint-to-eslint --remove-tslint-if-no-more-tslint-targets --ignore-existing-tslint-config
```

## Adding Cypress to a project

So there is the end to end testing left. For this we will introduce and use [Cypress](https://docs.cypress.io/guides/overview/why-cypress) to rely on the latest toolset and best integration.

We can find the schematic to add [Cypress](https://docs.cypress.io/guides/overview/why-cypress) on [npm](https://www.npmjs.com/package/@cypress/schematic) and/or [GitHub](https://github.com/cypress-io/cypress)

We add cypress by executing

```cmd
ng add @cypress/schematic
```

![Screenshot of console adding cypress](https://cdn.offering.solutions/img/articles/2021-09-30/3.jpg)

After having done this we find the following changes in our repo:

The `package.json` has been updated in the `scripts` and `dependencies` sections.

`package.json`

```json
{
  "name": "angular-eslint-cypress",
  "version": "0.0.0",
  "scripts": {
    // ...
    "e2e": "ng e2e",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  },
  "private": true,
  "dependencies": {
    // ...
  },
  "devDependencies": {
    // ...
    "@cypress/schematic": "^1.5.1",
    // ...
    "typescript": "~4.3.5",
    "cypress": "8.5.0"
  }
}
```

In the `angular.json` the `cypress-run`, `cypress-open` and `e2e` properties have been added as well.

`angular.json`

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "cli": {
    // ...
  },
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "angular-eslint-cypress": {
      // ...
      "architect": {
        "build": {
          // ...
        },
        "serve": {
          // ...
        },
        "extract-i18n": {
          // ...
        },
        "test": {
          // ...
        },
        "lint": {
          // ...
        },
        "cypress-run": {
          "builder": "@cypress/schematic:cypress",
          "options": {
            "devServerTarget": "angular-eslint-cypress:serve"
          },
          "configurations": {
            "production": {
              "devServerTarget": "angular-eslint-cypress:serve:production"
            }
          }
        },
        "cypress-open": {
          "builder": "@cypress/schematic:cypress",
          "options": {
            "watch": true,
            "headless": false
          }
        },
        "e2e": {
          "builder": "@cypress/schematic:cypress",
          "options": {
            "devServerTarget": "angular-eslint-cypress:serve",
            "watch": true,
            "headless": false
          },
          "configurations": {
            "production": {
              "devServerTarget": "angular-eslint-cypress:serve:production"
            }
          }
        }
      }
    }
  }
}
```

If we look at the folder structure a complete `cypress` folder was added, where our tests can take place, and a `cypress.json` for the configuration has been added.

```cmd
.
├── cypress  // <-- Complete Folder was added!
│   ├── integration
│   │   └── spec.ts
│   ├── plugins
│   │   └── index.ts
│   ├── support
│   │   ├── commands.ts
│   │   └── index.ts
│   └── tsconfig.json
├── src
│   └── ...
├── .browserslistrc
├── .editorconfig
├── .eslintrc.json
├── .gitignore
├── angular.json
├── cypress.json  // <-- Was added!
├── karma.conf.js
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```

### Finishing touches for cypress

To run cypress we have to start the local Angular application on `http://localhost:4200` as well and in parallel start the cypress runner to reach the site under where it is living.

We can do this by installing a small `http-server` [https://www.npmjs.com/package/http-server](https://www.npmjs.com/package/http-server) and run it in parallel to either the dist build (`cypress:run`) or the dev build (`cypress:open`). To run commands in parallel we can install the package [concurrently](https://www.npmjs.com/package/concurrently). Now we can modify the commands as below:

`package.json`

```json
"cypress:open": "concurrently \"npm start\" \"cypress open\"",
"cypress:run": "npm run build && concurrently \"npm run serve:dist\" \"cypress run\"",
"serve:dist": "http-server ./dist/angular-eslint-cypress -a localhost -p 4200 -c-1"
```

## Summary

In this blog post we saw how we can start an Angular application and add the latest tools of end to end testing and linting to it.

I hope this helped!

Fabian
