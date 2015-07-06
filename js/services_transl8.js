'use strict';

/**
 * @author: Daniel M. de Oliveira
 */

/* Services */
angular.module('arachne.services')
.factory('transl8', ['$http', 'language', function($http, language) {

    var TRANSLATION_MISSING = 'TRL8 MISSING';

    var fallbackLang='en';

    var lang=fallbackLang;
    if (language.__().substring(0,2)=='de') lang='de';

    var transl8Url = "http://crazyhorse.archaeologie.uni-koeln.de/transl8/" +
        "translation/jsonp?application=arachne4_frontend&lang="+lang+"&callback=JSON_CALLBACK";




    var translations={};
    $http.jsonp(transl8Url).
        success(function(data, status, headers, config) {

            for(var i = 0; i < data.length; i++) {
                translations[data[i].key] = data[i].value;
            }
        }).
        error(function(data, status, headers, config) {
            alert("ERROR: Could not get translations. Try to reload the page or send a mail to arachne@uni-koeln.de");
        });

    return {

        getFallbackLanguage: function(){
            return fallbackLang;
        },

        getLanguage: function() {
            return fallbackLang;
        },

        getTranslation: function(key) {

            var translation = translations[key];
            if (!translation || 0 === translation.length)
                translation=TRANSLATION_MISSING;

            return translation;
        }
    }
}]);