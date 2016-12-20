var gulp = require('gulp');
var del = require('del');
var map = require('vinyl-map');
var ext_replace = require('gulp-ext-replace');

// TEMPLATES
var mainTemplate = require('./templates/main-graph-template.js')
var funcsTemplate = require('./templates/funcs-template.js')

var parseFuncs = map(function (code, filename) {
  // file contents are handed 
  // over as buffers 
  code = code.toString();

  /**
   *   
   *  CAPTURE FUNCTIONS & STRUCTS
   * 
   */

  let funcs = code.match(/^func\s+.+?{\s*$/mg) || [];

  funcs = funcs.map(func => {

    let firstParens = func.match(/(?:func\s+)(\(.+?\))/);
    let name = func.match(/(\w+)(?:\()/)[1];
    let secondParens = func.match(/(?:\w+)(\(.*?\))/)[1];
    let thirdParensOrString = (match => match && match[1])(func.match(/(?:\w+\(.+?\)\s+)(.+?)(?:\s+{)/));

    let Ob = {};
    Ob.name = name;
    Ob.public = (/[A-Z]/).test(name[0]);
    Ob.types = (matches => matches && matches.map(type => type.replace(',', '')))(secondParens.match(/(\S+)(?:,)/g));
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

  let output = '';
  funcs.forEach(func => {
    output += `${fnString(func)} \n`
  })
  return mainTemplate(funcsTemplate())

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
    .pipe(ext_replace('.graphml'))
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