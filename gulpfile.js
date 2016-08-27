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
var svgstore 		= require('gulp-svgstore');
var svgmin		 	= require('gulp-svgmin');
var webp 			= require('gulp-webp');
var htmlmin 		= require('gulp-htmlmin');

//configuration - based on config.json
var fs				= require('fs');
var config 			= JSON.parse(fs.readFileSync('./config.json'));
var jsSource 		= [];

for(var i in config.jsModules) {
	jsSource.push(config.scripts.mainModulesDir + config.jsModules[i] + '.js');
}

jsSource.push(config.scripts.mainFile);


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
			baseDir: config.serverRoot
		}
	})
});

//Sass task  - 3 files are required
gulp.task('sass', function() {
	return gulp.src([config.sass.mainSprite, config.sass.mainFile, config.sass.mainQueries])
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sass(sassOptions).on('error', sass.logError))
		.pipe(concat(config.sass.outputCSSFile))
		.pipe(sourcemaps.write())
    	.pipe(autoprefixer(autoprefixerOptions))
		.pipe(gulp.dest(config.sass.scssDestination))
		.pipe(browserSync.reload({
			stream:true
		}));
});

//for production  - css nano
gulp.task('cssnano', function() {
	return gulp.src(config.sass.scssSource)
		.pipe(cssnano())
		.pipe(gulp.dest(config.sass.scssDestination))
});

//for production - minify html
gulp.task('html', function() {
	return gulp.src(config.htmlPhpSource)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.serverRoot));
});

//js files
gulp.task('scripts', function() {
	return gulp.src(jsSource)
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(concat(config.scripts.jsOutputFile))
		.pipe(gulp.dest(config.scripts.jsOutputPath))
		.pipe(rename(config.scripts.jsOutputMinified))
		.pipe(uglify())
		.pipe(gulp.dest(config.scripts.jsOutputPath))
})

// delete fonts
gulp.task('clean-fonts', function() {
	del([config.fonts.destination + '/**/*'])
});

//copy fonts
gulp.task('fonts', function() {
  return gulp.src(config.fonts.source)
	  .pipe(gulp.dest(config.fonts.destination))
});

//clean images
gulp.task('clean-images', function() {
	del([config.images.destination + '/**/*'])
});

//images
gulp.task('images', function() {
	return gulp.src(config.images.source)
		.pipe(imagemin({
			interlaced: true,
		}))
		.pipe(gulp.dest(config.images.destination))
});

gulp.task('images-webp', function() {
	return gulp.src(config.images.source)
		.pipe(webp({quality: 100}))
		.pipe(gulp.dest(config.images.destination))
});

//svg
gulp.task('svg-store', function () {
	return gulp.src(config.svg.source)
		.pipe(rename({prefix: 'svg-'}))
		.pipe(svgmin())
		.pipe(svgstore())
		.pipe(gulp.dest(config.svg.destination));
});

//watch
gulp.task('watch', function() {
	gulp.watch(config.sass.scssSource, ['sass']);
	gulp.watch(jsSource, ['scripts', browserSync.reload]);
	gulp.watch(config.htmlPhpSource, browserSync.reload);
	gulp.watch(config.fonts.source, ['clean-fonts', 'fonts']);
	gulp.watch(config.images.source, ['clean-images', 'images', 'images-webp']);
	gulp.watch(config.svg.source, ['svg-store']);
});

// Build Sequences - just run gulp and it will start from here
gulp.task('default', function(callback) {
	runSequence(['sass', 'browserSync', 'watch'],
		callback
	)
})

// Main task before production
gulp.task('production', function(callback) {
   	runSequence(
		'sass',
		'cssnano',
		'scripts',
		'html',
		'clean-fonts',
		'clean-images',
		['images', 'fonts'],
		callback
    )
})