---
title: How I Built a Simple Wordle Helper With Angular, Material and Reactive Forms
date: 2022-01-29
tags: ["angular"]
draft: false
category: blog
image: blog/aerial-view-of-laptop-and-notebook_bw_osc.jpg
---

In this blogpost I want to describe how I built a wordle helper with [Angular](https://angular.io/), [Angular Material](https://material.angular.io/) and [Angular Reactive Forms](https://angular.io/guide/reactive-forms) in approximately 4 hours.

[Wordle](https://www.powerlanguage.co.uk/wordle/) is a daily word game which provides a new word to guess every day. You have six tries to guess the daily word. Each correct character is marked yellow, if the character is on the correct place even it is marked green.

![Screenshot of a wordle](https://cdn.offering.solutions/img/articles/2021-09-30/3.png)

As I am not English native I really struggled with finding the correct words to solve the issues. So I thought that it must be possible to write an app which filters the words based on the words and characters that you already tried.

So with this blogpost I want to explain how I created such an app with Angular and Angular Material in a minimal valuable product style which is looking absolutely horrifying but which is doing it's job.

## First things first

I know that this UI looks absolutely ugly, but this is not what this is about. I just wanted to play around and get this challenge done :-). Also I know that this solution does not work anymore, when wordle changes the words to choose from. But other than that it works pretty fine and does it's job. So here we go.

## Getting the words

If we browse to [the wordle website](https://www.powerlanguage.co.uk/wordle/) and we examine the source code we can find that the source of the game is a simple array, two arrays to be more precise, of words.

![Screenshot of thw wordle source code and the arrays of words](https://cdn.offering.solutions/img/articles/2021-09-30/3.png)

I copied that two arrays, merged them into a single array and saved it into a file `words.ts`. This will be the foundation I will run the fitlers on.

> Yes, I know that when wordle changes this, my suggestions won't work anymore. But like already mentioned, this is not what it is about currently 🙂

## Creating the Angular App

So I ran

```
npx @angular/cli new wordle-helper
```

to create a new project and did run

```
ng add @angular/material
```

to add [Angular Material](https://material.angular.io/) to the page.

Then I did `ng generate @angular/material:navigation shell` to create a shell component giving me a starting point with the menu and some content area.

That is it for the basic layout.

## Creating the filter service

So when we see what we can provide wordle and what wordle does is: We provide characters, and wordle says:

- What carrecter is NOT in the word
- What character IS in the word but on the wrong index
- What character is at the correct index of the word

So the first two points can be solved with a simple `string[]`. The third one needs a type with a character and an index.

```ts
export interface IndexCharacter {
  character: string;
  index: number;
}
```

With those three steps to solve a wordle I created a service which had exactly those methods on it: `excludeChars(...)`, `includeChars(...)` and `filterWordByCharsOnCorrectPlace(...)`

```ts
import { Injectable } from "@angular/core";
import { CharacterIndexIncludes } from "./character-index-includes";
import { WORDS } from "./words";

@Injectable({
  providedIn: "root",
})
export class WordleHelperService {
  solve(
    excludeChars: string[],
    includeChars: string[],
    includeCharsWithIndex: CharacterIndexIncludes[]
  ): string[] {
    const words = WORDS;

    return this.filterWords(
      words,
      excludeChars,
      includeChars,
      includeCharsWithIndex
    );
  }

  private filterWords(
    words: string[],
    excludeChars: string[],
    includeChars: string[],
    includeCharsWithIndex: CharacterIndexIncludes[]
  ) {
    const wordsWithCharsExcluded = this.excludeChars(words, excludeChars);
    const wordsWithCharsIncluded = this.includeChars(
      wordsWithCharsExcluded,
      includeChars
    );

    return this.filterWordByCharsOnCorrectPlace(
      wordsWithCharsIncluded,
      includeCharsWithIndex
    );
  }

  //.. more code
}
```

In the `excludeChars(...)` method I pass in all of the words and the chars to exclude as a `string[]`. Then I check if a words does not contain any of the chars provided and filter by it. Of course I have to split the word into an array of chars with the `split()` method.

```ts
private excludeChars(words: string[], excludeChars: string[]): string[] {
    if (excludeChars.length === 0) {
        return words;
    }

    return words.filter(
        (word) => !this.wordContainsAnyOfChars(word, excludeChars)
    );
}

private wordContainsAnyOfChars(word: string, exludedChars: string[]) {
    return exludedChars.some((x) => this.wordContainsChar(word, x));
}

private wordContainsChar(word: string, char: string): boolean {
    return word.split('').includes(char);
}
```

The `includeChars(...)` method is also getting passed the list of all words and the characters to include. But here ALL include chars have to be present in the word.

```ts
private includeChars(words: string[], includeChars: string[]) {
    if (includeChars.length === 0) {
        return words;
    }

    return words.filter((word) =>
        this.wordContainsAllOfChars(word, includeChars)
    );
}

private wordContainsAllOfChars(word: string, exludedChars: string[]) {
    return exludedChars.every((x) => this.wordContainsChar(word, x));
}

...

private wordContainsChar(word: string, char: string): boolean {
    return word.split('').includes(char);
}

```

The next method is checking if a specific character is on a specific index. In the wordle this would be the green char. So the method takes all the words and an array of the `CharacterIndexIncludes` interface and then proceeds with that. The outcome should be an array of words which are then the result to display at the end.

```ts
  private filterWordByCharsOnCorrectPlace(
    filteredWords: string[],
    includeLettersOnCorrectPlace: CharacterIndexIncludes[]
  ): string[] {

    const filtered = filteredWords.map((word) => {
      const wordContainsEveryCharAtIndex = includeLettersOnCorrectPlace.every(
        ({ character, index }) =>
          this.containsCharAtIndex(word, character, index)
      );

      return wordContainsEveryCharAtIndex ? word : null;
    });

    return filtered.filter(Boolean);
  }

  private containsCharAtIndex(word: string, character: string, index: number) {
    const allCharsOfWord = word.split('');

    return allCharsOfWord[index] === character;
  }
```

The words are mapped into a new array containing either the word itself or null, if the word does not contain the char at the index. THe null values are filtered at the end with `return filtered.filter(Boolean);`.

And thats it. That is the logic to filter to wordle word list.
