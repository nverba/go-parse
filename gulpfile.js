var gulp        = require('gulp');
var del         = require('del');
var map         = require('vinyl-map');
var concat      = require('gulp-concat');

var parseFuncs = map(function (code, filename) {
  // file contents are handed 
  // over as buffers 
  code = code.toString();

  /**
   *   
   *  CAPTURE FUNCTIONS & STRUCTS
   * 
   */

  let funcs      = code.match(/^func\s+.+?{\s*$/mg) || [];
  let structs    = code.match(/(?:type\s+)(\w+)(?:\s+struct)/mg) || [];
  let interfaces = code.match(/type\s+\w+\s+interface\s+(.|\n)+?}/mg) || [];

  // console.log('interfaces', filename, interfaces)
  
  // Reduce array of struct matches to object of struct names with empty string value;
  structs = structs.reduce((acc, val) => Object.assign({}, acc, { [val.match(/(?:type\s+)(\w+)(?:\s+struct)/)[1]]: '' }), {}); 
  interfaces = interfaces.reduce((acc, val) => Object.assign({}, acc, { [val.match(/(?:type\s+)(\w+)/)[1]]: val.match(/(?:type\s+\w+\s+interface\s{)+((\n|.)+?)(?:})/)[1] }), {}); 
  
  console.log(interfaces)
  
  funcs = funcs.map(func => {

    let firstParens = (match => match && match[1])(func.match(/(?:func\s+)(\(.+?\))/));
    let name = func.match(/(\w+)(?:\()/)[1];
    let secondParens = func.match(/(?:\w+)(\(.*?\))/)[1];
    let thirdParensOrString = (match => match && match[1])(func.match(/(?:\w+\(.+?\)\s+)(.+?)(?:\s+{)/));

    let Ob         = {};
    Ob.name        = name;
    Ob.struct      = firstParens && firstParens.match(/(\w+)(?:\))/)[1];
    Ob.public      = (/[A-Z]/).test(name[0]);
    Ob.types       = (matches => matches && matches.map(type => type.replace(',', '')))(secondParens.match(/(\S+)(?:,)/g));
    Ob.returnTypes = thirdParensOrString;

    return Ob;
  });


  /**
   *   
   *  GENERATE OUTPUT STRINGS
   * 
   */

  function fnString(Fn) {
    return `${Fn.public ? '+' : '-'} ${Fn.name} (${Fn.types ? Fn.types.join(', ') : ''}) : ${Fn.returnTypes || 'void'}`
  }

  let stringFuncs = '';
  funcs.forEach(func => {
    if (func.struct) {
      structs[func.struct] = structs[func.struct] + `${fnString(func)} \n`
    } else {
      stringFuncs = stringFuncs + `${fnString(func)} \n`
    }
  });

  let output = '';
  let module_name = filename.match(/(?:.+\/)(\w+)(\.go)/)[1];

  if (stringFuncs) { output += (`Module: ${ module_name } \n\nFuncs: \n${ stringFuncs } \n`) }
  Object.keys(structs).forEach(struct_name => {
    output += `Struct: ${ struct_name } \n${ structs[struct_name] }`                                           // structsTemplate(struct_name, structs[struct_name], 300);
  });
  return output;
});


var wrapTemplate = map(function (code, filename) {
  return mainTemplate(code);
});

/**
 *   
 *  GULP TASKS
 * 
 */

gulp.task('parse:go:funcs', [], function () {
  return gulp.src(['./src/**/*.go', '!./src/**/*_test.go'])
    .pipe(parseFuncs)
    .on('error', console.error.bind(console))
    .pipe(concat('module.graphml'))
    .pipe(gulp.dest('./docs'));
});


// Set default gulp command to clean docs folder & build docs from src folder
gulp.task('default', ['clean:docs', 'parse:go:funcs'], function () { });

// Clean docs dir before each build
gulp.task('clean:docs', function () {
  return del([
    'docs/**/*'
  ]);
});