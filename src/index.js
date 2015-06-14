var gulp = require('gulp');
var register = require('./register');

var panacea = {

    ingredients: {
        browserify: require('./ingredients/browserify'),
        sass: require('./ingredients/sass'),
        templates: require('./ingredients/templates'),
        watch: gulp.watch.bind(gulp),
    },

    /**
     * Register a task with gulp.
     *
     * @param  {string}          name
     * @param  {function|array}  task
     * @return void
     */
    task: function (name, task) {
        register.tasks(name, tasks, panacea);
    },

    /**
     * Register multiple tasks with gulp.
     *
     * @param  {object}  tasks
     * @return void
     */
    tasks: function (tasks) {
        register.tasks(tasks, panacea);
    },

};

module.exports = panacea;
