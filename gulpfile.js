var gulp = require('gulp');
// var requireDir = require('require-dir')('./tasks');
var fileParser = require('gulp-file-parser');


var parseFuncs = fileParser({
  name: 'gulp-jeml',
  func: (body) => {
    let funcs = body.match(/^func\s+(\w+).+$/mg) || [];
    funcs = funcs.map(func => {
      let Ob = {};
      Ob.FnName = func.match(/^func\s+(\w+)/) ? func.match(/^func\s+(\w+)/)[1] : '';
      Ob.public = (/[A-Z]/).test(Ob.FnName);
      Ob.types  = func.match(/(\S+)(?:,)/g) ? func.match(/(\S+)(?:,)/g).map(type => type.replace(',', '')) : [];
      Ob.types.push(func.match(/(?:\w+\(.*?)(\S+\))/) ? func.match(/(?:\w+\(.*?)(\S+)(?:\))/)[1] : []);  // (?:\)
      Ob.returnType = func.match(/\)\s+(.+)\s+{/) ? func.match(/\)\s+(.+)\s+{/)[1].replace(/[\(\)]/g, '').split(', ') : false
      return Ob;
    });

    let structs = body.match(/^func\s+\(.+\)/mg) || [];
    structs = structs.map(struct => {
      let Ob = {};
      Ob.FnName = struct.match(/(\w+)(?:\()/) && struct.match(/(\w+)(?:\()/)[1];
      Ob.public = (/[A-Z]/).test(Ob.FnName);
      Ob.struct = struct.match(/func\s\(\w+\s(\w+)/) && struct.match(/func\s\(\w+\s(\w+)/)[1];
      Ob.types  = struct.match(/(\S+)(?:,)/g) ? struct.match(/(\S+)(?:,)/g).map(type => type.replace(',', '')) : [];
      Ob.types.push(struct.match(/(?:\w+\(.*?)(\S+\))/) ? struct.match(/(?:\w+\(.*?)(\S+\))/)[1] : []);
      Ob.returnType = struct.match(/\)\s+(.+)\s+{/) ?  struct.match(/\)\s+(.+)\s+{/)[1].replace(/[\(\)]/g, '').split(', ') : false
      return Ob;
    });

    function fnString(Fn) {
      console.log(Fn)
      return `${ Fn.public ? '+' : '-' } ${ Fn.FnName } (${ Fn.types ? Fn.types.join(', ') : '' }) : ${  Fn.returnType ? '(' + Fn.returnType.join(', ') + ')' : 'void' }`
    }

    // console.log(structs)
    // console.log(funcs)
    let output = '';
    structs.forEach(struct => {
      output += `${ fnString(struct)  } \n`
    })

    funcs.forEach(func => {
      output += `${ fnString(func)  } \n`
    })

    return output
  },
  extension: '.go'
});

gulp.task('go', [], function () {
  return gulp.src('./src/**/*.go', '!./src/**/*_test.go')
    .pipe(parseFuncs())
    .pipe(gulp.dest('./docs'));
});

gulp.task('default', ['go'], function () {
  // place code for your default task here
});