angular.module('arachne.filters')

    .filter('errorMessage', function () {
        return function (errorCode) {
            var message;
            switch (errorCode) {
                case 403:
                    message = "Zugriff nicht erlaubt.";
                    break;
                case 404:
                    message = "Datenserver oder Entität konnte nicht gefunden werden.";
                    break;
                case 400:
                    message = "Fehlerhafte Server-Anfrage";
                    break;
                default:
                    message = "Unbekannter Fehlercode";
            }
            return message;

        }
    });