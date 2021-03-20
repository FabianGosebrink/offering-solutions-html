"use strict";
exports.__esModule = true;
var fs = require("fs-extra");
var tc = require("title-case");
var fileName = './homepage/data/talks.json';
var rawData = fs.readFileSync(fileName);
var allTalks = JSON.parse(rawData);
var replacements = [
    { from: 'asp.net', to: 'ASP.NET' },
    { from: 'angularjs', to: 'AngularJs' },
    { from: 'angular 2', to: 'Angular' },
];
var talksWithBetterTitle = allTalks.map(function (talk) {
    var title = talk.title, date = talk.date, event = talk.event, tags = talk.tags;
    var titleLowerCase = title.toLowerCase();
    replacements.forEach(function (_a) {
        var from = _a.from, to = _a.to;
        titleLowerCase = titleLowerCase.replace(from, to);
    });
    var newTitle = tc.titleCase(titleLowerCase);
    return {
        title: newTitle,
        date: date,
        event: event,
        tags: tags
    };
});
fs.writeJsonSync(fileName, talksWithBetterTitle);
