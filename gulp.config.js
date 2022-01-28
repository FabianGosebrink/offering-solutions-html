"use strict";

module.exports = {
  vendor: {
    allCss: [
      "homepage/themes/forty/static/css/main.css",
      "homepage/static/css/custom.css",
      "homepage/static/css/scrolling.css",
      "homepage/static/css/counter.css",
    ],
  },
  targets: {
    distributionFolder: ".dist/",
    hugoFolder: "homepage/static/",
    tempFolder: ".temp/",
  },
};
