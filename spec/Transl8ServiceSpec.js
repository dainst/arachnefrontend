/**
 * Author: Daniel M. de Oliveira
 */

describe('Transl8', function (){
	
	var transl8Url = "http://crazyhorse.archaeologie.uni-koeln.de/transl8/" +
		"translation/jsonp?application=arachne4_frontend&lang=de&callback=JSON_CALLBACK";
	
    var Transl8,$httpBackend;

    beforeEach(function (){

        module('arachne.services');

        inject(function(_Transl8_, _$httpBackend_) {
            Transl8 = _Transl8_;
            $httpBackend = _$httpBackend_;
        });

        var mockData = [ {key: "testkey1", value: "testvalue1"}, {key: "testkey2", value: "testvalue2"} ];
        $httpBackend.whenJSONP(transl8Url).respond(mockData);

    });

    it('should provide an appropriate translation for a key', function () {

        var translations={};
		
        $httpBackend.flush();
        expect(Transl8.getTranslation('testkey1')).toBe('testvalue1');
        expect(Transl8.getTranslation('testkey1')).not.toBe('testvalue2');
    });
});