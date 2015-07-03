'use strict';

angular.module('arachne.controllers')

/**
 * Handles requests for the state of the document import.
 * Author: Daniel M. de Oliveira
 */
.controller('DataimportController',['$scope','$http','$location','arachneSettings',
function($scope, $http, $location, arachneSettings) {

    var dataimportUri = arachneSettings.dataserviceUri + '/admin/dataimport';
    var requestPending = false; // true as long as a server request is pending and waiting for an answer or timeout

    var ACTION_DESC_REFRESH = 'You asked the system to refresh. ';
    var ACTION_DESC_START_DATAIMPORT = 'You asked the system to start the dataimport. ';
    var ACTION_DESC_STOP_DATAIMPORT = 'You asked the system to stop the dataimport. ';

    var OUTCOME_START_DATAIMPORT = 'Dataimport successfully started. ';
    var OUTCOME_STOP_DATAIMPORT = 'Dataimport successfully stopped. ';
    var OUTCOME_DATAIMPORT_RUNNING = 'Dataimport already running. ';
    var OUTCOME_DATAIMPORT_NOT_RUNNING = 'Dataimport not running. ';

    var MSG_UNAVAILABLE = 'The system reports that the backend is temporarily unavailable. ';
    var MSG_UNAUTHORIZED = 'The system rejects your request. You have not the necessary permissions. Please log in with admin rights. ';

    /**
     * All $scope functions accesible from within the view must call gate() at first.
     * +lastAction+ - Description of the last action.
     * returns: true to indicate the $scope function is allowed to get executed. false otherwise.
     * The action should return immediately in the latter case.
     */
    function gatePassed(lastAction) {
        if (requestPending){
            $scope.lastActionOutcome=$scope.lastActionOutcome+'Please wait. ';
            return false;
        }
        requestPending=true;
        $scope.lastActionOutcome='Request pending. ';
        $scope.lastAction=lastAction;
        return true;
    }


    function fetchDataimportInfo() {

        $http
            .get(dataimportUri)
            .success(function (data) {
                requestPending=false;

                if ($scope.lastAction==ACTION_DESC_REFRESH){
                    $scope.lastAction=undefined;
                    $scope.lastActionOutcome=undefined;
                }

                $scope.dataimportInfo = data;
            })
            .error(function (data) {
                requestPending=false;

                $scope.lastActionOutcome = MSG_UNAVAILABLE;

                $scope.dataimportInfo = undefined;
            });
    }

    /**
     * Lets admins retrieve the latest information on the dataimport status.
     */
    $scope.requestRefresh = function () {
        if (!gatePassed(ACTION_DESC_REFRESH)) return;

        fetchDataimportInfo();
    }


    /**
     * Lets admins start the dataimport.
     */
    $scope.startDataimport = function () {
        if (!gatePassed(ACTION_DESC_START_DATAIMPORT)) return;

        $http
            .post(dataimportUri + '?command=start')
            .success(function (data) {
                requestPending=false;

                if (data.status == 'already running') {
                    $scope.lastActionOutcome = OUTCOME_DATAIMPORT_RUNNING;
                    return;
                }

                $scope.lastAction = undefined;
                $scope.lastActionOutcome = OUTCOME_START_DATAIMPORT;

                fetchDataimportInfo();
            })
            .error(function (data,status) {
                requestPending=false;

                if (status==401) {
                    $scope.lastActionOutcome = MSG_UNAUTHORIZED;
                    return;
                }

                $scope.lastActionOutcome = MSG_UNAVAILABLE;
            });
    }


    /**
     * Lets admins stop the dataimport.
     */
    $scope.stopDataimport = function() {
        if (!gatePassed(ACTION_DESC_STOP_DATAIMPORT)) return;

        $http
            .post(dataimportUri + '?command=stop')
            .success(function (data) {
                requestPending=false;

                if (data.status == 'not running') {
                    $scope.lastAction = undefined;
                    $scope.lastActionOutcome = OUTCOME_DATAIMPORT_NOT_RUNNING;

                    // This is to give the user feedback when he asked to stop
                    // and dataimportInfo reflects an old state.
                    fetchDataimportInfo();
                    return;
                }

                $scope.lastAction = undefined;
                $scope.lastActionOutcome = OUTCOME_STOP_DATAIMPORT;

                // The dataimportInfo may not reflect yet that the dataimport has stopped
                // because the backend may need some time to perform the request.
                // See comment above.
                fetchDataimportInfo();
            })
            .error(function (data,status){
                requestPending=false;

                if (status==401) {
                    $scope.lastActionOutcome = MSG_UNAUTHORIZED;
                    return;
                }

                $scope.lastActionOutcome=MSG_UNAVAILABLE;
            });

    }

    fetchDataimportInfo();
}]);


