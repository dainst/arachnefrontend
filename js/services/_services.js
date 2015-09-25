'use strict';

/* Services */
angular.module('arachne.services', [])

	// singleton service for authentication, stores credentials in browser cookie
	// if cookie is present the stored credentials get sent with every backend request
	.factory('authService', ['$http', 'arachneSettings', '$filter', '$cookieStore', 
		function($http, arachneSettings, $filter, $cookieStore) {

			// initialize to whatever is in the cookie, if anything
			if ($cookieStore.get('ar-authdata')) {
		    	$http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('ar-authdata');
		    } else {
		    	delete $http.defaults.headers.common['Authorization'];
		    }
		 
		    return {

		        setCredentials: function (username, password, successMethod, errorMethod) {
		            var encoded = $filter('base64')(username + ':' + $filter('md5')(password));
		            $http.get(arachneSettings.dataserviceUri + '/', { headers: { 'Authorization': 'Basic ' + encoded } })
		            .success(function(response) {
		            	$http.defaults.headers.common.Authorization = 'Basic ' + encoded;
		            	$cookieStore.put('ar-authdata', encoded);
		            	$cookieStore.put('ar-user', { username: username });
		            	successMethod();
		            }).error(function(response) {
		            	errorMethod(response);
		            });
		        },

		        clearCredentials: function () {
		            document.execCommand("ClearAuthenticationCache");
		            $cookieStore.remove('ar-authdata');
		            $cookieStore.remove('ar-user');
		            delete $http.defaults.headers.common['Authorization'];
		        },

		        getUser: function() {
		        	return $cookieStore.get('ar-user');
		        }

		    };

		}
	])
	.factory('newsFactory', ['$http', 'arachneSettings', '$timeout', function($http, arachneSettings){
		var factory = {};
		factory.getNews = function() {
				return $http.get( arachneSettings.dataserviceUri + '/news/de');
			};
		return factory;
	}])

	.factory('categoryService', ['$http', function($http ){

		var categories = null;

		var promise = $http.get('config/category.json').then(function(response) {
			categories = response.data;
			return categories;
		});

		var factory = {};

		factory.getCategoriesAsync = function() {
			return promise;
		};

		factory.getCategories = function() {
			return categories;
		};

		factory.getSingular = function(category) {
			if (category in categories && "singular" in categories[category]) {
				return categories[category].singular;
			} else {
				return category;
			}
		}

		return factory;

	}])

	//contact Form
	.factory('contactService', ['$http', 'arachneSettings', '$resource',  function($http, arachneSettings, $resource) { 
		var contactService = $resource('', {}, {
			sendContact : {
				url: arachneSettings.dataserviceUri + '/contact',
				isArray: false,
				method: 'POST',
				headers: {'Content-Type': 'application/json'}
			}
		});
		return {
			sendContact : function(contact, successMethod, errorMethod){
				return contactService.sendContact(contact, successMethod, errorMethod);
			}
		}
	}])

	//reset request
	.factory('resetService', ['$http', 'arachneSettings', '$resource',  function($http, arachneSettings, $resource) { 
		var resetService = $resource('', {}, {
			resetpwd : {
				url: arachneSettings.dataserviceUri + '/user/reset',
				isArray: false,
				method: 'POST',
				headers: {'Content-Type': 'application/json'}
			}
		});
		return {
			resetpwd : function(pwd, successMethod, errorMethod){
				return resetService.resetpwd(pwd, successMethod, errorMethod);
			}
		}
	}])

	//register 
	.factory('registerService', ['$http', 'arachneSettings', '$resource',  function($http, arachneSettings, $resource) { 
		var registerService = $resource('', {}, {
			resetpwd : {
				url: arachneSettings.dataserviceUri + '/user/register',
				isArray: false,
				method: 'POST',
				headers: {'Content-Type': 'application/json'}
			}
		});
		return {
			register : function(pwd, successMethod, errorMethod){
				return registerService.register(pwd, successMethod, errorMethod);
			}
		}
	}])
	
	.factory('messageService', ['$http', '$rootScope', function($http, $rootScope) {

		var messageTypes;
		$http.get('config/messageTypes.json').success(function(response) {
			messageTypes = response;
		});
		var messages = {};

		// check age and close old messages when location changes
		$rootScope.$on("$locationChangeSuccess", function(event, newState, oldState) {
			angular.forEach(messages, function(msg, key) {
				messages[key].age++;
				if (msg.age >= 1) delete messages[key];
			});
		});

		return {

			addMessage: function(id, heading, body, level) {
				var message = {
					heading: heading,
					body: body,
					level: level,
					age: 0
				};
				messages[id] = message;
			},

			addMessageForCode: function(code) {
				if (code in messageTypes) {
					messages[code] = messageTypes[code];
					messages[code].age = 0;
				} else {
					messages['default'] = messageTypes['default'];
					messages['default'].age = 0;
				}
			},

			removeMessage: function(code) {
				delete messages[code];
			},

			getMessages: function() {
				return messages;
			}

		}

	}])

	.factory('Catalog', ['$resource', 'arachneSettings', function($resource, arachneSettings) {

		return $resource(arachneSettings.dataserviceUri + '/catalog/:id', null, {
        	'update': { method:'PUT' }
    	});

	}])

	.factory('CatalogEntry', ['$resource', 'arachneSettings', function($resource, arachneSettings) {

		return $resource(arachneSettings.dataserviceUri + '/catalogentry/:id');

	}])

	// Represents a place with entities
	// (as opposed to the entity with places, that is served by the backend)
	.factory('Place', function() {

		function Place() {
			this.location = null; // { lon: 12.345, lat: 12.345 }
			this.name = "";
			this.gazetteerId = null;
			this.entityCount = 0;
			this.entities = [];
			this.query = null; // A query to retrieve the entities in question
		};

		Place.prototype = {

			merge: function(other) {
				for (var key in other) {
					this[key] = other[key];
				}
				return this;
			},

			hasCoordinates: function() {
				return (this.location && this.location.lat && this.location.lon);
			},

			getId: function() {
				if (this.hasCoordinates()) {
					var id = this.location.lat + ',' + this.location.lon;
				} else {
					var id = this.name;
				}
				return id;
			},

			// adds an Entity to the place, this pushes the
			addEntity: function(entity, relation) {
				if (relation) {
					entity.relation = relation;
				}
				this.entities.push(entity);
				this.entityCount += 1;
			}
		};

		return Place;
	})



;