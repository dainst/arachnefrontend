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
							// rewrite for AngularJS HTML5 mode
							modRewrite(['^[^\\.]*$ /index.html [L]']),
							// Serve static files.
							connect.static(options.base[0])
						];
					}
				},
				proxies: [{
				    context: '/data',
				    host: 'lakota.archaeologie.uni-koeln.de'
				}]
			}
		}
	});
  
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-connect-proxy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('server', [
        'configureProxies:server',
		'connect:server',
		'watch'
    ]);

};