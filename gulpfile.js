const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const image = require('gulp-image');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const babel = require('gulp-babel');
const server = require('browser-sync').create();
const pathBuild = './build/';

const pugFiles = './src/views/*.*';
const scssFiles = './src/scss/*.*';
const jsFiles = './src/js/index.js';
const imgFiles = './src/img/**/*.*'

const views = () => {
  return gulp
    .src(pugFiles)
    .pipe(pug())
    .pipe(gulp.dest('./build/'))
    .pipe(server.stream());
};

const styles = () => {
  return (
    gulp
      .src(scssFiles)
      .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(concat('all.css'))
      .pipe(
        autoprefixer({
          browsers: ['> 0.1%'],
          cascade: false,
        }),
      )
      .pipe(
        cleanCSS({
          level: 2,
        }),
      )
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build/css'))
      .pipe(server.stream())
  );
};

const scripts = () => {
  return (
    gulp
      .src(jsFiles)
      .pipe(
        babel({
          presets: ['@babel/env'],
        }),
      )
      .pipe(concat('all.js'))
      .pipe(
        uglify({
          toplevel: true,
        }),
      )
      .pipe(gulp.dest('./build/js'))
      .pipe(server.stream())
  );
};

const imgs = () => {
  return (
    gulp
      .src(imgFiles)
      .pipe(
        image({
          pngquant: true,
          optipng: false,
          zopflipng: true,
          jpegRecompress: false,
          jpegoptim: true,
          mozjpeg: true,
          guetzli: false,
          gifsicle: true,
          svgo: true,
          concurrent: 10
        })
      )
      .pipe(gulp.dest('./build/img'))
      .pipe(server.stream())
  );
};

const watch = (done) => {
  server.init({
    server: {
      baseDir: pathBuild,
    },
    port: 9000,
  });

  gulp.watch('./src/scss/**/*.scss', styles);
  gulp.watch('./src/js/**/*.js', scripts);
  gulp.watch('./src/views/**/*.pug', views).on('change', server.reload);
  done();
};

const clean = () => {
  return del(['build/*']);
};

gulp.task('clean', clean);
gulp.task('build', gulp.series('clean', gulp.parallel(styles, scripts, views, imgs)));
gulp.task('dev', gulp.series('build', watch));
