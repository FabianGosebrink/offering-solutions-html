import { paramCase } from 'change-case';
import * as fs from 'fs-extra';

const fileName = './homepage/data/talks.json';
const outputPath = './homepage/content/talks/';

let rawData = fs.readFileSync(fileName);
let allTalks = JSON.parse(rawData) as any[];

const replacements = [
  { from: 'ü', to: 'ue' },
  { from: 'ä', to: 'ae' },
  { from: 'ö', to: 'oe' },
];

allTalks.map(({ title, date, event, tags }) => {
  let titleLowerCase = title.toLowerCase();

  replacements.forEach(({ from, to }) => {
    titleLowerCase = titleLowerCase.replace(from, to);
  });

  const fileNameWithoutExt = paramCase(titleLowerCase);

  const filePath = `${outputPath}/${fileNameWithoutExt}.md`;

  fs.writeJsonSync(filePath, '');
});
