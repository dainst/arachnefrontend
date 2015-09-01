module.exports = function(grunt) {

	grunt.initConfig({
		watch: {
	        livereload: {
	            options: {
	                livereload: '<%= connect.server.options.livereload %>'
	            },
	            files: [
	                '**/*.html',
	                'css/**/*.css',
	                'img/{,*/}*',
	                'js/**/*.js',
	                'lib/**/*.js'
	            ]
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
							modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.gif|\\.json|\\.woff2|\\.woff\.ttf$ /index.html [L]']),
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
							modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.gif|\\.json\\swf$ /index.html [L]']),
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




	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-connect-proxy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-protractor-runner');

	grunt.registerTask('server', [
        'configureProxies:server',
		'connect:server',
		'watch'
    ]).registerTask('uitest', [
		'configureProxies:testserver',
		'connect:testserver',
		'protractor:e2e'
	]);

};
