---
title: Updating Nx Workspace from Karma Workspace to Jest
date: 2020-03-01
tags: ['angular', 'nx', 'karma', 'jest']
draft: false
category: blog
image: aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this article I want to describe how we can migrate an nx workspace with an angular application from karma to use jest, the test runner from facebook.

## TL;DR

1. Switch packages in `package.json`
2. Modify `angular.json` (`test` section & at the bottom)
3. Replace `karma.conf.js` with `jest.config.js` on root level
4. Replace content of `tsconfig.spec.json` in app folder
5. Replace `karma.conf.js` with `jest.config.js` on app level
6. Replace `test.ts` with `test-setup.ts` on app level

## Details

We will work with this workspace in this article:

```
├── apps
│   ├── myapp
│   │   ├── src
│   │   │   ├── app
│   │   │   │   ├── app.component.css
│   │   │   │   ├── app.component.html
│   │   │   │   ├── app.component.spec.ts
│   │   │   │   ├── app.component.ts
│   │   │   │   └── app.module.ts
│   │   │   ├── environments
│   │   │   │   ├── environment.prod.ts
│   │   │   │   └── environment.ts
│   │   │   ├── favicon.ico
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   ├── polyfills.ts
│   │   │   ├── styles.css
│   │   │   └── test.ts
│   │   ├── browserslist
│   │   ├── karma.conf.js
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.spec.json
│   │   └── tslint.json
├── .editorconfig
├── .gitignore
├── .prettierignore
├── .prettierrc
├── angular.json
├── karma.conf.js
├── nx.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── tslint.json
```

First thing to do is to delete all the pacakages not needed anymore from `jasmine` and `karma` in your `package.json`:

Please remove all of the mentioned here ...

```
{
  "name": "myworkspace",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    ...
  },
  "private": true,
  "dependencies": {
    ...
  },
  "devDependencies": {
    ...
    "karma": "~4.0.0",
    "karma-chrome-launcher": "~2.2.0",
    "karma-coverage-istanbul-reporter": "~2.0.1",
    "karma-jasmine": "~1.1.2",
    "karma-jasmine-html-reporter": "^0.2.2",
    "jasmine-core": "~2.99.1",
    "jasmine-spec-reporter": "~4.2.1",
    "@types/jasmine": "~2.8.8",
    ...
  }
}

```

... and replace them with the new packages used for `Jest`.

```
{
  "name": "myworkspace",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    ...
  },
  "private": true,
  "dependencies": {
    ...
  },
  "devDependencies": {
    ...
    "jest-preset-angular": "8.0.0",
    "@nrwl/jest": "9.0.4",
    "jest": "25.1.0",
    "@types/jest": "24.9.1",
    "ts-jest": "25.2.1"
    ...
  }
}
```

> Please be aware that these versions were the latest when writing this article.

Next switch to your `angular.json` and search for the `projects --> <nameofyourapp> --> architect --> test` section.

in my case it was this one

```
"test": {
    "builder": "@angular-devkit/build-angular:karma",
    "options": {
    "main": "apps/myapp/src/test.ts",
    "tsConfig": "apps/myapp/tsconfig.spec.json",
    "karmaConfig": "apps/myapp/karma.conf.js",
    "polyfills": "apps/myapp/src/polyfills.ts",
    "styles": [],
    "scripts": [],
    "assets": []
    }
}
```

replace it with this one

```
"test": {
    "builder": "@nrwl/jest:jest",
    "options": {
        "jestConfig": "apps/myapp/jest.config.js",
        "tsConfig": "apps/myapp/tsconfig.spec.json",
        "passWithNoTests": true,
        "setupFile": "apps/myapp/src/test-setup.ts"
    }
}
```

At the bottom of the `angular.json` there is still karma as `unitTestRunner` for your apps and libs...replace that with `jest`:

```
  "schematics": {
    "@nrwl/angular:application": {
      "unitTestRunner": "jest",
      "e2eTestRunner": "cypress"
    },
    "@nrwl/angular:library": {
      "unitTestRunner": "jest"
    }
  },
```

Now in the root of the directory create a new file called `jest.config.js` with this content:

```
module.exports = {
    testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
    transform: {
        '^.+\\.(ts|js|html)$': 'ts-jest'
    },
    resolver: '@nrwl/jest/plugins/resolver',
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageReporters: ['html']
};
```

and just delete the existing `karma.conf.js` in the root of your workspace.

```

├── apps
│ ├── myapp
│ ...
├── .editorconfig
├── .gitignore
├── .prettierignore
├── .prettierrc
├── angular.json
├── karma.conf.js // <--- Delete this
├── jest.config.js // <--- Add this
├── nx.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── tslint.json

```

That was it for the top level files.

Now let us concentrate on the `app` folder:

```
├── apps
│   ├── myapp
│   │   ├── src
│   │   │   ├── app
│   │   │   │   ...
│   │   │   ├── environments
│   │   │   │   ...
│   │   │   ├── favicon.ico
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   ├── polyfills.ts
│   │   │   ├── styles.css
│   │   │   └── test.ts
│   │   ├── browserslist
│   │   ├── karma.conf.js
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.spec.json
│   │   └── tslint.json
...
```

First of all replace the content of the `tsconfig.spec.json` with this:

```
{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "outDir": "../../dist/out-tsc",
        "module": "commonjs",
        "types": [
            "jest",
            "node"
        ]
    },
    "files": [
        "src/test-setup.ts"
    ],
    "include": [
        "**/*.spec.ts",
        "**/*.d.ts"
    ]
}
```

Next, delete the `karma.conf.js` again and add a new file called `jest.config.js` with this content:

```
module.exports = {
    name: 'myapp',
    preset: '../../jest.config.js',
    coverageDirectory: '../../coverage/apps/myapp',
    snapshotSerializers: [
        'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
        'jest-preset-angular/build/AngularSnapshotSerializer.js',
        'jest-preset-angular/build/HTMLCommentSerializer.js'
    ]
};
```

And as last step delete the `test.ts` inside of the `src` folder and add a new file called `test-setup.ts` with this content:

```
import 'jest-preset-angular';
```

Do not forget to run `npm install` because of the new packages :)

This is how your workspace should look like now:

```
.
├── apps
│   ├── myapp
│   │   ├── src
│   │   │   ├── app
│   │   │   │   ├── app.component.css
│   │   │   │   ├── app.component.html
│   │   │   │   ├── app.component.spec.ts
│   │   │   │   ├── app.component.ts
│   │   │   │   └── app.module.ts
│   │   │   ├── assets
│   │   │   │   └── .gitkeep
│   │   │   ├── environments
│   │   │   │   ├── environment.prod.ts
│   │   │   │   └── environment.ts
│   │   │   ├── favicon.ico
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   ├── polyfills.ts
│   │   │   ├── styles.css
│   │   │   └── test.ts
│   │   ├── browserslist
│   │   ├── jest.config.js
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.spec.json
│   │   └── tslint.json
│   ├── myapp-e2e
│   ...
├── libs
│   └── .gitkeep
├── .editorconfig
├── .gitignore
├── .prettierignore
├── .prettierrc
├── angular.json
├── jest.config.js
├── nx.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── tslint.json
```

If you now run `npm run test` you will see the following (or similar) output

```
C:\Users\Fabian\Desktop\moveToJest2\myworkspace>npm run test

> myworkspace@0.0.0 test C:\Users\Fabian\Desktop\moveToJest2\myworkspace
> ng test

 PASS  apps/myapp/src/app/app.component.spec.ts
  AppComponent
    √ should create the app (87ms)
    √ should have as title 'myapp' (41ms)
    √ should render title (53ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        3.399s
Ran all test suites.

C:\Users\Fabian\Desktop\moveToJest2\myworkspace>
```
