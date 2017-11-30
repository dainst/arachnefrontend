/**
 * Author: Daniel de Oliveira
 */
describe('ProjectsController', function () {

    var CON10T_URL = 'con10t/content.json';

    var scope = {};

    var prepare = function (prepareJson) {

        module('idai.components', function ($provide) {
            $provide.value('language', {
                currentLanguage: function () {
                    return 'de';
                }
            });
        });

        module('arachne.controllers');

        inject(function ($controller, _$httpBackend_) {

            $httpBackend = _$httpBackend_;
            $controller('ProjectsController', {'$scope': scope});
        });

        prepareJson();
    };


    var jsonFull = function () {

        $httpBackend.expectGET(CON10T_URL).respond(200, '{\
			"id": "",\
			"children": [\
			{\
				"id": "1",\
				"title": {\
					"de": "DAI - Objektdatenbank",\
					"en": "DAI - Objectdatabase",\
					"it": "DAI - IT"\
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
		');
        $httpBackend.flush();
    };

    var jsonGermanEnglish = function () {

        $httpBackend.expectGET(CON10T_URL).respond(200, '{\
			"id": "","children": [{\
				"id": "1",\
				"title": {\
					"de": "DAI - Objektdatenbank",\
					"en": "DAI - Objectdatabase"\
				}}]}');
        $httpBackend.flush();
    };

    var jsonGermanOnly = function () {

        $httpBackend.expectGET(CON10T_URL).respond(200, '{\
			"id": "", "children": [ {\
				"id": "1",\
				"title": { "de": "DAI - Objektdatenbank" }}]}');
        $httpBackend.flush();
    };


    it('should adjust the titles to german', function () {

        prepare(jsonFull);

        // 3 layers is the specified max (see http://dai-softsource.uni-koeln.de/projects/con10t/wiki/Men%C3%BCstruktur).
        expect(JSON.stringify(scope.columns[0][0].title['de'])).toBe('"DAI - Objektdatenbank"');
        expect(JSON.stringify(scope.columns[0][0].children[0].title['de'])).toBe('"Fotothek DAI Rom"');
        expect(JSON.stringify(scope.columns[0][0].children[0].children[0].title['de'])).toBe('"dede"');
    });

    it('should show a german title (german user)', function () {
        prepare(jsonFull);
        expect(JSON.stringify(scope.columns[0][0].title['de'])).toBe('"DAI - Objektdatenbank"');
    });

    it('should show an english title (british user)', function () {
        prepare(jsonFull);
        expect(JSON.stringify(scope.columns[0][0].title['en'])).toBe('"DAI - Objectdatabase"');
    });

    it('should show an italian title (italian user)', function () {
        prepare(jsonFull);
        expect(JSON.stringify(scope.columns[0][0].title['it'])).toBe('"DAI - IT"');
    });

    it('should show an english title (italian user, italian translation missing)', function () {
        prepare(jsonGermanEnglish);
        expect(JSON.stringify(scope.columns[0][0].title['en'])).toBe('"DAI - Objectdatabase"');
    });

    it('should show a german title (italian user, italian and english translation missing)', function () {
        prepare(jsonGermanOnly);
        expect(JSON.stringify(scope.columns[0][0].title['de'])).toBe('"DAI - Objektdatenbank"');
    });

    it('should show a german title (british user, english translation missing)', function () {
        prepare(jsonGermanOnly);
        expect(JSON.stringify(scope.columns[0][0].title['de'])).toBe('"DAI - Objektdatenbank"');
    });
});