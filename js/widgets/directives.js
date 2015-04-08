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

    .directive('con10tToc', function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/widgets/con10t-toc.html'
        };
    })

	.directive('con10tCatalogMap', function() {
		return {
			restrict: 'E',
			scope: {
				overlays: '='
			},
			templateUrl: 'partials/widgets/con10t-catalog-map.html'
		};
	})
;
