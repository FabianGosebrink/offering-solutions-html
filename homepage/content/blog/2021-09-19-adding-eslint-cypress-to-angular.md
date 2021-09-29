---
title: Adding ESLint and Cypress to a new Angular Project
date: 2021-09-19
tags: ["angular", "eslint", "cypress"]
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blog post I want to describe how [Cypress](https://docs.cypress.io/guides/overview/why-cypress) and [ESLint](https://eslint.org/) can be added to a new Angular project.

Angular currently comes without any linting tool and without an end to end testing tool as [protractor](https://github.com/angular/protractor/issues/5502) is not included in Angular anymore and [TSLint](https://palantir.github.io/tslint/) is marked as deprecated.

As a replacement [Cypress](https://docs.cypress.io/guides/overview/why-cypress) and [ESLint](https://eslint.org/) jump into place to fill this gap. [Cypress](https://docs.cypress.io/guides/overview/why-cypress) is the go to tool for end to end testing here and [ESLint](https://eslint.org/) can replace the deprecated [TSLint](https://palantir.github.io/tslint/).

In this article we will cover how we can [Cypress](https://docs.cypress.io/guides/overview/why-cypress) and [ESLint](https://eslint.org/) to a new Angular Project. We will also briefly cover a migration from [TSLint](https://palantir.github.io/tslint/) to [ESLint](https://eslint.org/).

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

Doing this brings us the following folder structure:

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

Adding [ESLint](https://eslint.org/) is done easy by using the schematics [James Henry](https://twitter.com/MrJamesHenry) is doing on GitHub: [https://github.com/angular-eslint/angular-eslint](https://github.com/angular-eslint/angular-eslint)

Also this video helps a lot when migrating or adding [ESLint](https://eslint.org/) to your Angular project.

{{< youtube IDBdtQlugtw >}}

You can add [ESLint](https://eslint.org/) by using the schematics with

```cmd
ng add @angular-eslint/schematics
```

![Screenshot of console adding eslint initially](https://cdn.offering.solutions/img/articles/2021-09-30/1.jpg)

After you have done this your `package.json` is showing those changes. An `lint` script and the dependencies have been added.

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

If we now execute the `npm run lint` command we can see that [ESLint](https://eslint.org/) is being executed.

![Screenshot of console adding eslint initially](https://cdn.offering.solutions/img/articles/2021-09-30/1.jpg)

## Speeding up the process

In a project I found the speed of ESLint pretty slow so I searched around and found the recommendation to introduce a special `tsconfig.eslint.json` extending the normal `tsconfig.json` and only including the ts files.

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

If we now execute

### Removing TsSLint

If you have [TSLint](https://palantir.github.io/tslint/) in your project you can remove or migrate as mentioned in the video above. This is the cmd to do it. The specific parameters are explained on the [GitHub Repo](https://github.com/angular-eslint/angular-eslint)

```
ng g @angular-eslint/schematics:convert-tslint-to-eslint --remove-tslint-if-no-more-tslint-targets --ignore-existing-tslint-config
```

## Adding Cypress to a project

So there

https://www.npmjs.com/package/@cypress/schematic

`ng add @cypress/schematic`

pacakge.json

```
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

angular.json

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

```
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

###Finishing touches for cypress

https://www.npmjs.com/package/http-server
https://www.npmjs.com/package/concurrently

```
"cypress:open": "cypress open",
"cypress:run": "npm run build && concurrently \"npm run serve:dist\" \"cypress run\"",
"serve:dist": "http-server ./dist/angular-eslint-cypress -a localhost -p 4200 -c-1"
```
