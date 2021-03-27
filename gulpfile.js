const { watch, series, src, dest } = require('gulp');

var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var htmlmin = require('gulp-htmlmin');
var path = require('path');
var styleInject = require("gulp-style-inject");
var stripCssComments = require('gulp-strip-css-comments');
var buildConfig = require('./gulp.config');

var buildWeb = series(
  concatCssFiles,
  webInjectCssInHtml,
  webMinifyHtml,
);

function concatCssFiles() {
  return src(buildConfig.vendor.allCss)
    .pipe(stripCssComments({ preserve: false }))
    .pipe(concat('all.min.css'))
    .pipe(cssmin())
    .pipe(dest(path.join(buildConfig.targets.tempFolder, 'css')));
}


function webInjectCssInHtml() {
  return src(path.join(buildConfig.targets.tempFolder, '**/*.html'))
    .pipe(styleInject())
    .pipe(dest('./'));
}

function webMinifyHtml() {
  return src(path.join(buildConfig.targets.tempFolder, '**/*.html'))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(dest('./'));
}


exports.default = buildWeb;
exports.buildWeb = buildWeb;
