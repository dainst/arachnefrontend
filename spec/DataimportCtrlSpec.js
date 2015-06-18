/**
 * Author: Daniel M. de Oliveira
 */

describe ('DataimportCtrl', function() {

    var scope;
    var dataserviceUri='http://backend/data';
    var dataimportUri=dataserviceUri+'/admin/dataimport';
    var msg_unavailable='system reports that backend is temporarily unavailable';
    var msg_unauthorized='system rejects your request. you have not the necessary permissions. please log in with admin rights.';

    beforeEach(function(){

        module('arachne.controllers',function($provide){
            $provide.constant('arachneSettings', {
                dataserviceUri: dataserviceUri
            });
        });
    });

    beforeEach(inject(function($controller,_$httpBackend_,arachneSettings){

        $httpBackend=_$httpBackend_;
        scope = {};
        $controller('DataimportCtrl',{'$scope':scope});

    }));



    it ('should show the idle lastAction',function(){

        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});

        $httpBackend.flush();
        expect(scope.backendResponse.status).toBe('idle');
    });






    it ('should report if backend is not available on refresh request',function(){

        $httpBackend.expectGET(dataimportUri).
            respond(404,'');
        $httpBackend.flush();

        expect(scope.lastActionOutcome).toBe(msg_unavailable);
        expect(scope.dataimportStatus).toBe(undefined);
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
        expect(scope.dataimportStatus).toBe(undefined);
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
        expect(scope.dataimportStatus).toBe(undefined);
    });






    it ('should reject the start command when unauthorized', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});
        $httpBackend.flush();


        $httpBackend.expectPOST(dataimportUri+'?command=start').
            respond(401,'');
        scope.startDataimport();
        $httpBackend.flush();


        expect(scope.lastAction).toBe('you started the dataimport (pending)');
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

        expect(scope.lastAction).toBe('you stopped the dataimport (pending)');
        expect(scope.lastActionOutcome).toBe(msg_unauthorized);
    });







    it ('should react on the start command', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=start').
            respond({status:'started'});
        $httpBackend.expectGET(dataimportUri).
            respond({status:'running'});


        scope.startDataimport();
        $httpBackend.flush();
        expect(scope.lastAction).toBe('you started the dataimport (pending)');
        expect(scope.lastActionOutcome).toBe('dataimport successfully started');
    });



    it ('should react on the stop command', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'running'});
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=stop').
            respond({status:'aborting'});
        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});

        scope.stopDataimport();
        $httpBackend.flush();
        expect(scope.lastAction).toBe('you stopped the dataimport (pending)');
        expect(scope.lastActionOutcome).toBe('dataimport successfully stopped');
    });



    it ('should inform the user that the dataimport is not running', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=stop').
            respond({status:'not running'});

        scope.stopDataimport();
        $httpBackend.flush();
        expect(scope.lastAction).toBe('you stopped the dataimport (pending)');
        expect(scope.lastActionOutcome).toBe('dataimport not running');
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
        expect(scope.lastAction).toBe('you started the dataimport (pending)');
        expect(scope.lastActionOutcome).toBe('dataimport already running');
    });



});
