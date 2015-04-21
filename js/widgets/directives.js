'use strict';

/* Widget directives */
angular.module('arachne.widgets.directives', [])
	.directive('con10tItem', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				attrs.$observe('con10tItem', function(value) {
					element.attr("href", "http://arachne.dainst.org/entity/" + value);
				});
			}
		}
	})

	.directive('con10tSearchQuery', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				
				attrs.$observe('con10tSearchQuery', function(value) {
					scope.q = value;
					updateHref();
				});

				attrs.$observe('con10tSearchFacet', function(value) {
					scope.fq = value;
					updateHref();
				});

				function updateHref() {
					var href = "http://arachne.dainst.org/search?q=" + scope.q;		
					if (scope.fq) href += "&fq=" + scope.fq;
					element.attr("href", href);
				}

			}
		}
	})

	.directive('con10tPage', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				attrs.$observe('con10tPage', function(value) {
					element.attr("href", "http://arachne.dainst.org/projects/" + value);
				});
			}
		}
	})

	.directive('con10tToc', ['$location', '$anchorScroll', function ($location, $anchorScroll) {
		return {
			restrict: 'E',
			scope: {
				tocHeading: '@'
			},
			templateUrl: 'partials/widgets/con10t-toc.html',
			link: function(scope, element, attrs) {

				var headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

				scope.toc = [];

				for(var i = 0; i < headings.length; i++) {
					var headingID = headings[i].textContent.replace(/ /g, "_");
					var heading = {
						target: headingID,
						text: headings[i].textContent,
						depth: "con10t-toc-level-" + headings[i].tagName.charAt(1)
					};
					headings[i].id = headingID;
					scope.toc.push(heading);
				}

				// Angular seems to do anchorScroll() directly on load. But without the scope initialized, the targets are not yet
				// existing. Therefore: Try a delayed anchorScroll() after the scope is initialized, if there is an existing hash.
				if($location.hash() != ""){
					$anchorScroll();
				}

				scope.scrollTo = function(id) {
					$location.hash(id);
					console.log("Hash onclick: " + $location.hash());
					$anchorScroll();
				}

			}
		};
	}])

	.directive('con10tCatalogTree', ['Catalog', function(Catalog) {
		return {
			restrict: 'E',
			scope: {
				catalogId: '@'
			},
			templateUrl: 'partials/widgets/con10t-catalog-tree.html',
			link: function(scope) {

				var slashRegex = /\//g;
				
				scope.catalog = Catalog.get({id:scope.catalogId});
				scope.isShown = {};
				
				scope.escapePath = function(path){
					return path.replace(slashRegex, '\\/');
				};
				
				scope.toggleCollapse = function(label){
					scope.isShown[label] = !scope.isShown[label];
				};
				
				scope.checkIfShown = function(label){
					return scope.isShown[label]; // at first load -> undefined, so it gets hidden but: ugly?
				};

			}
		};
	}])

	.directive('con10tCatalogMap', function() {
		return {
			restrict: 'E',
			scope: {
				overlays: '='
			},
			templateUrl: 'partials/widgets/con10t-catalog-map.html'
		};
	})

    .directive('con10tSearch', ['$location', '$filter', function($location, $filter) {
        return {
            restrict: 'E',
            templateUrl: 'partials/widgets/con10t-search.html',
			scope: {
				catalogId: '@'
			},
			link: function(scope, element, attrs) {
                scope.placeholder = attrs.searchPlaceholder;

                if(!scope.placeholder)
                    scope.placeholder = $filter('i18n')('ui_projectsearchplaceholder');

				scope.search = function() {
					var url = "search/?q=catalogPaths:"+scope.catalogId;

                    if(scope.q != null)
                        url += "+"+scope.q;
                    $location.url(url);
				}
			}
        };
    }])
;
