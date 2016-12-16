var gulp = require('gulp');
// var requireDir = require('require-dir')('./tasks');
var parser = require('gulp-file-parser');

parser.addRule(/\#[\S]+/ig, function(tag) {
    return "<span class=\"tag\">" + tag.substr(1) + "</span>";
});

var gulp_parse = parser({
    name: 'gulp-jeml',
    func: parser.render,
    extension: '.go'
});

gulp.task('go', [], function () {
    return gulp.src('./test.go')
        .pipe(gulp_parse())
        .pipe(gulp.dest('./dist'));
});