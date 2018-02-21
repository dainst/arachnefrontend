'use strict';

angular.module('arachne.directives')

    .directive('arSearchNav', function () {
        return {
            templateUrl: 'app/search/ar-search-nav.html',
            link: function(scope) {
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
    });