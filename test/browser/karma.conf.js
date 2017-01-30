// Karma configuration
// Generated on Mon Jun 15 2015 13:37:24 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor'
    ],
    // list of files / patterns to load in the browser
    files: [

      '../../node_modules/angular/angular.js',
      '../../node_modules/angular-mocks/angular-mocks.js',
      '../../node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
      '../../node_modules/idai-components/dist/idai-components.min.js',
      '../../app/_modules.js',
      '../../app/pages/*.js',
      '**/*.spec.js',
      '../../app/**/*.html'
    ],


    // list of files to exclude
    exclude: [
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher



    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
	
	ngHtml2JsPreprocessor: {
	    stripPrefix: 'app/',
		moduleName: 'templates'
	},
	preprocessors: {
	    "partials/**/*.html": "ng-html2js"
	}
  });
};
