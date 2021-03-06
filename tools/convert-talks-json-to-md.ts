import { paramCase } from "change-case";
import * as fs from "fs-extra";

const fileName = "./homepage/data/talks.json";
const outputPath = "./homepage/content/talks/";

let rawData = fs.readFileSync(fileName);
let allTalks = JSON.parse(rawData) as any[];

const filenameReplacements = [
  { from: "ü", to: "ue" },
  { from: "ä", to: "ae" },
  { from: "ö", to: "oe" },
];

const titleReplacements = [{ from: ":", to: "-" }];

allTalks.map(
  ({ title, date, event, tags, link, dataId, slides, youtube }, index) => {
    let titleLowerCase = title.toLowerCase();

    titleReplacements.forEach(({ from, to }) => {
      title = title.replace(from, to);
    });

    let content = "---";
    content = addLine(content, "title", title);
    content = addLine(content, "link", link);
    content = addLine(content, "date", date);
    content = addLine(content, "image", "speaking.jpg");
    content = addLine(content, "event", event);
    content = addLine(content, "tags", `[${tags}]`);
    content = addLine(content, "dataId", dataId);
    content = addLine(content, "slides", slides);
    content = addLine(content, "youtube", youtube);
    content = addLine(content, "category", "talks");
    content += "\r\n---";

    filenameReplacements.forEach(({ from, to }) => {
      titleLowerCase = titleLowerCase.replace(from, to);
    });

    const fileNameWithoutExt = paramCase(titleLowerCase);
    const fileIndex = allTalks.length - index;

    const filePath = `${outputPath}/${fileNameWithoutExt}-${fileIndex}.md`;

    fs.writeFileSync(filePath, content);
  }
);

function addLine(currentText: string, key: string, value: string) {
  if (!value) {
    return currentText;
  }

  return currentText + "\r\n" + key + ": " + value;
}
