'use strict';

angular.module('arachne.services')

/*
 * Provides a list of Place objects corresponding to the entities in the current search result
 *
 * @author: David Neugebauer
 */
.factory('placesService', ['searchService', 'Place', function(searchService, Place) {

    // A promise for an Array of Place objects with corresponding entities
    var promise = null;

    // Keep the last query used to construct the places list
    // to check if the current query is different
    var lastQuery = null;

    // Keep a count of all entities that have connected places
    var entityCount = 0;

    // reads a list of entities with connected places
    // returns a list of places with connected entities
    var buildPlacesListFromEntityList = function(entities) {
        var places = {};
        var placesList = [];
        entityCount = 0;

        for(var i = 0; i < entities.length; i++) {
            var entity = entities[i];

            if (entity.places) {
                entityCount += 1;

                for (var j = 0; j < entity.places.length; j++) {
                    var place = new Place();
                    place.merge(entity.places[j]);

                    // If there already is a place with the same id, use
                    // that one instead and just add the entity
                    var key = place.getId();
                    if (places[key]) {
                        places[key].addEntity(entity, place.relation);
                    } else {
                        place.addEntity(entity, place.relation);
                        places[key] = place;
                    }

                    if (!place.query && place.gazetteerId) {
                        place.query = searchService.currentQuery().removeParams(['fl', 'lat', 'lng', 'zoom', 'overlays']);
                        place.query.q = place.query.q + " places.gazetteerId:" + place.gazetteerId;
                    }
                }
            }
        }

        for (key in places) {
            placesList.push(places[key]);
        }

        return placesList;
    };

    return {

        
        makePlaces: function(entities) {
            return buildPlacesListFromEntityList(entities);
        },
        
        
        // returns a promise for a list of places corresponding
        // to the current search result
        // getCurrentPlaces: function() {
        //     var oldPromise = promise;
        //
        //     promise = searchService.getCurrentPage().then(function(entities) {
        //         if (oldPromise && lastQuery && angular.equals(lastQuery, searchService.currentQuery().toFlatObject())) {
        //             return oldPromise;
        //         } else {
        //             lastQuery = searchService.currentQuery().toFlatObject();
        //             return buildPlacesListFromEntityList(entities);
        //         }
        //     });
        //
        //     return promise;
        // },

        // the number of entities in the current search
        // that are connected to places
        getEntityCount: function() {
            return entityCount;
        }

    }

}]);