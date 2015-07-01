/**
 * Author: Daniel M. de Oliveira
 */

describe('Transl8', function (){
    var Transl8,$httpBackend;

    beforeEach(function (){

        module('arachne.services');

        inject(function(_Transl8_, _$httpBackend_) {
            Transl8 = _Transl8_;
            $httpBackend = _$httpBackend_;
        });

        var mockData = [ {key: "testkey1", value: "testvalue1"}, {key: "testkey2", value: "testvalue2"} ];
        var url = "http://crazyhorse.archaeologie.uni-koeln.de/transl8/translation/jsonp?application=arachne4_frontend&callback=JSON_CALLBACK";
        $httpBackend.whenJSONP(url).respond(mockData);

    });

    it('should invoke the callback', function () {

        var translations={};

        var callback=function(param) {
            translations=param;
        };

        Transl8.abc(callback);
        $httpBackend.flush();
        expect(translations['testkey1']).toBe('testvalue1');
        expect(translations['testkey1']).not.toBe('testvalue2');
    });
});