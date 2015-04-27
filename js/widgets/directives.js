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
				var headings = document.querySelectorAll("h1.con10t-toc-entry" +
                ", h2.con10t-toc-entry, h3.con10t-toc-entry, h4.con10t-toc-entry" +
                ", h5.con10t-toc-entry, h6.con10t-toc-entry");

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
					$anchorScroll()
				}
			}
		};
	}])

	.directive('con10tCatalogTree', ['Catalog', '$filter', function(Catalog, $filter) {
		return {
			restrict: 'E',
			scope: {
				catalogId: '@'
			},
			templateUrl: 'partials/widgets/con10t-catalog-tree.html',
			link: function(scope) {
				
				scope.catalog = Catalog.get({id:scope.catalogId});
				scope.isShown = {};
				
				scope.escapePath = function(path){
					return $filter('escapeSlashes')(path)
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
				catalogId: '@',
				fq: '@'
			},
			link: function(scope, element, attrs) {
            scope.placeholder = attrs.searchPlaceholder;
            scope.slashRegex  = /\//g;

            if(!scope.placeholder)
               scope.placeholder = $filter('i18n')('ui_projectsearchplaceholder');

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
	.directive('con10tTree', ['Query', 'Entity', function(Query, Entity){
        return {
           restrict: 'E',
           templateUrl: 'partials/widgets/con10t-tree.html',
           scope: {
           },
           link: function (scope, element, attrs) {
              scope.hardFacets = [];
              if(!attrs.fq)
                 return;

              var fq_facets = attrs.fq.split(',');
              for(var i = 0; i < fq_facets.length; i++)
              {
                 scope.hardFacets.push(fq_facets[i].split(':'));
              }
              scope.hierarchyFacet = attrs.hierarchyFacet;
              scope.tree = {name: scope.hardFacets[scope.hardFacets.length - 1][1], depth: 0, children:[], facet: null, parent: null};

              scope.getNodeChildren = function(node){
                 console.log("node: " + node.name);
                 if(node.children != 0){
                    return;
                 }


                 var treeQuery = new Query();

                 for(var i = 0; i < scope.hardFacets.length; i++){
                    treeQuery = treeQuery.addFacet(scope.hardFacets[i][0], scope.hardFacets[i][1]);
                 }

                 var collectedFacets = this.collectAllFacets(node);

                 for(var i = 0; i < collectedFacets.length; i++){
                    treeQuery = treeQuery.addFacet(collectedFacets[i][0], collectedFacets[i][1]);
                 }

                 treeQuery.q = "*";

                 Entity.query(treeQuery.toFlatObject(), function(response) {
                    if(scope.hierarchyFacet){
                       for(var  i = 0; i < response.facets.length; i++){
                          var currentResultFacet = response.facets[i];

                          if(currentResultFacet.name.indexOf(scope.hierarchyFacet) > -1){
                             for(var j = 0; j < currentResultFacet.values.length; j++)
                             {
                                node.children.push({name: currentResultFacet.values[j].value, depth: node.depth + 1, children:[],
                                   facet: [currentResultFacet.name, currentResultFacet.values[j].value], parent: node});
                             }
                          }
                       }
                    }
                    else {
                       console.log("Todo: Defined hierarchy?");
                    }


                    console.dir(scope.tree);
                 });
              }
              scope.collectAllFacets = function(node){
                 var result = [];
                 if(node.parent != null){

                    result.push(node.facet);
                    result = result.concat(this.collectAllFacets(node.parent));
                    return result;
                 }
                 return result;
              }
           }

        }
    }])
;
