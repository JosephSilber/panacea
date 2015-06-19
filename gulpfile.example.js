var panacea = require('panacea-assets');

panacea.tasks({

    views: function (mix) {
        mix.templates('templates');
    },

    css: function (mix) {
        mix.sass();
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
