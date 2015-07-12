/**
 * Author: Daniel M. de Oliveira
 */
describe ('Ar-Navbar', function() {

	var scope = {};

	var prepare = function (primaryLanguage) {
		module('arachne.controllers');
		module('arachne.services', function($provide) {
			$provide.value('language', {
				browserPrimaryLanguage: function () {
					return primaryLanguage;
				}
			});
			$provide.value('authService', {
				getUser: function () {
					return 'testUser';
				}
			});
			$provide.value('transl8', {
				getTranslation: function () {
					return 'translation';
				}
			});
			$provide.constant('arachneSettings', {
				dataserviceUri: '/data'
			});
		});
		module('arachne.filters');
		module('arachne.directives');
		module('templates');

		
		inject(function($rootScope, $compile, $templateCache,$httpBackend) {
			
			template = $templateCache.get('partials/directives/ar-navbar.html');
			$templateCache.put('app/partials/directives/ar-navbar.html',template);
			
			$httpBackend.expectGET('static/projects.json').respond(200,'[{\
				"id": "",\
				"children": [\
				{\
					"id": "header",\
					"children": [\
						{\
							"id": "about",\
							"title": {\
								"de": "Über Arachne",\
								"en": "About Arachne"\
							}}]}]}]');
			
			
		    scope = $rootScope.$new();
			$templateCache.put();
		    element =
		        '<ar-navbar content-dir="static"></ar-navbar>';

		    scope.size = 100;
		    element = $compile(element)(scope);
		    scope.$digest();
			$httpBackend.flush();
		});
	};
		
	it ('show german menu item',function(){
		prepare('de');
		expect(element.find('ul').find('li').eq(0).find('a').text()).toBe("Über Arachne");
	});
	
		
	it ('show english menu item',function(){
		prepare('en');
		expect(element.find('ul').find('li').eq(0).find('a').text()).toBe("About Arachne");
	});
});