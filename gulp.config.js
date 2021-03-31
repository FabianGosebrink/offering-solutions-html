'use strict';

module.exports = {
    vendor: {
        allCss: [
            'homepage/themes/forty/static/css/fontawesome-all.min.css',
            'homepage/themes/forty/static/css/main.css',
            'homepage/static/css/custom.css',
            'homepage/static/css/scrolling.css',
        ],
    },
    targets: {
        distributionFolder: '.dist/',
        hugoFolder: 'homepage/static/',
        tempFolder: '.temp/'
    }
};