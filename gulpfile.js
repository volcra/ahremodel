'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('app/js/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize images
gulp.task('images', function () {
  return gulp.src('app/img/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/img'))
    .pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
  return gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'app/css/*.scss',
    'app/css/**/*.css'
  ])
    .pipe($.changed('css', {extension: '.scss'}))
    .pipe($.sass({
      precision: 10
    }))
    .on('error', console.error.bind(console))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(gulp.dest('.tmp/css'))
    // Concatenate And Minify Styles
    .pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest('dist/css'))
    .pipe($.size({title: 'styles'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/**/*.html')
    .pipe(assets)
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Remove Any Unused CSS
    // Note: If not using the Style Guide, you can delete it from
    // the next line to only include styles your project uses.
    .pipe($.if('*.css', $.uncss({
      html: [
        'app/index.html'
      ]
    })))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Minify Any HTML
    .pipe($.if('*.html', $.minifyHtml()))
    // Output Files
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles'], function () {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'VC',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app']
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/css/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/js/**/*.js'], reload);
  gulp.watch(['app/img/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    logPrefix: 'VC',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist'
  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence('styles', ['html', 'images', 'fonts', 'copy'], cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed:mobile', pagespeed.bind(null, {
  // By default, we use the PageSpeed Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  url: 'http://volcra.github.io/ahremodel/',
  strategy: 'mobile'
}));
gulp.task('pagespeed:desktop', pagespeed.bind(null, {
  // By default, we use the PageSpeed Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  url: 'http://volcra.github.io/ahremodel/',
  strategy: 'desktop'
}));

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
