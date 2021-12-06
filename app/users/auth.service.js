// singleton service for authentication, stores credentials in browser cookie
// if cookie is present the stored credentials get sent with every backend request
export default function($http, arachneSettings, $filter, $cookies) {

    // initialize to whatever is in the cookie, if anything
    if ($cookies.get('ar-auth')) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('ar-auth');
    } else {
        delete $http.defaults.headers.common['Authorization'];
    }

    return {

        setCredentials: function (username, password, successMethod, errorMethod) {
            var encoded = $filter('base64')(username + ':' + $filter('md5')(password)), response;

            $http.get(arachneSettings.dataserviceUri + '/userinfo/'+username, { headers: { 'Authorization': 'Basic ' + encoded } })
                .then(function(result) {

                    response = result.data;

                    $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                    $cookies.put('ar-auth', encoded);
                    $cookies.putObject('ar-user-object', { username: username, groupID: response.groupID });

                    if (response.datasetGroups !== undefined) {
                        $cookies.putObject('ar-datasetgroups-object', response.datasetGroups);
                    }

                    successMethod();
                }).catch(function(response) {
                    errorMethod(response);
                });
        },

        clearCredentials: function () {
            document.execCommand("ClearAuthenticationCache");
            $cookies.remove('ar-auth');
            $cookies.remove('ar-user-object');
            $cookies.remove('ar-datasetgroups-object');
            delete $http.defaults.headers.common['Authorization'];
        },

        getUser: function() {
            return $cookies.getObject('ar-user-object');
        },

        getDatasetGroups: function() {
            return $cookies.getObject('ar-datasetgroups-object') || [];
        }

    };
};
