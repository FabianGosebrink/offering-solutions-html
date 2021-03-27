'use strict';

const shell = require('shelljs');

const OUTPUT_TEMP_PATH = '.temp';
const OUTPUT_DIST_PATH = '.dist';
const OUTPUT_DIST_CDN_PATH = 'dist-cdn';
const OUTPUT_DIST_BLOG_PATH = 'dist-blog';

const distCdnFiles = [
    {
        source: `${OUTPUT_TEMP_PATH}/js`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_CDN_PATH}`
    },
    {
        source: `${OUTPUT_TEMP_PATH}/webfonts`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_CDN_PATH}`
    },
     {
        source: `${OUTPUT_TEMP_PATH}/img`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_CDN_PATH}`
    },
     {
        source: `${OUTPUT_TEMP_PATH}/index.json`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_CDN_PATH}`
    }
]

const distBlogFiles = [
    {
        source: `${OUTPUT_TEMP_PATH}/blog`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_BLOG_PATH}`
    },
     {
        source: `${OUTPUT_TEMP_PATH}/categories`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_BLOG_PATH}`
    },
     {
        source: `${OUTPUT_TEMP_PATH}/tags`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_BLOG_PATH}`
    },
     {
        source: `${OUTPUT_TEMP_PATH}/talks`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_BLOG_PATH}`
    },
     {
        source: `${OUTPUT_TEMP_PATH}/newsletter`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_BLOG_PATH}`
    },
     {
        source: `${OUTPUT_TEMP_PATH}/trainings`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_BLOG_PATH}`
    },
     {
        source: `${OUTPUT_TEMP_PATH}/impressum`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_BLOG_PATH}`
    },
     {
        source: `${OUTPUT_TEMP_PATH}/*.*`,
        destination: `${OUTPUT_DIST_PATH}/${OUTPUT_DIST_BLOG_PATH}`
    }
]

shell.echo('Start building site');

// DELETE TEMP FOLDER
shell.rm('-rf', `${OUTPUT_TEMP_PATH}`);
shell.rm('-rf', `${OUTPUT_DIST_PATH}`);
shell.echo('Deleted dist folders...');

// BUILD 
const buildCommand = `hugo --source=./homepage --destination=../${OUTPUT_TEMP_PATH}`;
shell.exec(buildCommand);

// MINIFY WITH GULP 
const gulpBuildWebCommand = `gulp buildWeb`;
shell.exec(gulpBuildWebCommand);

// COPY DIST CDN
shell.echo('Copy Dist CDN...');
distCdnFiles.forEach(({source, destination}) => {
    shell.mkdir('-p', destination);
    shell.cp('-r', source, destination);
})

// COPY DIST CDN
shell.echo('Copy Dist Blog...');
distBlogFiles.forEach(({source, destination}) => {
    shell.mkdir('-p', destination);
    shell.cp('-r', source, destination);
})

