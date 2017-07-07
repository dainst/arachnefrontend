'use strict';

angular.module('arachne.controllers')

/**
 * Handles requests for the state of the document import.
 *
 * $scope
 *   dataimportInfo
 *   lastActionOutcome
 *
 *   requestRefresh()
 *   startDataimport()
 *   stopDataimport()
 *
 * @author: Daniel M. de Oliveira
 */
    .controller('DataimportController', ['$scope', '$http', '$location', '$interval', 'arachneSettings',
        function ($scope, $http, $location, $interval, arachneSettings) {

            var dataimportUri = arachneSettings.dataserviceUri + '/admin/dataimport';
            var requestPending = false; // true as long as a server request is pending and waiting for an answer or timeout

            var OUTCOME_START_DATAIMPORT = 'Dataimport successfully started. ';
            var OUTCOME_STOP_DATAIMPORT = 'Dataimport successfully stopped. ';
            var OUTCOME_DATAIMPORT_RUNNING = 'Dataimport already running. ';
            var OUTCOME_DATAIMPORT_NOT_RUNNING = 'Dataimport not running. ';

            var MSG_UNAVAILABLE = 'The system reports that the backend is temporarily unavailable. ';
            var MSG_UNAUTHORIZED = 'The system rejects your request. You have not the necessary permissions. Please log in with admin rights. ';

            var interval = undefined;

            /**
             * All $scope functions accesible from within the view must call anotherRequestPending() at first.
             * @return false to indicate the $scope function is allowed to get executed. true otherwise.
             * The action should return immediately in the latter case.
             */
            function anotherRequestPending() {
                if (requestPending) {
                    $scope.lastActionOutcome = $scope.lastActionOutcome + 'Please wait. ';
                    return true;
                }
                requestPending = true;
                return false;
            }

            function handleError(status) {
                if (status == 401)
                    $scope.lastActionOutcome = MSG_UNAUTHORIZED;
                else
                    $scope.lastActionOutcome = MSG_UNAVAILABLE;
            }

            function fetchDataimportInfo(successCallback) {

                $http
                    .get(dataimportUri)
                    .success(function (data) {
                        if (successCallback) successCallback();
                        $scope.dataimportInfo = data;
                    })
                    .error(function (data) {
                        $scope.lastActionOutcome = MSG_UNAVAILABLE;
                        $scope.dataimportInfo = undefined;

                    }).finally(function () {
                    requestPending = false;
                });
            }

            /**
             * Lets admins retrieve the latest information on the dataimport status.
             */
            $scope.requestRefresh = function () {
                if (anotherRequestPending()) return;

                var clear = function () {
                    $scope.lastActionOutcome = undefined;
                };

                fetchDataimportInfo(clear);
            };


            /**
             * Lets admins start the dataimport.
             */
            $scope.startDataimport = function () {
                if (anotherRequestPending()) return;

                $http
                    .post(dataimportUri + '?command=start')
                    .success(function (data) {

                        if (data.status == 'already running')
                            $scope.lastActionOutcome = OUTCOME_DATAIMPORT_RUNNING;
                        else
                            $scope.lastActionOutcome = OUTCOME_START_DATAIMPORT;

                        // Provide feedback in any case.
                        fetchDataimportInfo();
                    })
                    .error(function (data, status) {
                        handleError(status);
                    }).finally(function () {
                    requestPending = false;
                });
            };


            /**
             * Lets admins stop the dataimport.
             */
            $scope.stopDataimport = function () {
                if (anotherRequestPending()) return;

                $http
                    .post(dataimportUri + '?command=stop')
                    .success(function (data) {

                        if (data.status == 'not running')
                            $scope.lastActionOutcome = OUTCOME_DATAIMPORT_NOT_RUNNING;
                        else
                            $scope.lastActionOutcome = OUTCOME_STOP_DATAIMPORT;

                        // When data.status was 'not running' this does not mean that
                        // dataimportInfo reflected this at the moment the user requested
                        // the stopDataimport (again). So the users wish for feedback is valid and
                        // fetchDataimportInfo() is to be called in any case to update the info.
                        fetchDataimportInfo();
                    })
                    .error(function (data, status) {
                        handleError(status);
                    }).finally(function () {
                    requestPending = false;
                });
            };

            $scope.$watch('constantlyRefresh', function(constantlyRefresh) {
                if (constantlyRefresh) {
                    interval = $interval($scope.requestRefresh, 1000);
                } else {
                    if (interval) $interval.cancel(interval);
                }
            });

            fetchDataimportInfo();
        }]);
