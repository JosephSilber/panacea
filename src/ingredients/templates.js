var promisify = require('es6-promisify');
var _ = require('../utils');
var fs = require('fs');
var glob = promisify(require('glob'));
var readFile = promisify(fs.readFile);

/**
 * Compile the options for this ingredient.
 *
 * @param  {string}       source
 * @param  {object|null}  options
 * @return {object}
 */
function compileOptions(source, options) {
    options = _.extend({
        base    : 'resources/views',
        output  : 'resources/assets/json/templates.json',
        divider : '.',
    }, options);

    options.source = _.base(options.base, source);
    options.output = _.base(options.output);

    if ( ! _.endsWith(options.source, '/')) {
        options.source += '/';
    }

    return options;
}

/**
 * Compile templates into a target JSON file.
 *
 * @param  {object}  options
 * @return void
 */
function compileTemplates(options) {
    glob(_.join(options.source, '**/*.html'))
        .then(generateTemplates.bind(this, options))
        .then(saveTemplates.bind(this, options));
}

/**
 * Generate the template key/value map.
 *
 * @param  {object}  options
 * @param  {array}   files
 * @return {Promise}
 */
function generateTemplates(options, files) {
    if ( ! files.length) return Promise.resolve({});

    var templates = {};

    var promises = files.map(function(file) {
        return readFile(file, 'utf-8').then(function(contents) {
            templates[getTemplateKey(options, file)] = contents;
        });
    });

    return Promise.all(promises).then(function() {
        return templates;
    });
}

/**
 * Get the template key for the given file.
 *
 * @param  {object}  options
 * @param  {string}  file
 * @return {string}
 */
function getTemplateKey(options, file) {
    // We'll trim off the leading base path, as well as the trailing ".html" strings.
    // Then we will replace the slashes with the specified divider. This will make
    // it very easy for the developers to reference the templates by their key.
    var key = file.substring(options.source.length, file.length - 5);

    return key.replace(/\//g, options.divider);
}

/**
 * Save the generated templates to a JSON file.
 *
 * @param  {object}  options
 * @param  {object}  templates
 * @return void
 */
function saveTemplates(options, templates) {
    var contents = JSON.stringify(templates);

    fs.writeFile(options.output, contents, 'utf-8');
}

/**
 * The "templates" ingredient.
 *
 * @param  {string}  source
 * @param  {object}  options
 * @return void
 */
module.exports = function(source, options) {
    options = compileOptions(source, options);

    compileTemplates(options);
};
