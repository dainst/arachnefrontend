'use strict';

angular.module('arachne.widgets.map')

// Represents a place with entities
// (as opposed to the entity with places, that is served by the backend)
    .factory('Place', function () {

        function Place() {
            this.location = null; // { lon: 12.345, lat: 12.345 }
            this.name = "";
            this.gazetteerId = null;
            this.entityCount = 0;
            this.entities = [];
            this.query = null; // A query to retrieve the entities in question
        }

        Place.prototype = {

            merge: function (other) {
                for (var key in other) {
                    this[key] = other[key];
                }
                return this;
            },

            /**
             * check properly if lat lon exists. if we would only check this.location && this.location.lat && this.location.lon
             * you would exclude places on the prime meridian or equator
             * also it would not return a boolean value.
             * @returns {boolean}
             */
            hasCoordinates: function () {
                return (
                    (typeof this.location !== "undefined") &&
                    (this.location !== null) &&
                    (this.location !== '') &&
                    (typeof this.location.lat !== "undefined") &&
                    (this.location.lat !== null) &&
                    (this.location.lat !== '') &&
                    (typeof this.location.lon !== "undefined") &&
                    (this.location.lon !== null) &&
                    (this.location.lon !== '')
                )
            },

            getId: function () {
                var id = this.name;
                if (this.hasCoordinates()) {
                    id = this.location.lat + ',' + this.location.lon;
                }
                return id;
            },

            // adds an Entity to the place
            addEntity: function (entity, relation) {
                if (relation) {
                    entity.relation = relation;
                }
                this.entities.push(entity);
                this.entityCount += 1;
            }
        };

        return Place;
    });