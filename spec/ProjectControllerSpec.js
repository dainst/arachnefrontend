/**
 * Author: Daniel M. de Oliveira
 */

describe ('ProjectController', function() {

    var scope = {}

    beforeEach(function(){

        module('arachne.controllers',function($provide){
            $provide.constant('$routeParams', { name: 'abc' });
            $provide.value('language',{__:function(){return 'de';}});
        });
    });

    beforeEach(inject(function($controller,$routeParams,language,_$httpBackend_){

        $httpBackend=_$httpBackend_;
        $controller('ProjectController',{'$scope':scope});

    }));


    it ('should fail',function(){

        /*$httpBackend.expectGET('con10t/de/abc.html').
            respond(200,'');
        $httpBackend.flush();*/

        expect('todo').toBe('todo');
    });
});