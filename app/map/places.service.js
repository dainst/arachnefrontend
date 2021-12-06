/**
 * Provides a list of Place objects corresponding to the entities in the current search result
 *
 * @author: David Neugebauer
 */
export default function(searchService, Place) {

    // A promise for an Array of Place objects with corresponding entities
    var promise = null;

    // Keep a count of all entities that have connected places
    var entityCount = 0;

    // reads a list of entities with connected places
    // returns a list of places with connected entities
    var buildPlacesListFromEntityList = function (entities, bbox) {

        var places = {};
        var placesList = [];
        entityCount = 0;

        if (!entities) {
            return [];
        }

        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];

            if (entity.places) {
                entityCount += 1;

                for (var j = 0; j < entity.places.length; j++) {
                    var place = new Place();
                    place.merge(entity.places[j]);

                    if (bbox && place.location && place.location.lat && place.location.lon && (
                            parseFloat(bbox[0]) > parseFloat(place.location.lat) &&
                            parseFloat(place.location.lat) > parseFloat(bbox[2]) &&
                            parseFloat(bbox[1]) < parseFloat(place.location.lon) &&
                            parseFloat(place.location.lon) < parseFloat(bbox[3])
                        )) {

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
        }

        for (key in places) {
            placesList.push(places[key]);
        }

        return placesList;
    };

    var buildPlacesFromFacet = function(facet, bbox) {
        if (!facet) {
            return [];
        }
        var bounds = new L.LatLngBounds(
            new L.LatLng(parseFloat(bbox[0]), parseFloat(bbox[1])),
            new L.LatLng(parseFloat(bbox[2]), parseFloat(bbox[3]))
        );
        var places = [];
        facet.values.forEach(function(value) {
            var place = new Place().merge(JSON.parse(value.value));
            if (place.location) {
                place.query = searchService.currentQuery()
                    .removeParams(['fl', 'lat', 'lng', 'zoom', 'overlays', 'baselayer']);
                if (place.query.q === '*') {
                    place.query.q = "places.gazetteerId:" + place.gazetteerId;
                } else {
                    place.query.q = place.query.q + " AND places.gazetteerId:" + place.gazetteerId;
                }

                place.entityCount = value.count;
                if (bounds.contains(new L.LatLng(parseFloat(place.location.lat), parseFloat(place.location.lon)))) {
                    places.push(place);
                } else {
                }
            }
        });
        return places;
    };

    return {

        makePlacesFromFacet: function (facet, bbox) {
            return buildPlacesFromFacet(facet, bbox);
        },

        makePlacesFromEntities: function (entities, bbox) {
            return buildPlacesListFromEntityList(entities, bbox);
        },

        // the number of entities in the current search
        // that are connected to places
        getEntityCount: function () {
            return entityCount;
        }
    }
};
