'use strict';

/* Widget directives */
angular.module('arachne.widgets.directives')

/**
 * @author: Marcel Riedel
 */

.directive('con10tTable', ['NgTableParams',
    function(NgTableParams) {
        return {
            restrict: 'E',
            scope: {
                url: '@'
            },
            templateUrl: function(element, attributes) {

                //  get path-to-table-template
                return attributes.pathToTableTemplate;              // attr.: 'path-to-table-template'
            },
            link: function(scope, element, attributes)  {

                // get path to json-file
                var path = attributes.pathToData;                   //  attr.: 'path-to-data'

                // get other table params:
                var rowsPerPage = attributes.rowsPerPage;           //  attr.: 'rows-per-page'

                // request data.json
                var xobj = new XMLHttpRequest();
                xobj.overrideMimeType("application/json");
                xobj.open('GET', path, true);
                xobj.onreadystatechange = function () {

                    if (xobj.readyState === 4 && xobj.status == "200") {

                        // assign parsed JSON to var data:
                        var data = JSON.parse(xobj.responseText);

                        // create NgTableParams object with params:
                        scope.tableParams = new NgTableParams({

                                page: 1,                 // starting page
                                count: rowsPerPage,      // rows per page
                            },
                            {dataset: data}              // reference data
                        );
                    }
                };
                xobj.send(null);
            }
        };
    }]);




