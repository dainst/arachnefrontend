'use strict';

angular.module('arachne.services')

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
});