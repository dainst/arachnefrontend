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

.factory('localizedContent',
	['language', 'languageSelection', function(language, languageSelection) {

	return {

		reduceTitles : function(node){

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
		},

		determineLanguage : function (node,title) {

			var return_language = '';

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
					if (item.id==title&&item.title[lang]) return true;
					if (item.children)
						for (var i=0; i< item.children.length;i++)
							if (recursive(item.children[i])) return true;
					return false;
				}
				if (recursive(item)) return true;
				return false;
			}

			var setTemplateUrlForLang = function(lang) {
				return_language = lang;
			}

			languageSelection.__ (language.__(),isItemAvailableForLang,setTemplateUrlForLang,node);
			return return_language;
		}
	};
}]);
