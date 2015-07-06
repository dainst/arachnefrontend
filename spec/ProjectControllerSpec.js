/**
 * Author: Daniel M. de Oliveira
 */

describe ('ProjectController', function() {

	var CON10T_URL = 'con10t/{LANG}/abc.html'

    var scope = {};
	var $httpBackend;
	
	var con10t_da = CON10T_URL.replace('{LANG}','da');
	var con10t_it = CON10T_URL.replace('{LANG}','it');
	var con10t_de = CON10T_URL.replace('{LANG}','de');
	var con10t_en = CON10T_URL.replace('{LANG}','en');

	var prepare = function(primaryLanguage) {
		
        module('arachne.controllers',function($provide){
        	$provide.constant('$routeParams', { name: 'abc' });
        	$provide.value('language',{__:function(){return primaryLanguage;}});
        });
    	

    	inject(function($controller,$routeParams,language,_$httpBackend_){

        	$httpBackend=_$httpBackend_;
        	$controller('ProjectController',{'$scope':scope});
    	});
	}

	// === Behaviour Tests ===

    it ('should provide the link to a german page (german user) ',function(){

		prepare('de');

        $httpBackend.expectGET(con10t_de).respond(200,'');
		$httpBackend.flush();

        expect(scope.templateUrl).toBe(con10t_de);
    });
	
    it ('should provide the link to an english page (british user) ',function(){

		prepare('en');

        $httpBackend.expectGET(con10t_en).respond(200,'');
		$httpBackend.flush();

        expect(scope.templateUrl).toBe(con10t_en);
    });
	
    it ('should provide the link to an italian page (italian user) ',function(){

		prepare('it');

        $httpBackend.expectGET(con10t_it).respond(200,'');
		$httpBackend.flush();

        expect(scope.templateUrl).toBe(con10t_it);
    });
	
    it ('should provide the link to an english page (italian user, italian translation missing) ',function(){

		prepare('it');

        $httpBackend.expectGET(con10t_it).respond(404,'');
    	$httpBackend.expectGET(con10t_en).respond(200,'');
		$httpBackend.flush();

        expect(scope.templateUrl).toBe(con10t_en);
    });
	
    it ('should provide the link to a german page (italian user, any translation missing) ',function(){

		prepare('it');

        $httpBackend.expectGET(con10t_it).respond(404,'');
    	$httpBackend.expectGET(con10t_en).respond(404,'');
		$httpBackend.flush();

        expect(scope.templateUrl).toBe(con10t_de);
    });
	
    it ('should provide the link to a german page (italian user, any translation missing) ',function(){

		prepare('da');

        $httpBackend.expectGET(con10t_da).respond(404,'');
    	$httpBackend.expectGET(con10t_en).respond(404,'');
		$httpBackend.flush();

        expect(scope.templateUrl).toBe(con10t_de);
    });
	
	
	// === Unit Tests ===
	
    it ('should provide the link to an english page (american user) ',function(){

		prepare('en-US');

        $httpBackend.expectGET(con10t_en).respond(200,'');
		$httpBackend.flush();

        expect(scope.templateUrl).toBe(con10t_en);
    });
	
    it ('should provide the link to a german page (austrian user) ',function(){

		prepare('de-AT');

        $httpBackend.expectGET(con10t_de).respond(200,'');
		$httpBackend.flush();

        expect(scope.templateUrl).toBe(con10t_de);
    });
	
	
	// TODO german translation missing. for german, english, other
	// TODO send problem to message service	
	
});