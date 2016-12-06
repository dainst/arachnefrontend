angular.module('arachne.filters')

    .filter('entityCountInFacet', function () {
        return function (facet) {
            var entityCount = 0;
            for (var facetValue in facet) {
                entityCount = entityCount + facet[facetValue];
            }
            return entityCount;
        }
    });