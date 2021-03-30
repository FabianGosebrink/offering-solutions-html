'use strict';

module.exports = {
    vendor: {
        allJs: [
            './src/js/jquery.min.js',
            './src/js/plugins.js',
            './src/js/custom.js',
            './src/js/loadBlog.js'
        ],
        allCss: [
            '.temp/css/fontawesome-all.min.css',
            '.temp/css/main.css',
            '.temp/css/custom.css',
            '.temp/css/scrolling.css',
        ],
    },
    targets: {
        distributionFolder: '.dist/',
        root: '',
        tempFolder: '.temp/'
    }
};