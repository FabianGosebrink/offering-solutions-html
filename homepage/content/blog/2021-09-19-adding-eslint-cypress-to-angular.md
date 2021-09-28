---
title: Adding ESLint and Cypress to a new Angular Project
date: 2021-09-19
tags: ["angular", "eslint", "cypress"]
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

## Creating a new project

npx @angular/cli new <my-project>

```
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

## Adding ESLint to an Angular Project

https://github.com/angular-eslint/angular-eslint

```
ng add @angular-eslint/schematics
```

Screenshot 1

package.json

```
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
    "eslint": "^7.26.0",
    // ...
  }
}

```

angular.json

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

```
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

## Speeding up the process

FOR ME

tsconfig.eslint.json

```
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts"]
}
```

I

### Removing TsLint

```
ng g @angular-eslint/schematics:convert-tslint-to-eslint --remove-tslint-if-no-more-tslint-targets --ignore-existing-tslint-config
```

## Adding Cypress to a project

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
