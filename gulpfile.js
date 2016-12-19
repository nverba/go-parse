var gulp = require('gulp');
// var requireDir = require('require-dir')('./tasks');
var fileParser = require('gulp-file-parser');


var parseFuncs = fileParser({
  name: 'gulp-jeml',
  func: (body) => {
    let funcs = body.match(/^func\s+(\w+).+$/mg) || [];
    funcs.map(func => {
      let Ob = {};
      Ob.FnName = func.match(/^func\s+(\w+)/)[1];
      Ob.public = (/[A-Z]/).test(Ob.FnName);
      Ob.types  = func.match(/(\S+)(?:,)/g) || [];
      Ob.types.push(func.match(/(?:\w+\(.*?)(\w+\))/) ? func.match(/(?:\w+\(.*?)(\w+)(?:\))/)[1] : []);  // (?:\)
      Ob.returnType = func.match(/\)\s+(\w+)\s+{/) ?  func.match(/\)\s+(\w+)\s+{/)[1] : false
      console.log(Ob)
      return Ob;
    });

    let structs = body.match(/^func\s+\(.+\)/mg) || [];
    structs.map(struct => {
      let Ob = {};
      Ob.FnName = struct.match(/(\w+)(?:\()/)[1];
      Ob.public = (/[A-Z]/).test(Ob.FnName);
      Ob.struct = struct.match(/func\s\(\w+\s(\w+)/)[1];
      Ob.types  = struct.match(/(\S+)(?:,)/g) || [];
      Ob.types.push(struct.match(/(?:\w+\(.*?)(\w+\))/) ? struct.match(/(?:\w+\(.*?)(\w+\))/)[1] : []);
      Ob.returnType = struct.match(/\)\s+(\w+)\s+{/) ?  struct.match(/\)\s+(\w+)\s+{/)[1] : false
      console.log(Ob)
      return Ob;
    });

    console.log(structs)
    console.log(funcs)

      return 'funcs'
  extension: '.go'
  },
});

gulp.task('go', [], function () {
  return gulp.src('./test.go')
    .pipe(parseFuncs())
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['go'], function () {
  // place code for your default task here
});