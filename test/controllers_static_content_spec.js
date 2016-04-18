/**
 * Author: Daniel M. de Oliveira
 */
describe ('StaticContentController', function() {

	var TEMPLATE_URL = "con10t/{LANG}/title.html";
	var PROJECTS_JSON = 'con10t/content.json';

	var scope = {};

	var prepare = function (route,title,primaryLanguage,searchParam) {
		module('arachne.controllers');
		module('idai.components', function($provide) {
			$provide.value('$location', {
				search : function () {
					return searchParam;
				},
				path : function () {
					return route+'/'+title;
				},
				hash : function() {
					return "";
				}
			});
			$provide.constant('$stateParams', {
				"title" : title
			});
			$provide.value('language', {
				browserPrimaryLanguage: function () {
					return primaryLanguage;
				}
			});
		});

		
		inject(function ($controller, _$httpBackend_) {
			$httpBackend = _$httpBackend_;
			$controller('StaticContentController', {'$scope': scope});
		});
	}

	var setUpSimpleProjectJson = function(jsonFile,itemName,itemLang) {
		$httpBackend.expectGET(jsonFile).respond(200,'{\
			"id": "","children": [{\
				"id": "'+itemName+'",\
				"title": {\
					"'+itemLang+'": "DAI - Objectdatabase"\
				}}]}');
		$httpBackend.flush();
	}

	it ('should provide a german templateUrl with search param lang=de',function(){
		prepare('/project','title','de',{ "lang" : "de" });
		expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','de'));
	});

	it ('should provide an italian templateUrl (no search param) if project configured for italian',function(){
		prepare('/project','title','it',{});
		setUpSimpleProjectJson(PROJECTS_JSON,'title','it');
		expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','it'));
	});

	it ('should fallback to a german templateUrl (no search param) if no project configured',function(){
		prepare('/project','title','it',{});
		setUpSimpleProjectJson(PROJECTS_JSON,'title','de');
		expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','de'));
	});
	
	it ('should fallback to a german templateUrl (no search param) if project not configured for italian',function(){
		prepare('/project','title','it',{});
		setUpSimpleProjectJson(PROJECTS_JSON,'someOtherProject','it');
		expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','de'));
	});

	it ('should search for a matching project translation recursively',function(){
		prepare('/project','title','it',{});
		$httpBackend.expectGET(PROJECTS_JSON).respond(200,'{\
			"id": "",\
			"children": [\
			{\
				"id": "1",\
				"children": [\
					{\
						"id": "fotorom",\
						"children" : [ {\
							"id" : "title", \
							"title" : { \
								"it" : "dede"\
							}}]}]}]}');
		$httpBackend.flush();
		expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','it'));
	});

	it ('should serve content from the static folder for the info route',function(){
		prepare('/info','title','it',{});
		setUpSimpleProjectJson('info/content.json','title','it');
		expect(scope.templateUrl).toBe('info/it/title.html');
	});
});