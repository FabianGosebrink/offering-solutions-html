"use strict";
exports.__esModule = true;
var change_case_1 = require("change-case");
var fs = require("fs-extra");
var fileName = './homepage/data/talks.json';
var outputPath = './homepage/content/talks/';
var rawData = fs.readFileSync(fileName);
var allTalks = JSON.parse(rawData);
var filenameReplacements = [
    { from: 'ü', to: 'ue' },
    { from: 'ä', to: 'ae' },
    { from: 'ö', to: 'oe' },
];
var titleReplacements = [{ from: ':', to: '-' }];
allTalks.map(function (_a) {
    var title = _a.title, date = _a.date, event = _a.event, tags = _a.tags, link = _a.link, dataId = _a.dataId, slides = _a.slides;
    var titleLowerCase = title.toLowerCase();
    titleReplacements.forEach(function (_a) {
        var from = _a.from, to = _a.to;
        title = title.replace(from, to);
    });
    var content = '---';
    content = addLine(content, 'title', title);
    content = addLine(content, 'link', link);
    content = addLine(content, 'date', date);
    content = addLine(content, 'image', 'speaking.jpg');
    content = addLine(content, 'event', event);
    content = addLine(content, 'tags', "[" + tags + "]");
    content = addLine(content, 'dataId', dataId);
    content = addLine(content, 'slides', slides);
    content = addLine(content, 'category', 'talks');
    content += '\r\n---';
    filenameReplacements.forEach(function (_a) {
        var from = _a.from, to = _a.to;
        titleLowerCase = titleLowerCase.replace(from, to);
    });
    var fileNameWithoutExt = change_case_1.paramCase(titleLowerCase);
    var filePath = outputPath + "/" + fileNameWithoutExt + "-" + makeId(5) + ".md";
    fs.writeFileSync(filePath, content);
});
function addLine(currentText, key, value) {
    if (!value) {
        return currentText;
    }
    return currentText + '\r\n' + key + ': ' + value;
}
function makeId(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
