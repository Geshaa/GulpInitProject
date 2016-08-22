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
var svgStore 		= require('gulp-svgstore');
var svgmin		 	= require('gulp-svgmin');


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

var svgSource		= 'src/svg/*.svg';
var svgDestination 	= 'public/assets/svg'

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

//for production  - css nano
gulp.task('cssnano', function() {
	return gulp.src(scssSource)
			.pipe(cssnano())
			.pipe(gulp.dest(scssDestination))
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

//svg
gulp.task('svg-store', function () {
	return gulp.src(svgSource)
		.pipe(rename({prefix: 'svg-'}))
		.pipe(svgmin())
		.pipe(svgStore())
		.pipe(gulp.dest(svgDestination));
});

//watch
gulp.task('watch', function() {
	gulp.watch(scssSource, ['sass']);
	gulp.watch(jsSource, ['scripts', browserSync.reload]);
	gulp.watch(htmlPhpSource, browserSync.reload);
	gulp.watch(fontsSource, ['clean-fonts', 'fonts']);
	gulp.watch(imgSource, ['clean-images', 'images']);
	gulp.watch(svgSource, ['svg-store']);
});

// Build Sequences
gulp.task('default', function(callback) {
	runSequence(['sass', 'browserSync', 'watch'],
			callback
	)
})

// Main task before production
 gulp.task('production', function(callback) {
   runSequence(
      'sass',
   	  'scripts',
      'cssnano',
	  'clean-fonts',
   	  'clean-images'
     ['images', 'fonts'],
     callback
   )
 })