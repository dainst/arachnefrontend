/**
 * Author: Daniel M. de Oliveira
 */

describe('transl8', function (){

    var KEY = "navbar_about";
    var KEY_INVALID = "navbar_xyz";
    var TRANSL8_JSONP_URL = "http://crazyhorse.archaeologie.uni-koeln.de/transl8/" +
        "translation/jsonp?application=arachne4_frontend&lang={LANG}&callback=JSON_CALLBACK";
    var TRANSLATION_MISSING = 'TRL8 MISSING';
    var TRANSLATION_EN = 'About Arachne';
    var TRANSLATION_DE = 'Über Arachne';


    var mockDataEn = [ {key: KEY, value: TRANSLATION_EN} ];
    var mockDataDe = [ {key: KEY, value: TRANSLATION_DE} ];
    var transl8UrlEn = TRANSL8_JSONP_URL.replace('{LANG}','en');
    var transl8UrlDe = TRANSL8_JSONP_URL.replace('{LANG}','de');




    var transl8,$httpBackend;



    var prepare = function(primaryLang){

        module('arachne.services',function($provide) {
                $provide.value('language', {
                    __: function () {
                        return primaryLang;
                    }
                });
            }
        );

        inject(function(_transl8_, _$httpBackend_) {
            transl8 = _transl8_;
            $httpBackend = _$httpBackend_;
        });

        $httpBackend.whenJSONP(transl8UrlDe).respond(mockDataDe);
        $httpBackend.whenJSONP(transl8UrlEn).respond(mockDataEn);
    }

    it('should provide german menu items for german users', function () {

        prepare('de');

        $httpBackend.flush();
        expect(transl8.getTranslation(KEY)).toBe(TRANSLATION_DE);
    });

    it('should provide english menu items for english users', function () {

        prepare('en-US');

        $httpBackend.flush();
        expect(transl8.getTranslation(KEY)).toBe(TRANSLATION_EN);
    });

    it('should provide english menu items for danish users', function () {

        prepare('da');

        $httpBackend.flush();
        expect(transl8.getTranslation(KEY)).toBe(TRANSLATION_EN);
    });




    it('lacks a german translation (german user)', function () {

        prepare('de');

        $httpBackend.flush();
        expect(transl8.getTranslation(KEY_INVALID)).toBe(TRANSLATION_MISSING);
    });

    it('lacks an english translation (english user)', function () {

        prepare('en');

        $httpBackend.flush();
        expect(transl8.getTranslation(KEY_INVALID)).toBe(TRANSLATION_MISSING);
    });

    it('lacks an english translation (danish user)', function () {

        prepare('da');

        $httpBackend.flush();
        expect(transl8.getTranslation(KEY_INVALID)).toBe(TRANSLATION_MISSING);
    });
});