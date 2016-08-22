//plugins
var gulp 			= require('gulp');
var sass 			= require('gulp-sass');
var browserSync 	= require('browser-sync');
var userref 		= require('gulp-useref');
var uglify			= require('gulp-uglify');
var rename 			= require('gulp-rename');
var concat 			= require('gulp-concat');
var cssnano			= require('gulp-cssnano');
var gulpIf 			= require('gulp-if');
var imagemin 		= require('gulp-imagemin');
var cache 			= require('gulp-cache');
var del				= require('del');
var runSequence 	= require('run-sequence');
var autoprefixer	= require('gulp-autoprefixer');
var sourcemaps		= require('gulp-sourcemaps');

//path variables
var serverRoot 		= 'public';

var scssSource		= 'src/scss/**/*.scss';
var sassDestination = 'public/assets/css';
var outputCSSFile 	= 'styles.css';

var jsSource		= 'src/js/**/*.js';
var imgSource		= 'src/images/**/*.+(png|jpg|jpeg|gif|svg)';
var imgDestination 	= 'public/assets/images';
var fontsSource		= 'src/fonts/**/*';
var fontsDest		= 'public/assets/fonts'

var sassOptions = {
	errLogToConsole: true,
	outputStyle: 'expanded'
};

var autoprefixerOptions = {
	browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

//Start browserSync
gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: serverRoot
		}
	})
});

//Sass task
gulp.task('sass', function() {
	return gulp.src(scssSource)
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sass(sassOptions).on('error', sass.logError))
		.pipe(concat(outputCSSFile))
		.pipe(sourcemaps.write())
    	.pipe(autoprefixer(autoprefixerOptions))
		.pipe(gulp.dest(sassDestination))
		.pipe(browserSync.reload({
			stream:true
		}));
});

// copy fonts  - need remove theme
gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('public/assets/fonts'))
});

//images  - need to remove theme before
gulp.task('images', function() {
	return gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg)')
		.pipe(cache(imagemin({
			interlaced: true,
		})))
		.pipe(gulp.dest('public/assets/images'))
});

//js files
gulp.task('scripts', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('public/assets/js'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/assets/js'))
})

//watch
gulp.task('watch', function() {
	gulp.watch('src/scss/**/*.scss', ['sass']);
	gulp.watch('public/*.html', browserSync.reload);
	gulp.watch('public/*.php', browserSync.reload);
	gulp.watch('src/js/**/*.js', ['scripts',browserSync.reload]);
	gulp.watch('src/fonts/**/*', ['fonts']);
	gulp.watch('src/images/**/*.+(png|jpg|jpeg|gif|svg)', ['images']);
});

gulp.task('clean', function() {
	return del.sync('public').then(function(cb) {
		return cache.clearAll(cb);
	});
});

gulp.task('clean:public', function() {
	return del.sync(['public/**/*', '!public/assets/images', '!public/assets/images/**/*'])
});

gulp.task('cssnano', function() {
	return gulp.src('src/scss/**/*.scss')
		.pipe(cssnano())
		.pipe(gulp.dest('public/assets/css'))
});


// Build Sequences
gulp.task('default', function(callback) {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
})

// gulp.task('build', function(callback) {
//   runSequence(
//     'clean:public',
//     'sass',
//     'cssnano',
//     ['images', 'fonts'],
//     callback
//   )
// })