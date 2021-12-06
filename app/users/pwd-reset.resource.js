export default function($resource, arachneSettings) {

    return $resource(arachneSettings.dataserviceUri + '/user/reset', {}, {
        save : {
            isArray: false,
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }
    });
};
