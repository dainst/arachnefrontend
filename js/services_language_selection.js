'use strict';

angular.module('arachne.services')

/**
 * Given a language, determines by a
 * rule if this language is applicable or if not which
 * other language is applicable in a given context.
 * Once found a suitable language, an operation to
 * apply that language in the clients context gets performed.
 *
 * @author: Daniel M. de Oliveira
 */
.factory('languageSelection', function(){

	var GERMAN_LANG = 'de';
	var ENGLISH_LANG = 'en';

	return {

		/**
		 * The language selection rule.
		 *
		 * @param prefered_lang - the language initially prefered by the client
		 * @param isLangApplicable - callback function(lang,param) for testing
		 *   if lang is applicable in the clients context
		 * @param applyLang - callback function(lang_,param) for applying
		 *   lang in the clients context
		 * @param param - used as second param for the callbacks
		 */
		__ : function(prefered_lang,isLangApplicable,applyLang,param){

			if (prefered_lang==GERMAN_LANG){
				applyLang(GERMAN_LANG,param)
				return;
			}

			if (isLangApplicable(prefered_lang,param)){
				applyLang(prefered_lang,param);
			} else if (prefered_lang==ENGLISH_LANG){
				applyLang(GERMAN_LANG,param);
			} else if (isLangApplicable(ENGLISH_LANG,param))
				applyLang(ENGLISH_LANG,param);
			else
				applyLang(GERMAN_LANG,param);
		}
	}
});