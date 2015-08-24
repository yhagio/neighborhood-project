var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var minifyHTML = require('gulp-minify-html');
var imageResize = require('gulp-image-resize');

// Minify CSS
gulp.task('minicss', function() {
  gulp.src('./src/css/main.css')
    .pipe(minifyCss())
    .pipe(gulp.dest('./dist/css'));
});

// Minify JavaScript
gulp.task('minijs', function() {
  gulp.src('./src/js/bundle.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'));
});

// Minify HTML
gulp.task('minihtml', function() {
  gulp.src('./src/index.html')
    .pipe(minifyHTML())
    .pipe(gulp.dest('./dist'));
});


// Resize Image
gulp.task('resizeImage1', function () {
  gulp.src('./src/images/camera.png')
    .pipe(imageResize({
      width : 30,
      height : 30,
      crop : true,
      upscale : false
    }))
    .pipe(gulp.dest('./dist/images/resized'));
});

gulp.task('resizeImage2', function () {
  gulp.src(['./src/images/close-circled.png', './src/images/social-instagram-outline.png'])
    .pipe(imageResize({
      width : 40,
      height : 40,
      crop : true,
      upscale : false
    }))
    .pipe(gulp.dest('./dist/images/resized'));
});


// Default
gulp.task('default', ['minicss', 'minijs', 'minihtml', 'resizeImage1', 'resizeImage2'], function() {
  // watch for HTML changes
  gulp.watch('./src/index.html', function() {
    gulp.run('minihtml');
  });
});
