var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var htmlmin = require('gulp-htmlmin');
var rev = require('gulp-rev');
var usemin = require('gulp-usemin');
var cleanCss = require('gulp-clean-css');
var connect = require('gulp-connect');
var open = require('gulp-open');
var foreach = require('gulp-foreach');

var port = 8888;
var paths = {
    scripts: ['app/js/**/*.js'],
    images: ['app/img/**/*'],
    scss: ['app/scss/**/*.scss'],
    css: ['app/css/**/*.css'],
    html: ['app/**/*.html'],
    all: ['app/**/**.*'],
};

var defaultErrorHandler = function (name) {
    return function (err) {
        console.error('Error from ' + name + ' in compress task', err.toString());
    };
}

gulp.task('build', function (callback) {
    runSequence('clean', 'usemin', callback);
});

gulp.task('clean', function () {
    return del(['build']);
});

gulp.task('sass', function () {
    return gulp.src(paths.scss)
        .pipe(sass())
        .on('error', defaultErrorHandler('sass'))
        .pipe(gulp.dest('app/css'));
});

gulp.task('usemin', ['sass'], function () {
    return gulp.src(paths.html)
        .pipe(foreach(function (stream, file) {
            return stream
                .pipe(usemin({
                    html: [htmlmin({
                        collapseWhitespace: true
                    })],
                    js: [sourcemaps.init(), uglify(), sourcemaps.write(), rev()],
                    libs: [uglify(), rev()],
                    css: [cleanCss(), 'concat', rev()]
                }))
                .on('error', defaultErrorHandler('usemin'))
        }))
        .on('error', defaultErrorHandler('foreach'))
        .pipe(gulp.dest('build/'));
});


gulp.task('open', function () {
    gulp.src(__filename)
        .pipe(open({
            uri: 'http://localhost:' + port
        }))
        .on('error', defaultErrorHandler('open'));
});

gulp.task('reload', function () {
    connect.reload();
});

gulp.task('watch', function () {
    gulp.watch([paths.all], ['build', 'reload']);
});

gulp.task('connect', function () {
    connect.server({
        port: port,
        root: 'build',
        livereload: true
    });
});

gulp.task('serve', function (callback) {
    runSequence('build', 'connect', 'watch', 'open', callback);
});

gulp.task('watch-debug', function () {
    gulp.watch([paths.all], ['sass', 'reload']);
});

gulp.task('connect-debug', function () {
    connect.server({
        port: port,
        root: ['app', '.'],
        livereload: true
    });
});

gulp.task('debug', function (callback) {
    runSequence('sass', 'connect-debug', 'watch-debug', 'open', callback);
});