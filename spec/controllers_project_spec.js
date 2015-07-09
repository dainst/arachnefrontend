/**
 * Author: Daniel M. de Oliveira
 */
describe ('ProjectController', function() {

    var PROJECT_TITLE = "project_title";
    var TEMPLATE_URL = "con10t/{LANG}/"+PROJECT_TITLE+".html";
    var PROJECTS_JSON = 'con10t/projects.json';

    var scope = {};

    var prepare = function (primaryLanguage,searchParam) {
        module('arachne.controllers', function ($provide) {
            $provide.value('$location', {
                search : function () {
                    return searchParam;
                }
            });
            $provide.constant('$routeParams', {
                "name" : PROJECT_TITLE
            });
        });
        module('arachne.services', function($provide) {
            $provide.value('language', {
                __: function () {
                    return primaryLanguage;
                }
            });
        });


        inject(function ($controller, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $controller('ProjectController', {'$scope': scope});
        });
    }




    it ('should provide a german templateUrl with search param lang=de',function(){
        prepare('de',{ "lang" : "de" });
        expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','de'));
    });




    it ('should provide an italian templateUrl with no search param (project on 1st level)',function(){
        prepare('it',{});
        $httpBackend.expectGET(PROJECTS_JSON).respond(200,'[{\
            "id": "","children": [{\
                "id": "project_title",\
                "title": {\
                    "de": "DAI - Objektdatenbank",\
                    "it": "DAI - Objectdatabase"\
                }}]}]');
        $httpBackend.flush();
        expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','it'));
    });



    it ('should provide an italian templateUrl with no search param (project on 2nd level)',function(){
        prepare('it',{});
        $httpBackend.expectGET(PROJECTS_JSON).respond(200,'[{\
            "id": "",\
            "children": [\
            {\
                "id": "1",\
                "title": {\
                    "de": "DAI - Objektdatenbank"\
                },\
                "children": [\
                    {\
                        "id": "project_title",\
                        "title": {\
                            "it": "Fotothek DAI Rom",\
                            "en": "DAI Rome photo archive"\
                        }\
                    }\
                ]\
            }\
        ]\
        }\
        ]');
        $httpBackend.flush();
        expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','it'));
    });

    it ('should provide an italian templateUrl with no search param (project on 3rd level)',function(){
        prepare('it',{});
        $httpBackend.expectGET(PROJECTS_JSON).respond(200,'[{\
            "id": "",\
            "children": [\
            {\
                "id": "1",\
                "title": {\
                    "de": "DAI - Objektdatenbank"\
                },\
                "children": [\
                    {\
                        "id": "fotorom",\
                        "title": {\
                            "de": "Fotothek DAI Rom"\
                        },\
                        "children" : [ {\
                            "id" : "project_title", \
                            "title" : { \
                                "it" : "dede",\
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
        expect(scope.templateUrl).toBe(TEMPLATE_URL.replace('{LANG}','it'));
    });



});