/**
 * Author: Daniel M. de Oliveira
 */
describe ('ProjectsController', function() {

    var CON10T_URL = 'con10t/projects.json';

    var scope = {};


    var prepare = function(primaryLanguage) {

        module('arachne.controllers',function($provide){
            $provide.value('language',{__:function(){return primaryLanguage;}});
        });

        inject(function($controller,_$httpBackend_){

            $httpBackend=_$httpBackend_;
            $controller('ProjectsController',{'$scope':scope});
        });

        $httpBackend.expectGET(CON10T_URL).respond(200,'[\
        {\
            "id": "",\
            "title": {\
            "de": "Inhalte",\
            "en": "Content"\
        },\
            "children": [\
            {\
                "id": "",\
                "title": {\
                    "de": "DAI - Objektdatenbank",\
                    "en": "DAI - Objectdatabase"\
                },\
                "children": [\
                    {\
                        "id": "fotorom",\
                        "title": {\
                            "de": "Fotothek DAI Rom",\
                            "en": "DAI Rome photo archive"\
                        },\
                        "children" : [ {\
                            "title" : { \
                                "de" : "dede",\
                                "en" : "enen" \
                            }\
                            \
                        } ]\
                    }\
                ]\
            }\
        ]\
        }\
        ]');
        $httpBackend.flush();
    }


    it ('should adjust the titles to german',function(){

        prepare('de');

        // 3 layers is the specified max (see http://dai-softsource.uni-koeln.de/projects/con10t/wiki/Men%C3%BCstruktur).

        expect(JSON.stringify(scope.columns[0][0].title)).toBe('"DAI - Objektdatenbank"');
        expect(JSON.stringify(scope.columns[0][0].children[0].title)).toBe('"Fotothek DAI Rom"');
        expect(JSON.stringify(scope.columns[0][0].children[0].children[0].title)).toBe('"dede"');
    });




});