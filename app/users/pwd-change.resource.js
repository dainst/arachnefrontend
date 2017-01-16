'use strict';

/**
 *
 * @author: Patrick Jominet
 */

angular.module('arachne.resources')

    .factory('PwdChange', ['$resource', 'arachneSettings',
        function($resource, arachneSettings) {

            return $resource(arachneSettings.dataserviceUri + '/user/change', {}, {
                save : {
                    isArray: false,
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'}
                }
            });
        }]);