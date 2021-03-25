import { camelCase } from 'change-case';
import * as fs from 'fs-extra';

const fileName = './homepage/data/talks.json';
const outputPath = './homepage/content/talks/';

let rawData = fs.readFileSync(fileName);
let allTalks = JSON.parse(rawData) as any[];

allTalks.map(({ title, date, event, tags }) => {
  let titleLowerCase = title.toLowerCase();

  const fileNameWithoutExt = camelCase(titleLowerCase);

  const filePath = `${outputPath}/${fileNameWithoutExt}.md`;

  fs.writeJsonSync(filePath, '');
});
