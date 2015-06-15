# Panacea

- [Introduction](#introduction)
- [Motivation](#motivation)
- [Installation](#installation)
- [Usage](#usage)
- [Sample Gulp File](#sample-gulp-file)
- [Laravel Helper](#laravel-helper)
- [License](#license)

## Introduction

Panacea provides a clean API for your Gulp tasks, with some nice predefined mixins.

## Motivation

Back in the day, I used to write a new gulpfile for every new project. This was obviously very tedious and extremely inefficient. Then I discovered the excellent [Laravel Elixir](https://github.com/laravel/elixir), and I immediately knew that this is the right way going forward: extract the common build steps we do for every project into its own little package and reuse it across different projects.

Unfortunately, while trying to use Elixir I discovered that it simply does not fit my workflow. Here's a non-exhaustive list of things that didn't quite click with me:

- Using a `build` directory to store the versioned assets.
- Having both the non-versioned and versioned files be compiled to the filesystem.
- Having the `rev-manifest.json` published in the `public` directory.
- Having many hardcoded paths, which makes its use outside of Laravel nigh impossible.

I have some other small gripes, but the main one is simply my workflow. While Elixir prioritizes extremely consice code over all else, I personally prefer a little more verbosity and a little more explicitness: I like naming my gulp tasks myself, and at times trigger them separately. I also like to set up my watchers exactly the way I want them.

This led me to create this package for my own personal use. For most people, Elixir is more than fine. Excellent even. If for some odd reason you share my particular taste in this matter, come along for the ride...

## Installation

Installation is via the standard `npm install` command:

    npm install --save-dev panacea-assets

If you're using [Laravel](http://laravel.com), you may also want to use [the `panacea` helper](#laravel-helper) function.

## Usage

Panacea currently ships with 3 ingredients + a simple watcher:

- [browserify](#browserify)
- [sass](#sass)
- [templates](#templates)
- [watch](#watch)

### Basic usage

Use Panacea by registering tasks with it:

```js
var panacea = require('panacea-assets');

panacea.task('css', function(mix) {
    // mix your ingredients here...
});

panacea.task('js', function(mix) {
    // mix your ingredients here...
});
```

This syntax is very similar to gulp's `task` method, and actually calls `gulp.task()` internally. You can them simply trigger it with `gulp css` or `gulp js`.

Of course, just like with Gulp, you may pass an array as a task and Panacea will register a new Gulp task that comprises the tasks listed in the array:

```js
panacea.task('build', [
    'css',
    'js',
]);
```

Calling `gulp build` will now trigger the two previously registered tasks.

You may also register multiple tasks at once, by passing an object to the `tasks` method:

```js
panacea.tasks({
    css: function(mix) {
        // mix your css ingredients here...
    },
    js: function(mix) {
        // mix your js ingredients here...
    },
});
```

### browserify

The `browserify` ingredient runs your JavaScript files through [Browserify](http://browserify.org/), packaging it up for distribution to the browser in a single file:

```js
var panacea = require('panacea-assets');

panacea.task('js', function(mix) {
    mix.browserify('app.js');
});
```

This will look for the `resources/assets/js/app.js` file, and compile it to `public/js/app.js`. In the process, the file will be passed through Babel for ES6 compilation, minified, versioned and sourcemapped.

### sass

The `sass` ingredient compiles your `sass`/`scss` files into valid `css`:

```js
var panacea = require('panacea-assets');

panacea.task('css', function(mix) {
    mix.sass('app.scss')
});
```

This will look for the `resources/assets/sass/app.scss` file, and compile it to `public/css/app.css`. In the process, the file will be minified, versioned and sourcemapped.

> **Note:** The `sass` ingredient uses ruby sass, so be sure to [have that installed](http://sass-lang.com/install).

### templates

The `templates` ingredient compiles all your HTML templates into a simple JSON file, which you can then `require` in your JavaScript code.

```js
var panacea = require('panacea-assets');

panacea.task('templates', function(mix) {
    mix.templates('templates')
});
```

This will look for HTML files in the `resources/views/templates` directory and compile them all into a single JSON file at `resources/assets/json/templates.json`.

> **Note:** Directory separators will by default be converted to a `.` separator. For example, a template file at `templates/users/index.html` will be accessible under the `users.index` key in the compiled JSON file.

Here you can see a prettified example of the compiled `templates.json` file:

```json
{
    "users.index": "Contents of views/templates/users/index.html",
    "users.show": "Contents of views/templates/users/show.html"
}
```

Here's a simple example of how you might consume the resulting JSON file, using [browserify](#browserify):

```js
// resources/assets/js/templates.js

var templates = require('../json/templates.json');

module.exports = function getTemplate(template) {
    if ( ! templates.hasOwnProperty(template)) {
        throw new Error('The "' + template + '" template does not exist.');
    }

    return templates[template];
}
```

You can then simply require any template in your JS files:

```js
// resources/assets/js/templates.js

var getTemplate = require('./templates.js');

Vue.component('users', {
    template: getTemplate('users.index'),
});
```

### watch

The `watch` ingredient is a simple passthru to Gulp's `watch` function. It has been added to the Panacea ingredients for simple convenience.

## Sample Gulp File

For reference, [here is the basis of the `gulpfile.js` I usually use](https://github.com/JosephSilber/panacea/blob/master/gulpfile.example.js) for my projects:

```js
var panacea = require('panacea-assets');

panacea.tasks({

    views: function (mix) {
        mix.templates('templates');
    },

    css: function (mix) {
        mix.sass('app.scss');
    },

    js: function (mix) {
        mix.browserify('app.js');
    },

    watch: function (mix) {
        mix.watch('resources/views/templates/**/*.html', ['views', 'js']);
        mix.watch('resources/assets/sass/**/*.scss', ['css']);
        mix.watch('resources/assets/js/**/*.js', ['js']);
    },

    build: [
        'css',
        'views',
        'js',
    ],

    'default': [
        'build',
        'watch',
    ],

});

```

## Laravel Helper

If you're using Panacea with Laravel, you may want to use the following helper. It works very similar to [the Elixir helper](http://laravel.com/docs/5.1/elixir#versioning-and-cache-busting) provided with Laravel out-of-the-box:

```php
if ( ! function_exists('panacea')) {
    /**
     * Get the path to a versioned Panacea file.
     *
     * @param  string  $file
     * @return string
     */
    function panacea($file)
    {
        static $manifest = null;

        if (is_null($manifest)) {
            $manifest = json_decode(file_get_contents(storage_path('app/rev-manifest.json')), true);
        }

        if (array_key_exists($file, $manifest)) {
            return url($manifest[$file]);
        }

        throw new InvalidArgumentException("File {$file} not defined in asset manifest.");
    }
}
```

Stick this function into one of your helper files, then use it in your views:

```html
<script src="{{ panacea('js/app.js') }}"></script>
```

## License

Panacea is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT)
