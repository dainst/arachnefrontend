'use strict';

/**
 * Perform localization related tasks on 
 * tree structure exemplified by:
 * 
 * node
 *   id: the_id,
 *   title: ( lang_a : title_lang_a, lang_b : title_lang_b ),
 *   children: [ node, node, node ]
 * 
 * @author: Daniel M. de Oliveira
 */
angular.module('arachne.services')

.factory('localizedContent',
	['language', 'languageSelection', function(language, languageSelection) {

	return {

		/**
	     * Walks trough all elements of the tree
		 * and adjusts the titles of nodes to only appear
		 * in one language. 
		 *
		 * The choice is beeing made for each node independently 
		 * of the other nodes via the language selection 
		 * rule, taking into consideration the 
		 * users currently selected primary
		 * browser language and the availability of the 
		 * languages of the node.
		 *
		 * Tree structure before:
		 *
		 * node
		 *   id: the_id,
		 *   title: ( lang_a : title_lang_a, lang_b : title_lang_b ),
		 *   children: [ node, node, node ]
		 *
		 * Tree structure after:
		 *
		 * node
		 *   id: the_id,
		 *   title: title_lang_b,
		 *   children: [ node, node, node ]
		 */
		reduceTitles : function(node){

			var adjustTitleForLang = function(lang,node) {
				if (node.title)
					node.title=node.title[lang];
			}

			var isTitleAvailableForLang = function (lang,node) {
				if (!node.title) return false;
				return node.title[lang];
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

		/**
		 * Walks through all elements of the tree and 
		 * determines which language for a node of 
		 * a given title is applicable. 
		 * 
		 * The choice is beeing made via the language selection 
		 * rule, taking into consideration the 
		 * users currently selected primary
		 * browser language and the availability of the 
		 * languages of the node.
		 *
		 * @param node
		 * @param title
		 */
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
			var isItemAvailableForLang = function(lang,node) {
				var recursive = function(node){
					if (node.id==title&&node.title[lang]) return true;
					if (node.children)
						for (var i=0; i< node.children.length;i++)
							if (recursive(node.children[i])) return true;
					return false;
				}
				if (recursive(node)) return true;
				return false;
			}

			var setLang = function(lang) {
				return_language = lang;
			}

			languageSelection.__ (language.__(),isItemAvailableForLang,setLang,node);
			return return_language;
		}
	};
}]);
