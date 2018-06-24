const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const mqpacker = require('css-mqpacker');
const minify = require('gulp-csso');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const pug = require('gulp-pug');
const del = require('del');
const run = require('run-sequence');

const bases = {
  src: 'src/',
  build: 'build/',
 };

gulp.task('clean', () => {
  return del(bases.build);
});

gulp.task("copy-img", () => {
  return gulp.src([
      bases.src + "img/**",
    ], {
      base: ""
    })
    .pipe(gulp.dest(bases.build + 'img/'));
});

gulp.task("views", function () {
  return gulp.src(bases.src + 'views/*.pug')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(pug())
    .pipe(gulp.dest(bases.build))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('style', function() {
  gulp.src(bases.src + 'styles/main.scss')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        'last 1 version',
        'last 2 Chrome versions',
        'last 2 Firefox versions',
        'last 2 Edge versions',
        'last 2 Opera version'
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest(bases.build + 'css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest(bases.build + 'css'))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('images', function() {
  return gulp.src(bases.build + 'img/**/*.{png,jpg,gif}')
    .pipe(gulp.dest(bases.build + 'img'))
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('symbols', function() {
  return gulp.src(bases.src + 'img/icons/*.svg')
    .pipe(svgmin({
            plugins: [{
                removeDoctype: true
            }, {
                removeComments: true
            }, {
                cleanupNumericValues: {
                    floatPrecision: 2
                }
            }]
        }))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest(bases.build + 'img'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('build', function(done) {
  run(
    'clean',
    'copy-img',
    // 'images',
    // 'symbols',
    'style',
    'views',
    done
  );
});

gulp.task('serve', function() {
  browserSync.init({
    server: { baseDir: 'build' },
    notify: false,
    open: false,
    port: 8888
  });
  gulp.watch(bases.src + 'styles/**/*.scss', ['style']);
  gulp.watch(bases.src + 'views/**/*.pug', ['views']);
});

gulp.task('default', ['build', 'serve']);