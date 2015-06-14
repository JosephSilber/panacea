var gulp = require('gulp');

 /**
  * Register a task with gulp.
  *
  * @param  {string}          name
  * @param  {function|array}  task
  * @return void
  */
function task(name, task, panacea) {
    if (Array.isArray(task)) {
        return gulp.task(name, task);
    }

    gulp.task(name, function () {
        task(panacea.ingredients, gulp);
    });
}

/**
 * Register multiple tasks with gulp.
 *
 * @param  {object}  tasks
 * @return void
 */
function tasks(tasks, panacea) {
    Object.keys(tasks).forEach(function(name) {
        task(name, tasks[name], panacea);
    });
}

module.exports = {
    tasks : tasks,
    task  : task,
};
