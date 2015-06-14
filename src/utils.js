var promisify = require('es6-promisify');
var del = promisify(require('del'));
var extend = require('extend');
var glob = promisify(require('glob'));
var path = require('path');

/**
 * Get the base path, joining on any provided segments.
 *
 * @param {string}  ...path
 * @return {string}
 */
function base() {
    var segments = Array.prototype.slice.call(arguments, 0);

    segments.unshift(process.cwd());

    return join.apply(this, segments);
}

/**
 * Join the given paths.
 *
 * @param  {string}  ...path
 * @return {string}
 */
function join() {
    var path = Array.prototype.join.call(arguments, '/');

    return path.replace('/\/{2,}/', '/').replace(/\/$/, '');
}

/**
 * Clear the compiled files for the given file.
 *
 * @param  {string}  file
 * @return {Promise}
 */
function clear(file) {
    var extension = path.extname(file);
    var replace = new RegExp(escapeRegExp(extension));
    var verify = getVerifyRegex(file, extension, replace);

    return glob(file.replace(replace, '-*')).then(function(files) {
        var promises = [];

        files.forEach(function(file) {
            if ( ! verify.test(file)) return;

            promises.push(del(file));
        });

        return Promise.all(promises);
    });
}

/**
 * Get the regex used to verify if a file should be deleted.
 *
 * @param  {string}  file
 * @param  {string}  extension
 * @param  {RegExp}  replace
 * @return {RegExp}
 */
function getVerifyRegex(file, extension, replace) {
    var base = escapeRegExp(file.replace(/\\/g, '/').replace(replace, ''));

    extension = escapeRegExp(extension);

    return new RegExp(base + '-[a-z0-9]{10}' + extension + '(?:.map)?');
}

/**
 * Escape a string to be used in a regex.
 *
 * http://stackoverflow.com/questions/3446170
 *
 * @param  {string}  string
 * @return {string}
 */
function escapeRegExp(string) {
  return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * Determine if a given string ends with a given substring.
 *
 * @param  {string}  string
 * @param  {string}  suffix
 * @return {bool}
 */
function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

module.exports = {
    base       : base,
    clear      : clear,
    endsWith   : endsWith,
    extend     : extend,
    join       : join,
};
