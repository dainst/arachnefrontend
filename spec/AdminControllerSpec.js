/**
 * Author: Daniel M. de Oliveira
 */

describe ('AdminController', function() {

    var scope;

    beforeEach(function(){

        module('arachne.controllers',function($provide){
            $provide.constant('arachneSettings', {
                dataserviceUri: "http://backend/data"
            });
        });
    });

    beforeEach(inject(function($controller,_$httpBackend_,arachneSettings){

        $httpBackend=_$httpBackend_;
        scope = {};
        $controller('AdminController',{'$scope':scope});

    }));



    it ('should show the idle msg',function(){

        $httpBackend.expectGET('http://backend/data/admin/dataimport').
            respond({status:'idle'});

        expect(scope.msg).toBe(undefined);
        $httpBackend.flush();
        expect(scope.dataimportResponse.status).toBe('idle');
    });






    it ('should report if backend is not available',function(){

        $httpBackend.expectGET('http://backend/data/admin/dataimport').
            respond(404,'');

        expect(scope.msg).toBe(undefined);
        $httpBackend.flush();
        expect(scope.msg).toBe("backend temporarily unavailable");
        expect(scope.dataimportStatus).toBe(undefined);
    });



    it ('should reject the start command when unauthorized', function() {

        $httpBackend.expectGET('http://backend/data/admin/dataimport').
            respond({status:'idle'});

        expect(scope.msg).toBe(undefined);
        $httpBackend.flush();


        $httpBackend.expectPOST('http://backend/data/admin/dataimport?command=start').
            respond(401,'');

        scope.startDataimport();
        $httpBackend.flush();

        expect(scope.msg).toBe('unauthorized');
    });


    it ('should react on the start command when authorized', function() {

        $httpBackend.expectGET('http://backend/data/admin/dataimport').
            respond({status:'idle'});

        expect(scope.msg).toBe(undefined);
        $httpBackend.flush();

        $httpBackend.expectPOST('http://backend/data/admin/dataimport?command=start').
            respond({status:'started'});
        $httpBackend.expectGET('http://backend/data/admin/dataimport').
            respond({status:'running'});


        scope.startDataimport();
        $httpBackend.flush();
        expect(scope.msg).toBe('dataimport successfully started');
    });


    it ('should inform the user if dataimport is running already', function() {

        $httpBackend.expectGET('http://backend/data/admin/dataimport').
            respond({status:'running'});

        expect(scope.msg).toBe(undefined);
        $httpBackend.flush();


        $httpBackend.expectPOST('http://backend/data/admin/dataimport?command=start').
            respond({status:'already running'});

        expect(scope.msg).toBe(undefined);
        scope.startDataimport();

        $httpBackend.flush();
        expect(scope.msg).toBe('dataimport already running');
    });



});
