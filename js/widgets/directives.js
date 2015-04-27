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

    .directive('con10tSearch', ['$location', '$filter', 'Query', 'Entity', function($location, $filter, Query, Entity) {

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
						url += "catalogPaths:"+this.escapePath(scope.catalogId)+"+";

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
            scope.escapePath = function(path){
               return path.replace(scope.slashRegex, '\\/');
            };
			}
        };
    }])
	.directive('con10tTree', ['Query', 'Entity', function(Query, Entity){
        return {
            restrict: 'E',
            templateUrl: 'partials/widgets/con10t-tree.html',
            scope: {
                hierarchyFacets: '=',
                recursiveFacets: '=',
                fq: "="
            },
            link: function(scope) {
            // root -> fq facetten
                // blätter -> alle typen facet[0]
                // blätter ->  alle typen facet[1]
                // blätter -> ...

                scope.currentTree = [];

                var previous;
                for(var i = 0; i < scope.fq.length; i++) {
                    var split = scope.fq[i].split(':');

                    if (i == 0)
                    {
                        scope.currentTree.push({parent: null, children: [],
                            nodeName: split[0], nodeValue: split[1], nodeDepth: 0});
                    }
                }
                // node
                    // parent
                    // children
                    // name
                    // value
                    // depth

                // create query from tree
                    // input: node
                    // rekursiv über eltern teilfacetten zur query hinzufügen

                scope.getNodeChildren = function(parentName) {
                    var parentNode = this.getNodeByName(this.currentTree[0], parentName);

                    if(parentNode.children.length != 0)
                        return;

                    var baseQuery = new Query();

                    baseQuery.q = '*';
                    baseQuery.limit = 0;

                    // Collect previous facets from tree
                    var previousFacets = this.collectAncestorsFacets(parentNode);
                    for(var i = 0; i < previousFacets.length; i++)
                        baseQuery = baseQuery.addFacet(previousFacets[i][0], previousFacets[i][1]);
                    console.dir(previousFacets[0]);
                    // Add new facet from fq-array, if there still is an unused one.
                    if(parentNode.nodeDepth <= this.fq.length)
                    {
                        var split = this.fq[parentNode.nodeDepth+1].split(':');
                        baseQuery = baseQuery.addFacet(split[0], split[1]);
                        console.dir(split);
                    }

                    console.dir(baseQuery);

                    Entity.query(baseQuery, function(response){
                        //console.dir(response);
                    });
                };
                scope.getNodeByName = function(localRoot, nodeName){
                    if(localRoot.nodeName == nodeName)
                        return localRoot;
                    if(localRoot.children == null || localRoot.children.length == 0)
                        return null;

                    for(var i = 0; i < localRoot.children.length; i++)
                        return this.getNodeByName(localRoot.children[i], nodeName);
                };
                scope.collectAncestorsFacets = function(node)
                {
                    var knownFacets = [[node.nodeName,node.nodeValue]];
                    if(node.parent != null)
                        knownFacets = knownFacets.concat(this.collectAncestorsFacets(node.parent));
                    return knownFacets;
                };
            }
        };
    }])
;
