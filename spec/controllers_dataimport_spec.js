/**
 * Author: Daniel M. de Oliveira
 */

describe ('DataimportController', function() {

    var scope;
    var dataserviceUri='http://backend/data';
    var dataimportUri=dataserviceUri+'/admin/dataimport';

    var ACTION_DESC_REFRESH = 'You asked the system to refresh. ';
    var ACTION_DESC_START_DATAIMPORT = 'You asked the system to start the dataimport. ';
    var ACTION_DESC_STOP_DATAIMPORT = 'You asked the system to stop the dataimport. ';

    var OUTCOME_START_DATAIMPORT = 'Dataimport successfully started. ';
    var OUTCOME_STOP_DATAIMPORT = 'Dataimport successfully stopped. ';
    var OUTCOME_DATAIMPORT_RUNNING = 'Dataimport already running. ';
    var OUTCOME_DATAIMPORT_NOT_RUNNING = 'Dataimport not running. ';

    var msg_unavailable='The system reports that the backend is temporarily unavailable. ';
    var msg_unauthorized='The system rejects your request. You have not the necessary permissions. Please log in with admin rights. ';

    beforeEach(function(){

        module('arachne.controllers',function($provide){
            $provide.constant('arachneSettings', {
                dataserviceUri: dataserviceUri
            });
			$provide.value('transl8',{fetchTranslations:function(){return true;}})
        });
    });

    beforeEach(inject(function($controller,_$httpBackend_,arachneSettings){

        $httpBackend=_$httpBackend_;
        scope = {};
        $controller('DataimportController',{'$scope':scope});

    }));



    it ('should show the idle lastAction',function(){

        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});

        $httpBackend.flush();
        expect(scope.dataimportInfo.status).toBe('idle');
    });






    it ('should report if backend is not available on refresh request',function(){

        $httpBackend.expectGET(dataimportUri).
            respond(404,'');
        $httpBackend.flush();

        expect(scope.lastActionOutcome).toBe(msg_unavailable);
        expect(scope.dataimportInfo).toBe(undefined);
    });

    it ('should report if backend is not available on start request',function(){

        $httpBackend.expectGET(dataimportUri).
            respond(0,'');
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=start').
            respond(0,'');
        scope.startDataimport();
        $httpBackend.flush();

        expect(scope.lastActionOutcome).toBe(msg_unavailable);
        expect(scope.dataimportInfo).toBe(undefined);
    });

    it ('should report if backend is not available on stop request',function(){

        $httpBackend.expectGET(dataimportUri).
            respond(0,'');
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=stop').
            respond(0,'');
        scope.stopDataimport();
        $httpBackend.flush();

        expect(scope.lastActionOutcome).toBe(msg_unavailable);
        expect(scope.dataimportInfo).toBe(undefined);
    });






    it ('should reject the start command when unauthorized', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});
        $httpBackend.flush();


        $httpBackend.expectPOST(dataimportUri+'?command=start').
            respond(401,'');
        scope.startDataimport();
        $httpBackend.flush();


        expect(scope.lastAction).toBe(ACTION_DESC_START_DATAIMPORT);
        expect(scope.lastActionOutcome).toBe(msg_unauthorized);
    });

    it ('should reject the stop command when unauthorized', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'running'});
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=stop').
            respond(401,'');
        scope.stopDataimport();
        $httpBackend.flush();

        expect(scope.lastAction).toBe(ACTION_DESC_STOP_DATAIMPORT);
        expect(scope.lastActionOutcome).toBe(msg_unauthorized);
    });







    it ('should execute start dataimport', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=start').
            respond({status:'started'});
        $httpBackend.expectGET(dataimportUri).
            respond({status:'running'});


        scope.startDataimport();
        $httpBackend.flush();
        expect(scope.lastAction).toBe(undefined);
        expect(scope.lastActionOutcome).toBe(OUTCOME_START_DATAIMPORT);
    });



    it ('should execute stop dataimport', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'running'});
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=stop').
            respond({status:'aborting'});
        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});

        scope.stopDataimport();
        $httpBackend.flush();
        expect(scope.lastAction).toBe(undefined);
        expect(scope.lastActionOutcome).toBe(OUTCOME_STOP_DATAIMPORT);
    });



    it ('should inform the user that the dataimport is not running', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=stop').
            respond({status:'not running'});
        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});

        scope.stopDataimport();
        $httpBackend.flush();
        expect(scope.lastActionOutcome).toBe(OUTCOME_DATAIMPORT_NOT_RUNNING);
        expect(scope.dataimportInfo.status).toBe('idle');
    });



    it ('should inform the user if dataimport is running already', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'running'});
        $httpBackend.flush();


        $httpBackend.expectPOST(dataimportUri+'?command=start').
            respond({status:'already running'});

        expect(scope.lastAction).toBe(undefined);
        scope.startDataimport();

        $httpBackend.flush();
        expect(scope.lastAction).toBe(ACTION_DESC_START_DATAIMPORT);
        expect(scope.lastActionOutcome).toBe(OUTCOME_DATAIMPORT_RUNNING);
    });



    it ('should not begin to start the dataimport when a request is still pending', function() {

        scope.requestRefresh();

        scope.startDataimport();
        expect(scope.lastAction).toBe(ACTION_DESC_REFRESH);
    });

    it ('should not begin to stop the dataimport when a request is still pending', function() {

        scope.requestRefresh();

        scope.stopDataimport();
        expect(scope.lastAction).toBe(ACTION_DESC_REFRESH);
    });

    it ('should not begin to start the dataimport when a request is still pending', function() {

        scope.startDataimport();

        scope.requestRefresh();
        expect(scope.lastAction).toBe(ACTION_DESC_START_DATAIMPORT);
    });


});
