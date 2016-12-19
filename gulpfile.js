var gulp = require('gulp');
// var requireDir = require('require-dir')('./tasks');
var fileParser = require('gulp-file-parser');


var parseFuncs = fileParser({
  name: 'gulp-jeml',
  func: (body) => {
    let funcs = body.match(/^func\s+(\w+).+$/mg);
    funcs.map(func => {
      let Ob = {};
      Ob.FnName = func.match(/^func (\w+)/)[1];
      Ob.public = (/[A-Z]/).test(Ob.FnName);
      return Ob;
    });

    let structs = body.match(/^func\s\(.+\)/mg);
    structs.map(struct => {
      let Ob = {};
      Ob.FnName = struct.match(/^func (\w+)/)[1];
      Ob.public = (/[A-Z]/).test(Ob.FnName);
      return Ob;
    });

      return 'funcs'
  },
  extension: '.go'
});

gulp.task('go', [], function () {
  return gulp.src('./test.go')
    .pipe(parseFuncs())
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['go'], function () {
  // place code for your default task here
});