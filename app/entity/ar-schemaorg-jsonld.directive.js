export default function () {
    return {
        scope: 
            { entity: '=', lastmodified: '=' },
        replace: true,
        template: require('./ar-schemaorg-jsonld.html')
    }
};
