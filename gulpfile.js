'use strict';

const { watch, dest, src, task, parallel } = require('gulp');
const sass = require('gulp-sass'),
  cssnano = require('gulp-cssnano'),
  autoprefixer = require('gulp-autoprefixer'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  rename = require('gulp-rename'),
  browserSync = require('browser-sync'),
  del = require('del'),
  cache = require('gulp-cache');

sass.compiler = require('node-sass');

task('html', function () {
  return src('app/*.html')
    .pipe(browserSync.reload({ stream: true }));
});

task('sass', function () {
  return src('app/sass/**/*.sass')
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: false }))
    .pipe(dest('app/css'))
    .pipe(browserSync.reload({ stream: true }));
});

task('css-libs', function () {
  return src('app/sass/_libs.sass')
    .pipe(sass())
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('app/css'));
});

task('scripts', function () {
  return src('app/js/**/*.js')
    .pipe(browserSync.reload({ stream: true }));
});

task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: true
  });
});

task('clean', async function () {
  return del.sync('dist');
});

task('img', async function () {
  src('app/img/**/*')
    .pipe(cache(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      use: [pngquant()]
    })))
    .pipe(dest('dist/img'));
});

task('prebuild', async function () {
  src('app/css/main.css')
    .pipe(dest('dist/css'));
  src('app/fonts/**/*')
    .pipe(dest('dist/fonts'));
  src('app/js/*/*')
    .pipe(dest('dist/js'));
  src('app/*.html')
    .pipe(dest('dist'));
});

task('clear', function () {
  return cache.clearAll();
});

task('watch', function () {
  watch('app/*.html', parallel('html'));
  watch('app/sass/**/*.sass', parallel('sass'));
  watch('app/js/**/*.js', parallel('scripts'));
});

task('default', parallel('css-libs',  'sass', 'scripts', 'browser-sync', 'watch'));
task('build', parallel('clean', 'img', 'sass', 'scripts', 'prebuild'));