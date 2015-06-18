/**
 * Author: Daniel M. de Oliveira
 */

describe ('DataimportCtrl', function() {

    var scope;
    var dataserviceUri='http://backend/data';
    var dataimportUri=dataserviceUri+'/admin/dataimport';


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



    it ('should show the idle msg',function(){

        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});

        expect(scope.msg).toBe(undefined);
        $httpBackend.flush();
        expect(scope.dataimportResponse.status).toBe('idle');
    });






    it ('should report if backend is not available',function(){

        $httpBackend.expectGET(dataimportUri).
            respond(404,'');
        $httpBackend.flush();

        expect(scope.msg).toBe("backend temporarily unavailable");
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

        expect(scope.msg).toBe('unauthorized');
    });

    it ('should reject the stop command when unauthorized', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'running'});
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=stop').
            respond(401,'');
        scope.stopDataimport();
        $httpBackend.flush();

        expect(scope.msg).toBe('unauthorized');
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
        expect(scope.msg).toBe('dataimport successfully started');
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
        expect(scope.msg).toBe('dataimport successfully stopped');
    });



    it ('should inform the user that the dataimport is not running', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'idle'});
        $httpBackend.flush();

        $httpBackend.expectPOST(dataimportUri+'?command=stop').
            respond({status:'not running'});

        scope.stopDataimport();
        $httpBackend.flush();
        expect(scope.msg).toBe('dataimport not running');
    });



    it ('should inform the user if dataimport is running already', function() {

        $httpBackend.expectGET(dataimportUri).
            respond({status:'running'});
        $httpBackend.flush();


        $httpBackend.expectPOST(dataimportUri+'?command=start').
            respond({status:'already running'});

        expect(scope.msg).toBe(undefined);
        scope.startDataimport();

        $httpBackend.flush();
        expect(scope.msg).toBe('dataimport already running');
    });



});
