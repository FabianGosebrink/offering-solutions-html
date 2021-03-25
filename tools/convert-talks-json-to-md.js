"use strict";
exports.__esModule = true;
var change_case_1 = require("change-case");
var fs = require("fs-extra");
var fileName = './homepage/data/talks.json';
var outputPath = './homepage/content/talks/';
var rawData = fs.readFileSync(fileName);
var allTalks = JSON.parse(rawData);
allTalks.map(function (_a) {
    var title = _a.title, date = _a.date, event = _a.event, tags = _a.tags;
    var titleLowerCase = title.toLowerCase();
    var fileNameWithoutExt = change_case_1.paramCase(titleLowerCase);
    var filePath = outputPath + "/" + fileNameWithoutExt + ".md";
    fs.writeJsonSync(filePath, '');
});
