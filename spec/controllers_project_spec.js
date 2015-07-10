/**
 * Author: Daniel M. de Oliveira
 */
describe ('ProjectController', function() {

	var PROJECT_TITLE = "project_title";
	var TEMPLATE_URL = "con10t/{LANG}/"+PROJECT_TITLE+".html";
	var PROJECTS_JSON = 'con10t/projects.json';

	var scope = {};

	var prepare = function (primaryLanguage,searchParam) {
		module('arachne.controllers', function ($provide) {
			$provide.value('$location', {
				search : function () {
					return searchParam;
				}
			});
			$provide.constant('$routeParams', {
				"name" : PROJECT_TITLE
			});
		});
		module('arachne.services', function($provide) {
			$provide.value('language', {
				__: function () {
					return primaryLanguage;
				}
			});
		});

		
		inject(function ($controller, _$httpBackend_) {
			$httpBackend = _$httpBackend_;
			$controller('ProjectController', {'$scope': scope});
		});
	}

	var setUpSimpleProjectJson = function(projectName,projectLang) {
		$httpBackend.expectGET(PROJECTS_JSON).respond(200,'[{\
			"id": "","children": [{\
				"id": "'+projectName+'",\
				"title": {\
					"'+projectLang+'": "DAI - Objectdatabase"\
				}}]}]');
		$httpBackend.flush();
	}

	it ('should provide a german templateUrl with search param lang=de',function(){
		prepare('de',{ "lang" : "de" });
		expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','de'));
	});

	it ('should provide an italian templateUrl (no search param) if project configured for italian',function(){
		prepare('it',{});
		setUpSimpleProjectJson(PROJECT_TITLE,'it');
		expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','it'));
	});

	it ('should fallback to a german templateUrl (no search param) if no project configured',function(){
		prepare('it',{});
		setUpSimpleProjectJson(PROJECT_TITLE,'de');
		expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','de'));
	});
	
	it ('should fallback to a german templateUrl (no search param) if project not configured for italian',function(){
		prepare('it',{});
		setUpSimpleProjectJson('someOtherProject','it');
		expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','de'));
	});

	it ('should search for a matching project translation recursively',function(){
		prepare('it',{});
		$httpBackend.expectGET(PROJECTS_JSON).respond(200,'[{\
			"id": "",\
			"children": [\
			{\
				"id": "1",\
				"children": [\
					{\
						"id": "fotorom",\
						"children" : [ {\
							"id" : "project_title", \
							"title" : { \
								"it" : "dede"\
							}}]}]}]}]');
		$httpBackend.flush();
		expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','it'));
	});
});