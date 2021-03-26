import * as fs from 'fs-extra';
import * as tc from 'title-case';

const fileName = './homepage/data/talks.json';

let rawData = fs.readFileSync(fileName);
let allTalks = JSON.parse(rawData) as any[];

const replacements = [
  { from: 'asp.net', to: 'ASP.NET' },
  { from: 'angularjs', to: 'AngularJs' },
  { from: 'angular 2', to: 'Angular' },
];

const talksWithBetterTitle = allTalks.map((talk) => {
  const { title, date, event, tags } = talk;
  let titleLowerCase = title.toLowerCase();

  replacements.forEach(({ from, to }) => {
    titleLowerCase = titleLowerCase.replace(from, to);
  });

  const newTitle = tc.titleCase(titleLowerCase);
  return {
    ...talk,
    title: newTitle,
  };
});

fs.writeJsonSync(fileName, talksWithBetterTitle);
