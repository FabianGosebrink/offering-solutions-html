"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    return __assign(__assign({}, talk), { title: newTitle });
});
fs.writeJsonSync(fileName, talksWithBetterTitle);
