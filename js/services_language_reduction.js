'use strict';

/**
 * Walks trough all elements of an JSON object tree
 * and adjusts the titles of nodes to only appear
 * in one language. The language
 * for each item's title gets chosen by considering
 * the users primary selected browser language and
 * the translations available for each title.
 *
 * Abstract tree structure before:
 *
 * item
 *   id: the_id,
 *   title: ( lang_a : title_lang_a, lang_b : title_lang_b ),
 *   children: [ item, item, item ]
 *
 * Abstract tree structure after:
 *
 * item
 *   id: the_id,
 *   title: title_lang_b,
 *   children: [ item, item, item ]
 *
 * @author: Daniel M. de Oliveira
 */
angular.module('arachne.services')

.factory('languageReduction',
	['language', 'languageSelection', function(language, languageSelection) {

	return {

		__ : function(node){

			var adjustTitleForLang = function(lang,node) {
				if (node.title)
					node.title=node.title[lang];
			}

			var isTitleAvailableForLang = function (lang,item) {
				if (!item.title) return false;
				return item.title[lang];
			}

			var recurseProjectsToAdjustTitle = function(node){

				languageSelection.__ (language.__(),isTitleAvailableForLang,adjustTitleForLang,node);

				if (! node.children) return;
				for (var i=0;i<node.children.length;i++) {
					recurseProjectsToAdjustTitle(node.children[i]);
				}
			}

			recurseProjectsToAdjustTitle(node);
		}
	};
}]);
