export default function($resource, arachneSettings) {

    return $resource(arachneSettings.dataserviceUri + '/catalog/entry/:id', null, {
        update: { method: 'PUT' },
        list: {
        	method: 'GET',
        	url: arachneSettings.dataserviceUri + '/catalog/list/:entityId',
        	isArray: true
        },
        save: { method: 'POST', isArray: true }
    });
};
