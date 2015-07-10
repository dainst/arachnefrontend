'use strict';

angular.module('arachne.controllers')


/**
 * Sets the templateUrl for a localized static page.
 * The version of the static page gets determined
 * by specification by the user via search param lang 
 * or otherwise by an automatic language selection rule.
 *
 * Depending on the first part of the route (/info,/project),
 * it serves the contents of either the static/ or con10t/
 * directories.
 *
 * $scope
 *   templateUrl
 *
 * @author: Sebastian Cuy
 * @author: Daniel M. de Oliveira
 */

.controller('StaticContentController', ['$scope', '$routeParams', '$http', '$location', 'language', 'languageSelection',
function ($scope, $routeParams, $http, $location, language, languageSelection) {

	var CONTENT_URL = '{LOCATION}/{LANG}/{NAME}.html';

	// ## ROUTE TO CONTENT MAPPING ##

	var toc_json = ''; // used for language auto-selection.
	var content_url = '';

	if ($location.path().indexOf('/info')==0){
		toc_json = 'static/top.json';
		content_url = CONTENT_URL.replace('{LOCATION}','static');
	}else{
		toc_json = 'con10t/projects.json';
		content_url = CONTENT_URL.replace('{LOCATION}','con10t');
	}
	content_url = content_url.replace('{NAME}',$routeParams.name);


	if ($location.search()['lang']!=undefined){
		$scope.templateUrl = content_url.replace('{LANG}',$location.search()['lang']);
		return;
	}



    // If language is not explicitly specified,
	// auto-determine one.

	/**
	 * Searches recursively through an object tree and
	 * determines if there is an item whose title matches
	 * $routeParams.name and which has a title for lang.
	 *
	 * Abstract tree structure:
	 * item
	 *   id: the_id,
	 *   title: ( lang_a : title, lang_b : title ),
	 *   children: [ item, item, item ]
	 *
	 * @param lang
	 * @param item the root of the object tree.
	 * @returns true if there is at least one item
	 *   meeting the above mentioned condition. false
	 *   otherwise.
	 */
	var isItemAvailableForLang = function(lang,item) {
		var recursive = function(item){
			if (item.id==$routeParams.name&&item.title[lang]) return true;
			if (item.children)
				for (var i=0; i< item.children.length;i++)
					if (recursive(item.children[i])) return true;
			return false;
		}
		if (recursive(item)) return true;
		return false;
	}

	var setTemplateUrlForLang = function(lang) {
		$scope.templateUrl=content_url.replace('{LANG}',lang);
	}

	$http.get(toc_json).success(function(data){
		languageSelection.__ (language.__(),isItemAvailableForLang,setTemplateUrlForLang,data[0]);
	});
}]);