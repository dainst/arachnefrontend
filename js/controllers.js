'use strict';

/* Controllers */

angular.module('arachne.controllers', ['ui.bootstrap'])
.controller("NavBarCtrl",[ '$scope', 'con10tService', 
	function ($scope, con10tService){
		
		$scope.topMenu = null;
		con10tService.getTop().success(function(data){
			$scope.topMenu = data;
		});
	}
])
.controller('MenuCtrl',	[ '$scope', '$modal', 'authService', '$location', '$window',
	function ($scope,  $modal, authService, $location, $window) {

		$scope.user = authService.getUser();

		$scope.currentPath = $location.path();
		$scope.$on("$locationChangeSuccess", function() {			
			$scope.currentPath = $location.path();
		});

		$scope.openLoginModal = function() {
			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/loginForm.html',
				controller: 'LoginCtrl'
			});
			modalInstance.result.then(function(user) {
				$window.location.reload();
			});
		};

		$scope.logout = function() {
			authService.clearCredentials();
			$scope.user = authService.getUser();
			$window.location.reload();
		}

	}
])
.controller('LoginCtrl', ['$scope', '$modalInstance', 'authService', '$timeout', '$modal', '$window',
	function($scope, $modalInstance, authService, $timeout, $modal, $window){
		
		$scope.loginData = {};
		$scope.loginerror = false;

		$scope.login = function() {

			authService.setCredentials($scope.loginData.user, $scope.loginData.password, function(response) {
				$scope.loginerror = false;
				var closeModal = function () {
            		$modalInstance.close(authService.getUser());
            		$route.reload();
            	}
                $timeout(closeModal, 500);
			}, function(response) {
				$scope.loginerror = true;
			});

		};

		$scope.cancel = function () {
			$modalInstance.dismiss();
		};
	}
])

.controller('PwdActivationController', ['$scope', '$routeParams', '$filter', '$http',  'arachneSettings',
	function ($scope, $routeParams, $filter, $http, arachneSettings) {
		var token = $routeParams.token;
		$scope.success = false;
		$scope.error = "";

		$scope.submit = function() {
			if ($scope.password && $scope.passwordConfirm) {
				$scope.usrData.password = $filter('md5')($scope.password);
				$scope.usrData.passwordConfirm = $filter('md5')($scope.passwordConfirm);
			}
			$http.post(arachneSettings.dataserviceUri + "/user/activation/" + token, $scope.usrData, {
				"headers": { "Content-Type": "application/json" }
			}).success(function(data) {
				$scope.error = "";
				$scope.success = true;
			}).error(function(data) {
				$scope.error = data.message;
			});
		}
	}
])
.controller('PwdController', ['$scope', '$http',  'arachneSettings',
	function ($scope, $http, arachneSettings) {

		$scope.success = false;
		$scope.error = "";

		$scope.submit = function() {
			$http.post(arachneSettings.dataserviceUri + "/user/reset", $scope.usrData, {
				"headers": { "Content-Type": "application/json" }
			}).success(function(data) {
				$scope.error = "";
				$scope.success = true;
			}).error(function(data) {
				console.log(data);
				$scope.error = data.message;
			});
		}
	}
])
.controller('SearchFormCtrl', ['$scope', '$location',
	function($scope, $location) {

		$scope.search = function(fq) {
			if ($scope.q) {
				var url = '/search?q=' + $scope.q;
				if (fq) url += "&fq=" + fq;
				$scope.q = null;
				$location.url(url);
			}
		}

	}
])
.controller('SearchCtrl', ['$rootScope','$scope','searchService','categoryService', '$filter', 'arachneSettings', '$location', 'messageService', '$http',
	function($rootScope,$scope, searchService, categoryService, $filter, arachneSettings, $location, messageService, $http){

		$rootScope.hideFooter = false;
		
		$scope.currentQuery = searchService.currentQuery();
		$scope.q = angular.copy($scope.currentQuery.q);

		$scope.sortableFields = arachneSettings.sortableFields;
		// ignore unknown sort fields
		if (arachneSettings.sortableFields.indexOf($scope.currentQuery.sort) == -1) {
			delete $scope.currentQuery.sort;
		}

		categoryService.getCategoriesAsync().then(function(categories) {
			$scope.categories = categories;
		});
	
		searchService.getCurrentPage().then(function(entities) {
			$scope.entities = entities;

			//------------------ QUICKFIX -----------------------
			for(i=0; i<=$scope.entities.length-1; i++)
			{
				var filter;
				filter = $scope.entities[i].title.substring(0,26);
				if(filter == "Bestand-D-DAI-Z-Arch-FWH-F")
				{
					$scope.entities[i].tumbnailId = 0;
					console.log($scope.entities[i].thumbnailId = 0);
				}

			}

			//-------------------- QUICKFIX ----------------------
			$scope.resultSize = searchService.getSize();
			$scope.totalPages = Math.ceil($scope.resultSize / $scope.currentQuery.limit);
			$scope.currentPage = $scope.currentQuery.offset / $scope.currentQuery.limit + 1;
			$scope.facets = searchService.getFacets();
			var i = 0;
			var insert = [];
			for (var i = 0; i < $scope.facets.length; i++) {
				var facet = $scope.facets[i];
				facet.open = false;
				arachneSettings.openFacets.forEach(function(openName) {
					if (facet.name.slice(0, openName.length) == openName) {
						insert.unshift($scope.facets.splice(i--,1)[0]);
						facet.open = true;
					}
				});
			}
			insert.forEach(function(facet) {
				$scope.facets.unshift(facet);
			});
			$scope.cells = $filter('cellsFromEntities')(entities,$scope.currentQuery);
		}, function(response) {
			$scope.resultSize = 0;
			$scope.error = true;
			if (response.status == '404') messageService.addMessageForCode('backend_missing');
			else messageService.addMessageForCode('search_' +  response.status);
		});

		$scope.go = function(path) {
			$location.url(path);
		};

		$scope.previousPage = function() {
			if ($scope.currentPage > 1)
				$scope.currentPage -= 1;
			$scope.onSelectPage();
		};

		$scope.nextPage = function() {
			if ($scope.currentPage < $scope.totalPages)
				$scope.currentPage += 1;
			$scope.onSelectPage();
		};

		$scope.onSelectPage = function() {
			var newOffset = ($scope.currentPage-1) * $scope.currentQuery.limit;
			$location.url('search/' + $scope.currentQuery.setParam('offset', newOffset).toString());
		};

	}
])
.controller('CategoryCtrl', ['$rootScope','$scope', 'Query', 'categoryService', '$location', 'Entity',
	function($rootScope, $scope, Query, categoryService, $location, Entity) {

		$rootScope.hideFooter = false;

		$scope.category = $location.search().c;

		categoryService.getCategoriesAsync().then(function(categories) {
			$scope.title = categories[$scope.category].title;
			$scope.imgUri = categories[$scope.category].imgUri;
			$scope.subtitle = categories[$scope.category].subtitle;
			$scope.mapfacet = categories[$scope.category].geoFacet;
		});

		$scope.currentQuery = new Query().addFacet("facet_kategorie", $scope.category);
		$scope.currentQuery.q = "*";

		Entity.query($scope.currentQuery.toFlatObject(), function(response) {
			$scope.facets = response.facets;
			$scope.resultSize = response.size;
		});

	}
])
.controller('MapCtrl', ['$rootScope', '$scope', 'searchService', 'messageService',
	function($rootScope, $scope, searchService, messageService) {

		$scope.mapfacetNames = ["facet_aufbewahrungsort", "facet_fundort", "facet_geo"]; //, "facet_ort"

		$rootScope.hideFooter = true;

		var promise = null;

		$scope.searchDeferred = function() {
			if (promise) {
				return promise;
			}

			$scope.currentQuery = searchService.currentQuery();
			$scope.currentQuery.limit = 0;
			if (!$scope.currentQuery.restrict) {
				$scope.currentQuery.restrict = $scope.mapfacetNames[0];
			}

			promise = searchService.getCurrentPage().then(function(entities) {
				$scope.resultSize = searchService.getSize();
				$scope.facets = searchService.getFacets();
				for (var i = 0; i < $scope.facets.length; i++) {
					if ($scope.facets[i].name == $scope.currentQuery.restrict) {
						$scope.mapfacet = $scope.facets[i];
						break;
					}
				}
			}, function(response) {
				$scope.resultSize = 0;
				$scope.error = true;
				if (response.status == '404') messageService.addMessageForCode('backend_missing');
				else messageService.addMessageForCode('search_' +  response.status);
			});

			return promise;
		}
	}
])
.controller('EntityCtrl', ['$rootScope', '$routeParams', 'searchService', '$scope', '$modal', 'Entity', '$location','arachneSettings', 'Catalog', 'CatalogEntry', 'authService', 'categoryService', 'Query', 'messageService',
	function ($rootScope, $routeParams, searchService, $scope, $modal, Entity, $location, arachneSettings, Catalog, CatalogEntry, authService, categoryService, Query, messageService) {

		$rootScope.hideFooter = false;
		
		$scope.user = authService.getUser();
		$scope.serverUri = "http://" + document.location.host + document.getElementById('baseLink').getAttribute("href");

		categoryService.getCategoriesAsync().then(function(categories) {
			$scope.categories = categories;
		});

		$scope.currentQuery = searchService.currentQuery();

		$scope.go = function(path) {
			$location.url(path);
		};



		$scope.catalogs = Catalog.query();
		var catalog = Catalog.query();

		$scope.createEntry = function() {
			//TODO: Parse Secitons in entry.text
			var createEntryPos = $modal.open({
				templateUrl: 'partials/Modals/createEntryPos.html',
				controller: function ($scope) { $scope.catalogs = catalog},
				resolve: { catalog: function() { return catalog } }
			});
			createEntryPos.close = function(catalog) {
				var entry = {
					catalogId: catalog.id,
					parentId: catalog.root.id,
					arachneEntityId: $scope.entity.entityId,
					label: $scope.entity.title
				};
				var editEntryModal = $modal.open({
					templateUrl: 'partials/Modals/editEntry.html',
					controller: 'EditCatalogEntryCtrl',
					resolve: { entry: function() { return entry } }
				});
				editEntryModal.close = function(newEntry) {
					CatalogEntry.save(newEntry);
					editEntryModal.dismiss();
				}
				createEntryPos.dismiss();
			}
		}

		// TODO Abstract Sections-Template and Logic to seperate unit - for reuse 
		// LOGIC for sections-iteration
		$scope.isArray = function(value) {
			if(angular.isArray(value)) {
				if(value.length == 1) return false;
				return true;
			}
			return false;
		}

		// if no id given, but query get id from search and reload
		if (!$routeParams.id && $scope.currentQuery.hasOwnProperty('resultIndex')) {

			var resultIndex = parseInt($scope.currentQuery.resultIndex);
			searchService.getEntity(resultIndex).then(function(entity) {
				$location.url('entity/' + entity.entityId + $scope.currentQuery.toString());
				$location.replace();
			});

		} else {
			
			Entity.get({id:$routeParams.id}, function(data) {
				$scope.entity = data;

				//----------------- QUICKFIX -------------------

				var filter;
				filter = $scope.entity.title.substring(0,26);
				if(filter == "Bestand-D-DAI-Z-Arch-FWH-F")
				{
					$scope.entity.images = 0;
				}


				//--------------- END QUICKFIX -----------------
				document.title = $scope.entity.title + " | Arachne";
			}, function(response) {
				$scope.error = true;
				messageService.addMessageForCode("entity_"+response.status);
			});
				
			$scope.contextQuery = new Query();
			$scope.contextQuery.label = "Mit " + $routeParams.id + " verknüpfte Objekte";
			$scope.contextQuery.q = "connectedEntities:" + $routeParams.id;
			$scope.contextQuery.limit = 0;

			if ($scope.currentQuery.hasOwnProperty('resultIndex')) {
				
				$scope.resultIndex = parseInt($scope.currentQuery.resultIndex);
				$scope.resultIndexInput = $scope.resultIndex;
				searchService.getCurrentPage().then(function(results) {
					$scope.searchresults = results;
					$scope.resultSize = searchService.getSize();
				}, function(response) {
					$scope.searchresults = {size: 0};
					messageService.addMessageForCode('search_' + response.status);
				});

				var prevIndex = $scope.resultIndex-1;
				$scope.prevEntity = searchService.getEntity(prevIndex).then(function(entity) {
					$scope.prevEntity = entity;
				}, function() { $scope.prevEntity = false; });
				var nextIndex = $scope.resultIndex+1;
				$scope.nextEntity = searchService.getEntity(nextIndex).then(function(entity) {
					$scope.nextEntity = entity;
				}, function() { $scope.prevEntity = false; });

			}
		}

	}
])
.controller('CatalogCtrl',['$scope', '$modal', 'authService', 'Entity', 'Catalog', 'CatalogEntry',
	function ($scope, $modal, authService, Entity, Catalog, CatalogEntry) {

		$scope.catalogs = [];
		$scope.user = authService.getUser();

		$scope.treeOptions = {
			dropped: function(event) {
				updateActiveCatalog();
			}
		}

		$scope.refreshCatalogs = function(){
			Catalog.query(function(result) {
				$scope.catalogs = result;
				if (!$scope.activeCatalog) {
					$scope.activeCatalog = $scope.catalogs[0];
				}
			});
		}

		$scope.refreshCatalogs();

		$scope.setActiveCatalog = function(catalog) {
			$scope.activeCatalog = catalog;
		}

		$scope.addChild = function(entry) {
			if (!entry.children) {
				entry.children = [];
			}
			var editEntryModal = $modal.open({
				templateUrl: 'partials/Modals/editEntry.html'
			});
			editEntryModal.close = function(newEntry) {
				entry.children.push(newEntry);
				entry.expanded = true;
				updateActiveCatalog();
				editEntryModal.dismiss();
			}			
		}

		$scope.removeEntry = function(entry, parent) {
			if (parent == undefined) {
				parent = $scope.activeCatalog.root;
			}
			var deleteModal = $modal.open({
				templateUrl: 'partials/Modals/delete.html'
			});
			deleteModal.close = function() {
				var index = parent.children.indexOf(entry);
				parent.children.splice(index, 1);
				updateActiveCatalog();
				deleteModal.dismiss();
			}
		}

		$scope.editEntry = function(entry) {
			var editEntryModal = $modal.open({
				templateUrl: 'partials/Modals/editEntry.html',
				controller: 'EditCatalogEntryCtrl',
				resolve: { entry: function() { return entry } }
			});
			editEntryModal.close = function(newEntry) {
				entry = newEntry;
				updateActiveCatalog();
				editEntryModal.dismiss();
			}
		}

		$scope.createCatalog = function() {
			console.log($scope.user);
			var catalogBuffer = {
				author: $scope.user.username
			};
			var editCatalogModal = $modal.open({
				templateUrl: 'partials/Modals/editCatalog.html',
				controller: 'EditCatalogCtrl',
				resolve: { catalog: function() { return catalogBuffer } }
			});
			editCatalogModal.close = function(newCatalog) {
				newCatalog.public = false;
				Catalog.save({}, newCatalog, function(result) {
					$scope.catalogs.push(result);
					$scope.activeCatalog = result;
				});
				editCatalogModal.dismiss();
			}
		}

		$scope.editCatalog = function() {
			var editCatalogModal = $modal.open({
				templateUrl: 'partials/Modals/editCatalog.html',
				controller: 'EditCatalogCtrl',
				resolve: { catalog: function() { return $scope.activeCatalog } }
			});
			editCatalogModal.close = function(newCatalog) {
				$scope.activeCatalog = newCatalog;
				Catalog.update({id: $scope.activeCatalog.id}, newCatalog);
				editCatalogModal.dismiss();
			}
		}

		$scope.removeCatalog = function() {
			var deleteModal = $modal.open({
				templateUrl: 'partials/Modals/delete.html'
			});
			deleteModal.close = function() {
				var index = $scope.catalogs.indexOf($scope.activeCatalog);
				$scope.catalogs.splice(index, 1);
				Catalog.remove({id: $scope.activeCatalog.id});
				$scope.activeCatalog = $scope.catalogs[0];
				deleteModal.dismiss();
			}
		}

		$scope.expandAll = function(entry) {
			entry.expanded = true;
			if (entry.children || entry.children.length > 0) {
				for (var i = 0; i < entry.children.length; i++) {
					$scope.expandAll(entry.children[i]);
				}
			}
		}

		$scope.collapseAll = function(entry) {
			entry.expanded = false;
			if (entry.children || entry.children.length > 0) {
				for (var i = 0; i < entry.children.length; i++) {
					$scope.collapseAll(entry.children[i]);
				}
			}
		}

		function updateActiveCatalog() {
			Catalog.update({ id: $scope.activeCatalog.id }, $scope.activeCatalog);
		}

	}
])
.controller('EntityImageCtrl', ['$routeParams', '$scope', '$modal', 'Entity', 'authService', 'searchService', '$location','arachneSettings', '$http', '$window', '$rootScope', 'messageService',
	function($routeParams, $scope, $modal, Entity, authService, searchService, $location, arachneSettings, $http, $window, $rootScope, messageService) {

		$rootScope.hideFooter = true;
		$scope.allow = true;

		$scope.refreshImageIndex = function() {
			if($scope.entity && $scope.entity.images) {
				for (var i = 0; i < $scope.entity.images.length; i++) {
					if ($scope.entity.images[i].imageId == $scope.imageId) {
						$scope.imageIndex = i;
						break;
					}
				}
			}
		};

		$scope.requestFullscreen = function() {
			var element = document.getElementById('theimage');
			// Find the right method, call on correct element			
			if(element.requestFullscreen) {
			    element.requestFullscreen();
			} else if(element.mozRequestFullScreen) {
			    element.mozRequestFullScreen();
			} else if(element.webkitRequestFullscreen) {
			    element.webkitRequestFullscreen();
			} else if(element.msRequestFullscreen) {
			    element.msRequestFullscreen();
			}
		};

		$scope.downloadImage = function() {
			var imgUri = arachneSettings.dataserviceUri + "/image/" + $scope.imageId;
			var entityUri = arachneSettings.dataserviceUri + "/entity/" + $scope.imageId;
				console.log("downloadingimage");
			

			$http.get(imgUri, { responseType: 'blob' }).success(function(data) {
				var document = $window.document;
				var a = document.createElement('a');
				document.body.appendChild(a);
				a.style = "display:none";
				var blob = new Blob([data], {type: 'image/jpeg'});
				var blobUri = $window.URL.createObjectURL(blob);
				a.href = blobUri;
				$http.get(entityUri).success(function(data) {
					a.download = data.title;
					a.click();
				});
			});
		}

		$scope.user = authService.getUser();
		$scope.currentQuery = searchService.currentQuery();
		$scope.entityId = $routeParams.entityId;
		$scope.imageId = $routeParams.imageId;
		Entity.get({id:$routeParams.entityId}, function(data) {

			$scope.entity = data;
			$scope.refreshImageIndex();
		}, function(response) {
			messageService.addMessageForCode("entity_"+response.status);
		});
		Entity.imageProperties({id: $scope.imageId}, function(data) {
			$scope.imageProperties = data;
			$scope.allow = true;
		}, function(response) {
			if (response.status == '403') {
				$scope.allow = false;
			} else {
				messageService.addMessageForCode('image_' + response.status);
			}
		});

		$scope.$watch("imageId", function() {
			$scope.refreshImageIndex();
		});

	}
])
.controller('EntityImagesCtrl', ['$routeParams', '$scope', 'Entity', '$filter', 'searchService', '$rootScope', 'messageService',
	function($routeParams, $scope, Entity, $filter, searchService, $rootScope, messageService) {

		$rootScope.hideFooter = true;
		$scope.currentQuery = searchService.currentQuery();
		$scope.entityId = $routeParams.entityId;
		$scope.imageId = $routeParams.imageId;
		Entity.get({id:$routeParams.entityId}, function(data) {
			// call to filter detached from view in order to prevent unnecessary calls
			$scope.entity = data;
			$scope.cells = $filter('cellsFromImages')(data.images, data.entityId, $scope.currentQuery);
		}, function(response) {
			messageService.addMessageForCode("entity_"+response.status);
		});

	}
])
.controller('StartSiteController', ['$rootScope', '$scope', '$http', 'arachneSettings', 'con10tService', 'messageService', 'categoryService', '$timeout',
	function ($rootScope, $scope, $http, arachneSettings, con10tService, messageService, categoryService, $timeout) {

		$rootScope.hideFooter = false;

		con10tService.getFront().success(function(projectsMenu){
			var projslides = $scope.projslides = [];
			for(var key in projectsMenu) {
				projslides.push({
					image: "con10t/frontimages/" + projectsMenu[key].id + ".jpg",
					title: projectsMenu[key].text,
					id: projectsMenu[key].id
				});
			}
			var active = Math.floor((Math.random() * $scope.projslides.length));
			for(var i=0; i<$scope.projslides.length; i++){
				if(i == active)
					$scope.projslides[i].active = true;
				else
					$scope.projslides[i].active = false;
			}
		});
		
		$http.get(arachneSettings.dataserviceUri + "/entity/count").success(function(data) {
			$scope.entityCount = data.entityCount;
		}).error(function(data) {
			messageService.addMessageForCode("backend_missing");
		});

	}
])

.controller('ProjectsController', ['$scope', '$http', 'con10tService', 
	function ($scope, $http, con10tService) {

		$scope.columns = [];
		
		con10tService.getProjects().success(function(data){
			$scope.projects = data[0].children;
			$scope.columns[0] = $scope.projects.slice(0,3);
			$scope.columns[1] = $scope.projects.slice(3,5);
			$scope.columns[2] = $scope.projects.slice(5);
		});

	}
])
.controller('ContactController', ['$scope', '$http', '$modal', 'contactService', 'arachneSettings',
	function ($scope, $http, $modal, contactService, arachneSettings) {

		$scope.success = false;
		$scope.error = "";

		$scope.submit = function() {
			contactService.sendContact($scope.usrData, 
				function(data){
					$scope.error = "";
					$scope.success = true;
				}, 
				function(error){
					$scope.error = data.message;
				}
			);
		}
	}
])

.controller('AllCategoriesController', ['$rootScope', '$scope', '$http', 'categoryService', '$timeout',
	function ($rootScope, $scope, $http, categoryService, $timeout) {

		$rootScope.hideFooter = false;

		categoryService.getCategoriesAsync().then(function(categories) {
			$scope.categories = [];
			for(var key in categories) {
				if (categories[key].status != 'none') {
					$scope.categories.push(categories[key]);
				}
			}
		});

	}
])
.controller('ThreeDimensionalController', ['$scope', '$location', '$http', '$modal', 'arachneSettings', '$rootScope',
	function ($scope, $location, $http, $modal, arachneSettings, $rootScope) {

		$rootScope.hideFooter = true;
		
		this.showInfo = function () {
		
			if(!$scope.metainfos) {
				$http.get(arachneSettings.dataserviceUri + "/model/" + $location.search().id + "?meta=true" ).success (function(data){
					$scope.metainfos = data;
				});
			}

			var modalInstance = $modal.open({
				templateUrl: 'partials/Modals/3dInfoModal.html',
				scope: $scope
			});
			
			modalInstance.close = function(){
				modalInstance.dismiss();
			}
		
		}
	}
])
.controller('RegisterCtrl', ['$rootScope', '$scope', '$http', '$filter', 'arachneSettings',
	function ($rootScope, $scope, $http, $filter, arachneSettings) {

		$rootScope.hideFooter = false;

		$scope.user = {};
		$scope.success = false;
		$scope.error = "";

		$scope.submit = function() {
			if ($scope.password && $scope.passwordValidation) {
				$scope.user.password = $filter('md5')($scope.password);
				$scope.user.passwordValidation = $filter('md5')($scope.passwordValidation);
			}
			$http.post(arachneSettings.dataserviceUri + "/user/register", $scope.user, {
				"headers": { "Content-Type": "application/json" }
			}).success(function(data) {
				$scope.error = "";
				$scope.success = true;
			}).error(function(data) {
				$scope.error = data.message;
			});
		}

	}
])
.controller('MessageCtrl', ['$scope', 'messageService',
	function ($scope, messageService) {

		$scope.messages = messageService.getMessages();

		$scope.removeMessage = function(index) {
			messageService.removeMessage(index);
		}

	}
])
.controller('ProjectCtrl', ['$scope', '$routeParams',
	function ($scope, $routeParams) {
		$scope.templateUrl = 'con10t/de/' + $routeParams.name + '.html';
	}
])
.controller('EditCatalogEntryCtrl',
	function ($scope, $modalInstance, entry) {
		$scope.entry = entry;
	}
)
.controller('EditCatalogCtrl',
	function ($scope, $modalInstance, catalog) {
		$scope.catalog = catalog;
	}
)

/**
 * Handles requests for the state of the document import.
 * Author: Daniel M. de Oliveira
 */
.controller('DataimportCtrl',['$scope','$http','$location','arachneSettings',
	function($scope, $http, $location, arachneSettings) {


		var dataimportUri = arachneSettings.dataserviceUri + '/admin/dataimport';

		$scope.fetchData = function () {

			$http
				.get(dataimportUri)
				.success(function (data) {
					$scope.dataimportResponse = data;
				})
				.error(function (data) {
					$scope.msg = 'backend temporarily unavailable';
					$scope.dataimportResponse = undefined;
				});
		}

		$scope.startDataimport = function () {

			$http
				.post(dataimportUri + '?command=start')
				.success(function (data) {

					if (data.status == 'already running') {
						$scope.msg = 'dataimport already running';
						return;
					}

					$scope.msg = 'dataimport successfully started';
					$scope.fetchData();
				})
				.error(function (data) {
					$scope.msg = 'unauthorized';
				});
		}

		$scope.stopDataimport = function() {

			$http
				.post(dataimportUri + '?command=stop')
				.success(function (data) {

					if (data.status == 'not running') {
						$scope.msg = 'dataimport not running';
						return;
					}

					$scope.msg = 'dataimport successfully stopped';
					$scope.fetchData();
				})
				.error(function (data){

					$scope.msg='unauthorized';
				});

		}

		$scope.fetchData();
	}
]);

