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
					element.attr("href", "http://arachne.dainst.org/project/" + value);
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
				var headings = document.querySelectorAll(".con10t-toc-entry");

				scope.toc = [];

				for(var i = 0; i < headings.length; i++) {
					var headingID = headings[i].textContent.replace(/ /g, "_");
					var heading = {
						target: headingID,
						text: headings[i].textContent,
						depth: "con10t-toc-item level-" + headings[i].tagName.charAt(1)
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
					$anchorScroll()
				}
			}
		};
	}])

    .directive('con10tSearch', ['$location', '$filter', function($location, $filter) {

        return {
            restrict: 'E',
            templateUrl: 'partials/widgets/con10t-search.html',
			scope: {
				catalogId: '@',
				fq: '@'
			},
			link: function(scope, element, attrs) {
            scope.placeholder = attrs.searchPlaceholder;
            scope.slashRegex  = /\//g;

            if(!scope.placeholder)
               scope.placeholder = $filter('transl8')('ui_projectsearchplaceholder');

				scope.search = function() {
              	var url = "search/?q=";
					if(scope.catalogId != undefined && scope.catalogId != "")
						url += "catalogPaths:"+$filter('escapeSlashes')(scope.catalogId)+"+";

               if(scope.q != null && scope.q != "")
                  url += scope.q;
					else
						url += "*";

					if(scope.fq != undefined && scope.fq != "")
               {
                  var split = scope.fq.split(':');
                  url += '&fq='+split[0]+':"'+split[1]+'"';
               }
					$location.url(url);
				};
			}
        };
    }])

;
