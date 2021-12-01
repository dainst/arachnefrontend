'use strict';

angular.module('arachne.directives')

    .directive('arSearchNav', ['arachneSettings', function (arachneSettings) {
        return {
            template: require('./ar-search-nav.html'),
            link: function(scope) {

                scope.maxSearchSizeForCatalog = arachneSettings.maxSearchSizeForCatalog;

                scope.stripQuery = function(query, view) {
                    if (view) {
                        query = query.setParam('view', view);
                    } else {
                        query = query.removeParam('view');
                    }

                    return query
                        .removeParam('fl')
                        .removeParam('lat')
                        .removeParam('lng')
                        .removeParam('zoom')
                        .toString();
                }
            }
        }
    }]);
