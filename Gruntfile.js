module.exports = function(grunt) {

	var paths = {
		bootstrap: 'bower_components/bootstrap-sass/assets/',
		idaicomponents: 'bower_components/idai-components/'
	};

	grunt.initConfig({
		sass: {
			options: {				
				includePaths: [
					paths.bootstrap + 'stylesheets/',
					paths.idaicomponents + 'src/scss/',
					'.'
				]
			},
			dist: {
				files: {
					'dist/css/app.css': 'scss/app.scss'
				}
			}
		},
        concat: {
            dist: {
                src: [
                    'js/**/*.js',
                    '!js/app.js',
                    '!js/concat.js',
                ],
                dest: 'js/concat.js'
            }
        },
		copy: {
			dist: {
				expand: true,
				cwd: paths.bootstrap,
				src: 'fonts/bootstrap/**',
				dest: 'dist/'
			}
		},
		watch: {
	        livereload: {
	            options: {
	                livereload: '<%= connect.server.options.livereload %>'
	            },
	            files: [
	                '**/*.html',
	                'scss/**/*.scss',
	                'img/{,*/}*',
	                'js/**/*.js',
	                'lib/**/*.js',
                    '!js/concat.js'
	            ],
                tasks: ['concat','sass']
	        }
	    },
		connect: {
			server: {
				options: {
					port: 1234,
					livereload: 35729,
					middleware: function (connect, options) {
						var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
						var modRewrite = require('connect-modrewrite');
						return [
							// Include the proxy to the dev backend
							proxy,
							// rewrite for AngularJS HTML5 mode, redirect all non-file urls to index.html
							modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.gif|\\.json|\\.woff2|\\.woff|\\.ttf$ /index.html [L]']),
							// Serve static files.
							connect.static(options.base[0])
						];
					}
				},
				proxies: [{
				    context: '/data',
				    host: 'lakota.archaeologie.uni-koeln.de'
				}]
			},
			testserver: {
				options: {
					port: 1234,
					livereload: 35729,
					middleware: function (connect, options) {
						var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
						var modRewrite = require('connect-modrewrite');
						return [
							// Include the proxy to the dev backend
							proxy,
							// rewrite for AngularJS HTML5 mode, redirect all non-file urls to index.html
							modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.gif|\\.json|\\.woff2|\\.woff|\\.ttf$ /index.html [L]']),
							// Serve static files.
							connect.static(options.base[0])
						];
					}
				},
				proxies: [{
					context: '/data',
					host: 'localhost',
					port: 1236
				}]
			}
		},
		protractor: {
			options: {
				configFile: "test/e2e/protractor.conf.js",
			},
			e2e: {
				options: {
					keepAlive: false
				}
			},
			continuous: {
				options: {
					keepAlive: false
				}
			}
		}
	});



    grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-connect-proxy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-protractor-runner');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('server', [
		'copy',
		'concat',
		'sass',
        'configureProxies:server',
		'connect:server',
		'watch'
    ]).registerTask('uitest', [
		'configureProxies:testserver',
		'connect:testserver',
		'protractor:e2e'
	]);

};
