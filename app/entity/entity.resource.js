/**
 * Resource interface for backend requests to entity- and search-endpoints.
 *
 * @author: Sebastian Cuy
 */
export default function($resource, arachneSettings, $q) {

    return $resource(
        arachneSettings.dataserviceUri + "/:endpoint/:id/:suffix",
        { id: '@entityId' },
        {
            get: {
                method: 'GET',
                params: { endpoint: 'entity'}
            },
            query: {
                method: 'GET',
                params: { endpoint: 'search' }
            },
            contexts: {
                method: 'GET',
                params: { endpoint: 'contexts' }
            },
            books: {
                method: 'GET',
                params: { endpoint: 'books' }
            },
            specialNavigations: {
                method: 'GET',
                url: arachneSettings.dataserviceUri + '/specialNavigationsService'
            },
            imageProperties: {
                method: 'GET',
                url: arachneSettings.dataserviceUri + '/image/zoomify/:id/ImageProperties.xml',
                cache: false,
                interceptor: {
                    response: function(response) {
                        var data = response.data;
                        if(data) {
                            var properties = {};
                            if (window.DOMParser) {
                                var parser = new DOMParser();
                                properties = parser.parseFromString(data,"text/xml");
                            } else {
                                properties = new ActiveXObject("Microsoft.XMLDOM");
                                properties.async=false;
                                properties.loadXML(data);
                            }
                            if(properties.firstChild)
                                return {
                                    width : properties.firstChild.getAttribute('WIDTH'),
                                    height : properties.firstChild.getAttribute('HEIGHT'),
                                    tilesize : properties.firstChild.getAttribute('TILESIZE')
                                };
                        }
                    }
                }
            }
        }
    );

};
