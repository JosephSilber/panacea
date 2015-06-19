var _ = require('../utils');
var autoprefixer = require('gulp-autoprefixer');
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var rev = require('gulp-rev');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');

/**
 * Compile the options for this ingredient.
 *
 * @param  {string}       source
 * @param  {object|null}  options
 * @return {object}
 */
function compileOptions(options) {
    options = _.extend({
        source   : 'resources/assets/sass',
        manifest : 'storage/app/rev-manifest.json',
        publish  : 'public',
        output   : 'css',
        style    : 'compressed',
    }, options);

    options.source   = _.base(options.source);
    options.publish  = _.base(options.publish);
    options.clear    = _.join(options.publish, options.output);
    options.manifest = _.base(options.manifest);

    return options;
}

/**
 * Compile the SASS/SCSS file into a CSS file.
 *
 * @param  {object}  options
 * @return void
 */
function compileSass(options) {
    sass(options.source, { style: options.style, sourcemap: true })
        .pipe(plumber())
        .pipe(autoprefixer())
        .pipe(rename({ dirname: options.output }))
        .pipe(rev())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(options.publish))
        .pipe(rev.manifest(options.manifest, { merge: true }))
        .pipe(gulp.dest(_.base()));
}

/**
 * The "sass" ingredient.
 *
 * @param  {string}  source
 * @param  {object}  options
 * @return void
 */
module.exports = function(options) {
    options = compileOptions(options);

    _.clearDirectory(options.clear).then(function () {
        compileSass(options);
    });
};
