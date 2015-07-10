'use strict';

/**
 * Provides translations for keys based on the primary browser language of the user.
 * Makes use of the CoDArchLab Transl8 tool.
 *
 * @author: Daniel M. de Oliveira
 */
angular.module('arachne.services')
.factory('transl8', ['$http', 'language', function($http, primaryBrowserLanguage) {

	var ENGLISH_LANG='en';
	var TRANSLATION_MISSING = 'TRL8 MISSING';
	var TRANSL8_JSONP_URL = "http://crazyhorse.archaeologie.uni-koeln.de/transl8/" +
		"translation/jsonp?application=arachne4_frontend&lang={LANG}&callback=JSON_CALLBACK";



	var translationLang=ENGLISH_LANG;
	if (primaryBrowserLanguage.__()=='de') translationLang='de';
	var transl8Url = TRANSL8_JSONP_URL.replace('{LANG}',translationLang);



	var translations={}; // Map: [transl8_key,translation].
	$http.jsonp(transl8Url).
		success(function(data) {

			for(var i = 0; i < data.length; i++) {
				translations[data[i].key] = data[i].value;
			}
		}).
		error(function() {
			alert("ERROR: Could not get translations. Try to reload the page or send a mail to arachne@uni-koeln.de");
		});

	return {

		getTranslation: function(key) {

			var translation = translations[key];
			if (!translation || 0 === translation.length)
				translation=TRANSLATION_MISSING+' ('+key+')';

			return translation;
		}
	}
}]);