'use strict';

(function(){
/**
 * @name isAbsoluteUrl
 * @author Mohamed Kamal Kamaly
 * @description
 * 
 * # isAbsoluteUrl
 * 
 * Determines whether the url is an absolute url (not relative)
 **/
function isAbsoluteUrl(url){
	if (url) {
		return url[0] === '/' || (url.indexOf('://') !== -1);
	} else {
		return false;
	}
}

/**
 * @author Mohamed Kamal Kamaly
 * A function that traverse the full tree of a jqLite element
 * and perform operations on its nodes
 **/
function searchAndApply(elem, opertations){
	if(elem.length == 0)
		return;

	for(var i=0; i<elem.length; i++){
		for(var j=0; j<opertations.length; j++){
			if(opertations[j].matcherFunc(elem[i])){
				opertations[j].applyFunc(elem[i]);
			}
		}
	}
	
	/* cannot use setTimeout for the recursion because the interceptor
	   has to return the proccessed response */
	searchAndApply(elem.children(), opertations);
}

/**
 * @author Mohamed Kamal Kamaly
 * a property matcher to be used in searchAndApply function
 **/
function propertyMatcher(propertyName, propertyValue){
	return function(element){
		return element[propertyName] === propertyValue;
	}
}

/**
 * @name isAbsoluteUrl
 * @author Mohamed Kamal Kamaly
 * @description
 * 
 * # isAbsoluteUrl
 * 
 * A function that returns a function that can be passed in
 * the searchAndApply function to replace the attributes with
 * relative paths to full paths 
 **/
function insertRestOfPath(attributeName, parentUrl) {
	return function(elementNode) {
		var element = angular.element(elementNode);
		
		var elementUrl = element.attr(attributeName);
		
		if(isAbsoluteUrl(elementUrl)){
			return;
		}

		var newUrl = parentUrl.substr(0, parentUrl.lastIndexOf('/') + 1) + elementUrl;
		
		element.attr(attributeName, newUrl);
	};
}
	
/**
 * @name relativePathsInPartial
 * @author Mohamed Kamal Kamaly
 * @description
 * 
 * # relativePathsInPartial
 * 
 * When you modularize your apps by features not by layers, usually you want each feature to be self contained
 * so your controller, html partial and any static resources (images, css, other htmls, ...etc) that is only
 * related to this feature are placed in the same folder, the problem occurs when you want to use static resources like an image
 * you will have to write the full path of the image because relative path in partials is actually relative to the index.html
 * not the html partial, this means in any change of the folder structure of your app, you will
 * have to manually modifiy the path of all the static resources
 * 
 * relativePathsInPartial helps solving this problem by allowing you to write paths of your resource
 * relative to the html partial file.
 * 
 * it works by adding an interceptor to the http response, when a partial is requested from the server 
 * and returns in a response, relativePathsInPartial intercepts this response, modify all the paths to have full
 * path relative to parent.
 * 
 * relativePathsInPartial uses angular.element (jqLite and doesn't depend on JQuery)
 *
 * modified for arachne4 in order to only resolve partial paths in templates under the con10t directory
 * 
 */
angular.module('relativePathsInPartial', [])
	.config(['$httpProvider', function($httpProvider) {
		$httpProvider.interceptors.push(function() {
			return {
				response : function(response) {
					var url = response.config.url;

                    if (!url || angular.isObject(url)) { // maybe sce wrapped object or whatever fuckup
                        return response;
                    }

					/*
					 * TODO: check if the request is sent with template
					 * cache to be sure that it is an angular template
					 * 
					 * put the template after processing
					 * into the cache and do not process it again
					 */

					if (url.indexOf('con10t') === 0 && url.lastIndexOf('.html') === url.length - 5) {
						var elem = new angular.element(response.data);

						var myOperations = [{
							matcherFunc: propertyMatcher('tagName', 'LINK'),
							applyFunc: insertRestOfPath('href', url)
						},{
							matcherFunc: propertyMatcher('tagName', 'SCRIPT'),
							applyFunc: insertRestOfPath('src', url)
						},{
							matcherFunc: propertyMatcher('tagName', 'IMG'),
							applyFunc: insertRestOfPath('src', url)
						}];

						// TODO: find an efficient way to process 'src' attribute of 'ng-include'
						// elem.find('ng-include').each(replaceUrlFunc('src'));
						searchAndApply(elem, myOperations);

						response.data = angular.element('<div />').append(elem).html();
					}

					return response;
				}
			};
		});
	}]);


})();