var gulp = require('gulp');
var responsive = require('gulp-responsive');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');
var watch = require('gulp-watch');

var path = {
    src: {
        images: 'src/images/**/*.*',
        scripts: 'src/scripts/**/*.*',
        styles: 'src/styles/**/*.*',
        photos: 'data/**/*.jpg',
    },
    build: {
        images: 'build/images',
        scripts: 'build/scripts',
        styles: 'build/styles',
        photos: 'build/images'
    }
};

gulp.task('images:build', function() {
    gulp.src('src/favicon.ico')
        .pipe(gulp.dest('build'));

    gulp.src(path.src.images)
        .pipe(gulp.dest(path.build.images));
});

gulp.task('scripts:build', function() {
    gulp.src(path.src.scripts)
        .pipe(uglify())
        .pipe(gulp.dest(path.build.scripts));
});

gulp.task('styles:build', function() {
    gulp.src(path.src.styles)
        .pipe(sass())
        .pipe(gulp.dest(path.build.styles));
});

gulp.task('photos:build', function() {
    gulp.src(path.src.photos)
        .pipe(responsive({
            '**/*.*' : {
                width: 1200,
                height: 1200
            }
        }, {
            max: true,
            quality: 80,
            progressive: true,
            errorOnEnlargement: false,
            stats: false,
            silent: true
        }))
        .pipe(gulp.dest(path.build.photos));
});

gulp.task('build', ['images:build', 'scripts:build', 'styles:build', 'photos:build']);

gulp.task('server', function() {
    nodemon({
        script: 'index.js'
    });
});

gulp.task('watch', function() {
    watch(path.src.images, function(event, cb) {
        gulp.start('images:build');
    });

    watch(path.src.scripts, function(event, cb) {
        gulp.start('scripts:build');
    });

    watch(path.src.styles, function(event, cb) {
        gulp.start('styles:build');
    });

    watch(path.src.photos, function(event, cb) {
        gulp.start('photos:build');
    });
});

gulp.task('default', ['build', 'server', 'watch']);