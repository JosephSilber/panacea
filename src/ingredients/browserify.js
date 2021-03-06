var _ = require('../utils');
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var rev = require('gulp-rev');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

/**
 * Compile the options for this ingredient.
 *
 * @param  {string}       source
 * @param  {object|null}  options
 * @return {object}
 */
function compileOptions(file, options) {
    options = _.extend({
        base     : 'resources/assets/js',
        manifest : 'storage/app/rev-manifest.json',
        prefix   : 'js',
        publish  : 'public',
    }, options);

    options.name     = _.join(options.prefix, file);
    options.source   = _.base(options.base, file);
    options.publish  = _.base(options.publish);
    options.manifest = _.base(options.manifest);
    options.clear    = _.join(options.publish, options.name);

    return options;
}

/**
 * Use browserify to compile the scripts.
 *
 * @param  {object}  options
 * @return void
 */
function compileScripts(options) {
    browserify({
        entries   : options.source,
        transform : [babelify],
        debug     : true,
    }).bundle().on('error', gutil.log)
        .pipe(source(options.name))
        .pipe(buffer())
        .pipe(plumber())
        .pipe(rev())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(options.publish))
        .pipe(rev.manifest(options.manifest, { merge : true }))
        .pipe(gulp.dest(_.base()));
}

/**
 * The "browserify" ingredient.
 *
 * @param  {string}  file
 * @param  {object}  options
 * @return void
 */
module.exports = function(file, options) {
    options = compileOptions(file, options);

    _.clear(options.clear).then(function () {
        compileScripts(options);
    });
};
