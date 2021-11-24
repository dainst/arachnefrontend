var gulp = require('gulp');
var del = require('del');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var url = require('url');
var proxy = require('proxy-middleware');
var modRewrite = require('connect-modrewrite');
var sass = require('gulp-sass')(require('node-sass'));
var concat = require('gulp-concat');
var sort = require('gulp-sort');
var addSrc = require('gulp-add-src');
var cleanCss = require('gulp-clean-css');
var uglify = require('gulp-terser');
var templateCache = require('gulp-angular-templatecache');
var minifyHtml = require("gulp-minify-html");
var argv = require('yargs').argv;
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var fs = require('fs');
var git = require('gulp-git');

var pkg = require('./package.json');

var cssDeps = [
    'node_modules/angular-ui-tree/dist/angular-ui-tree.css',
    'node_modules/font-awesome/css/font-awesome.min.css',
    'node_modules/leaflet.markercluster/dist/MarkerCluster.css',
    'node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css',
    'node_modules/drmonty-leaflet-awesome-markers/css/leaflet.awesome-markers.css',
    'node_modules/leaflet-fullscreen/dist/leaflet.fullscreen.css',
    'node_modules/ng-table/bundles/ng-table.css'
];

var jsDeps = [
    'node_modules/angular/angular.min.js',
    'node_modules/@uirouter/angularjs/release/angular-ui-router.min.js',
    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
    'node_modules/leaflet/dist/leaflet.js',
    'node_modules/leaflet.markercluster/dist/leaflet.markercluster.js',
    'lib/oms.min.js',
    'node_modules/drmonty-leaflet-awesome-markers/js/leaflet.awesome-markers.js',
    'node_modules/leaflet.heat/dist/leaflet-heat.js',
    'node_modules/leaflet-polylinedecorator/dist/leaflet.polylineDecorator.js',
    'node_modules/angulartics/dist/angulartics.min.js',
    'node_modules/angulartics-piwik/dist/angulartics-piwik.min.js',
    'node_modules/angular-resource/angular-resource.min.js',
    'node_modules/angular-sanitize/angular-sanitize.min.js',
    'node_modules/angular-cookies/angular-cookies.min.js',
    'node_modules/idai-components/dist/idai-components.min.js',
    'node_modules/angular-ui-tree/dist/angular-ui-tree.min.js',
    'node_modules/showdown/dist/showdown.min.js',
    'node_modules/ng-showdown/dist/ng-showdown.min.js',
    'node_modules/idai-3dviewer/dist/idai-3dviewer.js',
    'lib/relative-paths-in-partial.js',
    'node_modules/d3/dist/d3.min.js',
    'node_modules/angular-md5/angular-md5.js',
    'node_modules/svg-pan-zoom/dist/svg-pan-zoom.js',
    'node_modules/leaflet-fullscreen/dist/Leaflet.fullscreen.min.js',
    'node_modules/idai-cookie-notice/idai-cookie-notice.js',
    'lib/leaflet-polylineoffset/leaflet.polylineoffset.js',
    'node_modules/ng-table/bundles/ng-table.js'
];

// compile sass and concatenate to single css file in build dir
gulp.task('compile-css', function () {
    return gulp.src('scss/app.scss')
        .pipe(sass({
            includePaths: [
                'node_modules/bootstrap-sass/assets/stylesheets/',
                'node_modules/idai-components/src/'
            ],
            precision: 8
        }))
        .pipe(addSrc(cssDeps))
	  	.pipe(concat(pkg.name + '.css'))
	    .pipe(gulp.dest('dist/css'));
});

// minify css files in build dir
gulp.task('minify-css', gulp.series('compile-css', function() {
	return gulp.src('dist/css/' + pkg.name + '.css')
		.pipe(cleanCss({ inline: ['remote'] }))
  		.pipe(concat(pkg.name + '.min.css'))
		.pipe(gulp.dest('dist/css'));
}));

// concatenates all js files in src into a single file in build dir
gulp.task('concat-js', function() {
	return gulp.src(['app/**/*.js', '!app/app.js'])
		.pipe(sort())
		.pipe(addSrc.append('app/app.js'))
		.pipe(concat(pkg.name + '.js'))
		.pipe(gulp.dest('dist/'));
});

// concatenates and minifies all dependecies into a single file in build dir
gulp.task('concat-deps', function () {

    var gutil = require('gulp-util');

    return gulp.src(jsDeps)
        .pipe(concat(pkg.name + '-deps.js'))
        .pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest('dist/'));
});

gulp.task('html2js-partials', function () {
    return gulp.src('partials/**/*.html')
        .pipe(minifyHtml())
        .pipe(templateCache(pkg.name + '-partials-tpls.js', {
			standalone: true,
			module: 'arachne.partials-templates',
            root: 'partials'
		}))
        .pipe(gulp.dest('dist/'));
});

gulp.task('html2js-js', function () {
    return gulp.src('app/**/*.html')
        .pipe(minifyHtml())
        .pipe(templateCache(pkg.name + '-js-tpls.js', {
			standalone: true,
			module: 'arachne.js-templates',
            root: 'app'
		}))
        .pipe(gulp.dest('dist/'));
});

// minifies and concatenates js files in build dir
gulp.task('minify-js', gulp.series('concat-js', 'html2js-js', 'html2js-partials', function () {

	var gutil = require('gulp-util');

    return gulp.src(['dist/' + pkg.name + '.js',
        'dist/' + pkg.name + '-partials-tpls.js',
        'dist/' + pkg.name + '-js-tpls.js'
        ])
        .pipe(concat(pkg.name + '.js'))
        .pipe(gulp.dest('dist/'))
        .pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(concat(pkg.name + '.min.js'))
        .pipe(gulp.dest('dist/'));
}));

gulp.task('copy-fonts', function () {
    var bsFontPath = 'node_modules/bootstrap-sass/assets/fonts/';
    return gulp.src(['node_modules/idai-components/fonts/**', 'node_modules/font-awesome/fonts/**', bsFontPath + '**/*'])
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('copy-marker-imgs', function () {
    return gulp.src(['node_modules/drmonty-leaflet-awesome-markers/css/images/**'])
        .pipe(gulp.dest('dist/css/images'));
});

gulp.task('copy-leaflet-fullscreen-icon', function () {
    return gulp.src(['node_modules/leaflet-fullscreen/dist/*.png'])
        .pipe(gulp.dest('dist/css'));
});

gulp.task('copy-imgs', function () {
    return gulp.src(['node_modules/idai-components/img/**', 'img/**/*'])
        .pipe(gulp.dest('dist/img'));
});

// copy index.html to dist and set version
gulp.task('copy-index', function () {

    var buildNo = "SNAPSHOT";

    if (argv.build !== true && argv.build !== false) {
        buildNo = argv.build;
    }

    var versionString = pkg.version + " (build #" + buildNo + ")";

    return gulp.src(['index.html'])
        .pipe(replace(/version="[^"]*"/g, 'version="v' + versionString + '"'))
        .pipe(replace(/build=BUILD_NO/g, 'build=' + buildNo))
        .pipe(gulp.dest('dist/'));
});

gulp.task('copy-info', function () {
    return gulp.src('info/**/*', {base: 'info'})
        .pipe(gulp.dest('dist/info'));
});

gulp.task('copy-con10t', function () {
    return gulp.src('con10t/**/*', {base: 'con10t'})
        .pipe(gulp.dest('dist/con10t'));
});

gulp.task('copy-devconfigtemplate', function (callback) {

    return new Promise(function (resolve, reject) {

        fs.access('./config/dev-config.json', fs.F_OK, function (err) {

            if (err) {

                // dev-config.json doesn't exist so copy file to destination file
                var copyFile = fs.createReadStream('./config/dev-config.json.template').pipe(fs.createWriteStream('./config/dev-config.json'));
                copyFile.on('finish', function () {

                    // Finished copying
                    fs.readFile('./config/dev-config.json', 'utf-8', function read(err) {

                        if (err) {
                            return callback(err);
                        }
                        callback();
                    });
                });

            } else {

                // Template and config file exist
                fs.readFile('./config/dev-config.json', 'utf-8', function read(err) {

                    if (err) {
                        return callback(err);
                    }

                    console.log('Will not copy template configuration to dev-config.json because both files already exist.');
                    callback();
                });
            }

        });

    });
});

gulp.task('copy-configfiles', function() {
    return gulp.src('config/**/*', { base: 'config' })
        .pipe(gulp.dest('dist/config'));
});

gulp.task('copy-3dviewer', function() {
    return gulp.src(['node_modules/idai-3dviewer/dist/idai-3dviewer.min.js', '3dviewer/**/*'])
        .pipe(gulp.dest('dist/3dviewer'));
});

gulp.task('copy-3dhop', function() {
    return gulp.src('3dhop/**/*', {base: '3dhop'})
        .pipe(gulp.dest('dist/3dhop'));
});

gulp.task('build', gulp.series(
    'copy-con10t',
    'copy-devconfigtemplate',
    'copy-configfiles',
    'minify-css',
    'concat-deps',
    'minify-js',
    'copy-fonts',
    'copy-imgs',
    'copy-marker-imgs',
    'copy-leaflet-fullscreen-icon',
    'copy-3dviewer',
    'copy-3dhop',
    'copy-index',
    'copy-info'
));

gulp.task('clone-con10t', function (callback) {

    fs.access('./con10t', fs.F_OK, function (err) {

        // Only clone con10t if con10t-files aren't already in place
        if (err) {
            git.clone('https://github.com/dainst/con10t.git', function (err) {
                if (err) {
                    return callback(err);
                }
            });
        } else {
            console.log('Will not clone con10t because the con10t-folder already exists.');
        }
        callback();
    });
});

gulp.task('watch-css', gulp.series('minify-css', function(done) { reload(); done(); }));
gulp.task('watch-js', gulp.series('minify-js', function(done) { reload(); done(); }));
gulp.task('watch-index', gulp.series('copy-index', function(done) { reload(); done(); }));
gulp.task('watch-con10t', gulp.series('copy-con10t', function(done) { reload(); done(); }));
gulp.task('watch-info', gulp.series('copy-info', function(done) { reload(); done(); }));

// runs the development server and sets up browser reloading
gulp.task('server', function () {

    var config = require('./config/dev-config.json');
    var proxyOptions = url.parse(config.backendUri);

    proxyOptions.route = '/data';

    browserSync.init({
        server: {
            baseDir: 'dist',
            middleware: [
                proxy(proxyOptions),
                // rewrite for AngularJS HTML5 mode, redirect all non-file urls to index.html
                modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.gif|\\.json|\\.csv|\\.woff2|\\.woff|\\.ttf|\\.nxz$ /index.html [L]'])
            ]
        },
        port: 8082,
        notify: false
    });

	gulp.watch('scss/**/*.scss', gulp.series('watch-css'));
	gulp.watch('app/**/*.js', gulp.series('watch-js'));
    gulp.watch('app/**/*.html', gulp.series('watch-js'));
    gulp.watch('index.html', gulp.series('watch-index'));
    gulp.watch('con10t/**/*', gulp.series('watch-con10t'));
    gulp.watch('info/**/*', gulp.series('watch-info'));

});
