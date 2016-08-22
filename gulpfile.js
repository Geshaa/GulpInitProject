//modules
var gulp 			= require('gulp');
var sass 			= require('gulp-sass');
var browserSync 	= require('browser-sync');
var uglify			= require('gulp-uglify');
var rename 			= require('gulp-rename');
var concat 			= require('gulp-concat');
var cssnano			= require('gulp-cssnano');
var imagemin 		= require('gulp-imagemin');
var del				= require('del');
var runSequence 	= require('run-sequence');
var autoprefixer	= require('gulp-autoprefixer');
var sourcemaps		= require('gulp-sourcemaps');
var jshint 			= require('gulp-jshint');
var plumber			= require('gulp-plumber');

//path variables
var serverRoot 		= 'public';

var htmlPhpSource	= 'public/*.+(html|php)';

var scssSource		= 'src/scss/**/*.scss';
var scssDestination = 'public/assets/css';
var outputCSSFile 	= 'styles.css';

var jsSource		= 'src/js/**/*.js';
var jsOutputFile	= 'scripts.js'
var jsOutputMini	= 'scripts.min.js'
var jsOutputPath	= 'public/assets/js';

var fontsSource		= 'src/fonts/**/*.{ttf,woff,eof,svg}';
var fontsDest		= 'public/assets/fonts'

var imgSource		= 'src/images/**/*.+(png|jpg|jpeg|gif|svg)';
var imgDestination 	= 'public/assets/images';

var onError = function(err) {
	console.log(err);
}

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
		.pipe(gulp.dest(scssDestination))
		.pipe(browserSync.reload({
			stream:true
		}));
});

//js files
gulp.task('scripts', function() {
	return gulp.src(jsSource)
			.pipe(plumber({
				errorHandler: onError
			}))
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
			.pipe(concat(jsOutputFile))
			.pipe(gulp.dest(jsOutputPath))
			.pipe(rename(jsOutputMini))
			.pipe(uglify())
			.pipe(gulp.dest(jsOutputPath))
})

// delete fonts
gulp.task('clean-fonts', function() {
	del([fontsDest + '/**/*'])
});

//copy fonts
gulp.task('fonts', function() {
  return gulp.src(fontsSource)
	  .pipe(gulp.dest(fontsDest))
});

//clean images
gulp.task('clean-images', function() {
	del([imgDestination + '/**/*'])
});

//images
gulp.task('images', function() {
	return gulp.src(imgSource)
		.pipe(imagemin({
			interlaced: true,
		}))
		.pipe(gulp.dest(imgDestination))
});


//watch
gulp.task('watch', function() {
	gulp.watch(scssSource, ['sass']);
	gulp.watch(jsSource, ['scripts', browserSync.reload]);
	gulp.watch(htmlPhpSource, browserSync.reload);
	gulp.watch(fontsSource, ['clean-fonts', 'fonts']);
	gulp.watch(imgSource, ['clean-images', 'images']);
});

// Build Sequences
gulp.task('default', function(callback) {
	runSequence(['sass', 'browserSync', 'watch'],
			callback
	)
})





//for production  - need to implement
gulp.task('cssnano', function() {
	return gulp.src('src/scss/**/*.scss')
		.pipe(cssnano())
		.pipe(gulp.dest('public/assets/css'))
});

// gulp.task('build', function(callback) {
//   runSequence(
//     'clean:public',
//     'sass',
//     'cssnano',
//     ['images', 'fonts'],
//     callback
//   )
// })