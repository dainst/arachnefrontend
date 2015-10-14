var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var url = require('url');
var proxy = require('proxy-middleware');
var modRewrite = require('connect-modrewrite');
var reload = browserSync.reload;
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var Server = require('karma').Server;

var pkg = require('./package.json');

var cfg = require('./dev-config.json');

var paths = cfg.paths;

// compile sass and concatenate to single css file in build dir
gulp.task('sass', function() {
	return gulp.src('scss/app.scss')
	  	.pipe(sass({
	  		includePaths: [
	  			paths.lib + 'bootstrap-sass/assets/stylesheets/',
	  			paths.lib + 'idai-components/src/scss/'
	  		],
	  		precision: 8
	  	}))
	  	.pipe(concat(pkg.name + '.css'))
	    .pipe(gulp.dest(paths.build + '/css'))
	    .pipe(reload({ stream:true }));
});

// minify css files in build dir
gulp.task('minify-css', ['sass'], function() {
	return gulp.src(paths.build + '/css/*.css')
		.pipe(minifyCss())
  		.pipe(concat(pkg.name + '.min.css'))
		.pipe(gulp.dest(paths.build + '/css'));
});

// concatenates all js files in src into a single file in build dir
gulp.task('concat-js', function() {
	return gulp.src(['js/**/*.js'])
		.pipe(concat(pkg.name + '.js'))
		.pipe(gulp.dest(paths.build))
    	.pipe(reload({ stream:true }));
});

// concatenates and minifies all dependecies into a single file in build dir
gulp.task('concat-deps', function() {
	return gulp.src([
			paths.lib + 'angular/angular.min.js',
			paths.lib + 'angular-bootstrap/ui-bootstrap-tpls.min.js',
			paths.lib + 'angular-route/angular-route.min.js',
			paths.lib + 'angular-animate/angular-animate.min.js'
			// TODO more deps
		])
		.pipe(concat(pkg.name + '-deps.js'))
    	.pipe(uglify())
		.pipe(gulp.dest(paths.build));
});

// minifies and concatenates js files in build dir
gulp.task('minify-js', ['concat-js'], function() {
	return gulp.src([paths.build + '/' + pkg.name + '-no-tpls.js',
			paths.build + '/' + pkg.name + '-tpls.js'])
		.pipe(concat(pkg.name + '.js'))
    	.pipe(gulp.dest(paths.build))
    	.pipe(uglify())
		.pipe(concat(pkg.name + '.min.js'))
    	.pipe(gulp.dest(paths.build));
});

gulp.task('copy-fonts', function() {
	var bsFontPath = paths.lib + 'bootstrap-sass/assets/fonts/';
	return gulp.src(bsFontPath + '**/*', { base: bsFontPath })
  		.pipe(gulp.dest(paths.build + '/fonts'));
});

gulp.task('test', function (done) {
	new Server({
		configFile: __dirname + '/test/karma.conf.js',
		singleRun: true
	}, done).start();
});

gulp.task('build', [
	'sass',
	'minify-css',
	'concat-js',
	'concat-deps',
	'minify-js',
	'copy-fonts'
]);

// clean
gulp.task('clean', function() {
	return del(paths.build + '/**/*');
});

// runs the development server and sets up browser reloading
gulp.task('server', ['sass', 'concat-js', 'copy-fonts'], function() {
	var proxyOptions = url.parse(cfg.backendUri);
    proxyOptions.route = '/data';

	browserSync({
		server: {
			baseDir: '.',
        	middleware: [
        		proxy(proxyOptions),
        		// rewrite for AngularJS HTML5 mode, redirect all non-file urls to index.html
				modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.gif|\\.json|\\.woff2|\\.woff|\\.ttf$ /index.html [L]']),
        	]
		},
		port: 1234
	});

	gulp.watch('scss/**/*.scss', ['sass']);
	gulp.watch('js/**/*.js', ['concat-js']);

	gulp.watch(['index.html', 'partials/**/*.html', 'js/**/*.js'], reload);
});

gulp.task('default', function() {
	runSequence('clean', 'test', 'build');
});