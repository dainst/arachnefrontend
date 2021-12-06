/**
 * @author: Patrick Jominet
 */
export default function($resource, arachneSettings) {

    return $resource(arachneSettings.dataserviceUri + '/user/change', {}, {
        save : {
            isArray: false,
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }
    });
};
