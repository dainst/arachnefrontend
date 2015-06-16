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
        expect(scope.msg).toBe("idle");
    });

    it ('should report if backend is not available',function(){

        $httpBackend.expectGET('http://backend/data/admin/dataimport').
            respond(404,'');

        expect(scope.msg).toBe(undefined);
        $httpBackend.flush();
        expect(scope.msg).toBe("backend temporarily unavailable");
    });

});
