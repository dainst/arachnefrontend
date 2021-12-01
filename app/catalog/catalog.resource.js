export default function($resource, arachneSettings) {

    return $resource(arachneSettings.dataserviceUri + '/catalog/:id', null, {
        update: { method: 'PUT' }
    });

};
