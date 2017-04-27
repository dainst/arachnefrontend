'use strict';

angular.module('arachne.directives')

	.directive('arCatalogOccurences', ['arachneSettings', '$http', '$uibModal', 'Catalog', 'CatalogEntry', 
		function (arachneSettings, $http, $uibModal, Catalog, CatalogEntry) {

			return {
				scope: {
					entity: '='
				},
				templateUrl: 'app/catalog/ar-catalog-occurences.html',
				link: function (scope, element, attrs) {

					scope.catalogEntries = [];
                    scope.projectEntries = [];

					scope.previewCatalogEntry = function (catalogEntry) {
						var entityPreview = {
							title: scope.entity.title,
							subtitle: scope.entity.subtitle,
							thumbnailId: scope.entity.thumbnailId
						};
						var preview = $uibModal.open({
							templateUrl: 'app/catalog/preview-catalog-entry.html',
							controller: ['$scope', function ($scope) {
								$scope.catalogEntry = catalogEntry;
								$scope.entity = entityPreview;
							}]
						});
					};

					scope.createEntry = function() {
						//TODO: Parse Sections in entry.text
						var createEntryPos = $uibModal.open({
							templateUrl: 'app/catalog/create-entry-pos.html',
							controller: ['$scope', function ($scope) {
								$scope.catalogs = Catalog.query()
							}]
						});
						createEntryPos.close = function(catalog) {
							var entry = {
								catalogId: catalog.id,
								parentId: catalog.root.id,
								arachneEntityId: scope.entity.entityId,
								label: scope.entity.title
							};
							var editEntryModal = $uibModal.open({
								templateUrl: 'app/catalog/edit-entry.html',
								controller: 'EditCatalogEntryController',
								resolve: {
									entry: function () {
										return entry
									}
								}
							});
							editEntryModal.close = function(newEntry) {
								CatalogEntry.save(newEntry, function(data){
									if (data.error_message) {
										console.log(data.error_message);
									} else {
										scope.loadOccurences();
									}
								});
								editEntryModal.dismiss();
							};
							createEntryPos.dismiss();
						}
					};
					
					scope.loadOccurences = function () {
					   if (scope.entity) {
							 $http.get(arachneSettings.dataserviceUri + "/catalog/list/" + scope.entity.entityId)
								.success(function (data) {
									scope.catalogEntries = data;
                                    for (var i = 0, len = scope.catalogEntries.length; i < len; i++)
                                        if(scope.catalogEntries[i].projectId != "")
                                            scope.projectEntries.push(scope.catalogEntries[i]);
								}).error(function (result) {
									console.log("Error requesting /catalog/list/ in ar-catalog-occurences-directive");
								}
							);
					   }
					};
					
					scope.$watch('entity', function () {
						scope.loadOccurences();
					});
				}
			}
		}
	]);