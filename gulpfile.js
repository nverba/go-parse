var gulp = require('gulp');
var del = require('del');
var fileParser = require('gulp-file-parser');


var parseFuncs = fileParser({
  name: 'gulp-jeml',
  func: (body) => {

    let funcs = body.match(/^func\s+.+?{\s*$/mg) || [];

      funcs = funcs.map(func => {

      let firstParens          = func.match(/(?:func\s+)(\(.+?\))/);
      let name                 = func.match(/(\w+)(?:\()/)[1];
      let secondParens         = func.match(/(?:\w+)(\(.*?\))/)[1];
      let thirdParensOrString  = (match => match && match[1])(func.match(/(?:\w+\(.+?\)\s+)(.+?)(?:\s+{)/));

      let Ob         = {};
      Ob.name        = name;
      Ob.public      = (/[A-Z]/).test(name[0]);
      Ob.types       = (matches => matches && matches.map(type => type.replace(',', '')))(secondParens.match(/(\S+)(?:,)/g));   
      Ob.returnTypes = thirdParensOrString;

      return Ob;
    });

    function fnString(Fn) {
      return `${ Fn.public ? '+' : '-' } ${ Fn.name } (${ Fn.types ? Fn.types.join(', ') : '' }) : ${ Fn.returnTypes || 'void' }`

      //       return `${ Fn.public ? '+' : '-' } ${ Fn.FnName } (${ Fn.types ? Fn.types.join(', ') : '' }) : ${  Fn.returnType ? '(' + Fn.returnType.join(', ') + ')' : 'void' }`

    }

    let output = '';
    funcs.forEach(func => {
      output += `${ fnString(func)  } \n`
    })
    return output
  },
  extension: '.go'
});

gulp.task('go', [], function () {
  return gulp.src(['./src/**/*.go', '!./src/**/*_test.go'])
    .pipe(parseFuncs())
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('./docs'));
});

gulp.task('default', ['clean:docs', 'go'], function () {
  // place code for your default task here
});

gulp.task('clean:docs', function () {
  return del([
    'docs/**/*'
  ]);
});



// (\s)(?:,|\))
// (email string)
// (w mango.Wallet)
// (wt Wallet)
// (currency string, c *ctx.Context)
// (c *ctx.Context)
// (c *ctx.Context)
// (wallets []Wallet, currency string)
// ()
// (name string)
// (email string)
// (ds string)
// (mp map[string]string, keys []string)
// (id string, c *ctx.Context)
// (rid string, c *ctx.Context)
// ()
// ()
// (pi *PayIns, ps PayInSeller, aid, fromw, tow string)
// (pi *PayIns, sellers []Seller, c *ctx.Context)
// (c *ctx.Context)
// (tid string, c *ctx.Context)
// (c *ctx.Context)
// (c *ctx.Context)
// (c *ctx.Context)
// (c *ctx.Context)
// (c *ctx.Context, tid int64)