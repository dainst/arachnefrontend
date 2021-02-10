# Table of Contents
1. [Headers](#headers)
    1. [Authentication](#authentication)
    1. [Content-Type](#content-type)
1. [Endpoints](#endpoints)
    1. [Data retrieval](#data-retrieval)
    1. [Search](#search)
    1. [User](#user)
    1. [Image retrieval](#image-retrieval)
    1. [Catalog](#catalog)
    1. [Book Browser related](#book-browser-related)
    1. [Administration](#administration)


# Headers

## Authentication

To use the backend with a authorized user / pw, you need to create a md5 hash of your password, e.g. http://www.miraclesalad.com/webtools/md5.php.

Use HTTP Basic Authentication with your Arachne username and the md5-hashed password.

## Content-Type

When sending data to the API make sure to send the correct Content-Type header, e.g.:
* `Content-Type:application/json`


# Endpoints
Endpoint-URLs are given relative to the base URL. For the production version of Arachne use `https://arachne.dainst.org/data`.

All requests will return JSON. All POST/PUT requests expect JSON.

All requests support HTTP basic auth, for some it is mandatory (mostly admin tasks).


## Data retrieval

### GET /entity/$entityId

`RequestParameter: live` *optional* (default: `false`)

* **$entityId** long Unique ArachneID of the entity
* **_live_** boolean If `true` the data will be fetched from the database else it will be fetched from elasticsearch.

Retrieves a single formatted entity.



### GET /entity/$category/$categoryId

`RequestParameter: live` *optional* (default: `false`)

* **$category** string Name of a category (e.g. bauwerk)
* **$categoryId** long Internal ID of the entity

* **_live_** boolean If `true` the data will be fetched from the database else it will be fetched from elasticsearch.

Retrieves a single formatted entity (same as above).


## Search

### GET /search

Executes a search. The q-parameter supports the elasticsearch query string "mini-language".

* `RequestParameter: q` *mandatory*, string: The search string
* `RequestParameter: fq` *optional*, string: Facet query string (e.g. facet_kategorie:"bauwerk").
* `RequestParameter: limit` *optional*, int: The maximum number of returned documents. Set this to 0 to retrieve only the number of search hits and facets. Maximum is 1000.
* `RequestParameter: offset` *optional*, int: An offset into the search result. Offsets must be lower than `10000 - limit` for standard searches and are not restricted for 'harvest queries' to allow those queries to be split up or continued after a failure.
* `RequestParameter: fl` *optional*, int: The maximum number of returned facet values. Set this to 0 to get all facet values.
* `RequestParameter: fo` *optional*, int: An offset into the list(s) of facet values.
* `RequestParameter: sort` *optional*, int: The field to sort on.
* `RequestParameter: desc` *optional*, boolean: If the sort should be in descending order.
* `RequestParameter: bbox` *optional*, string: A geospatial bounding box (top-left and buttom-right corner) to filter the results (as comma separated list of values; order: lat lon).
* `RequestParameter: ghprec` *optional*, int: The precision of the geohash used for the geo-grid facet. A value between 1 and 12 (default 5). Cell dimensions at the equator range from 5,009.4km x 4,992.6km (precision 1) down to 3.7cm x 1.9cm (precision 12).
* `RequestParameter: scroll` *optional*, boolean: If true a scrollId will be returned with the result which can be used to scroll through the whole search result via '/search/scroll/$scrollId'. The search context will be available for 1 minute. User must be logged in.
* `RequestParameter: facet` *optional*, string: If specified only the values of this facet will be returned.
* `RequestParameter: editorfields` *optional*, boolean: If the editor fields should be searched and highlighted, too (user must at least have editor rights for this to take effect). The default value is `true`.

### GET /search/scroll/$scrollId

* **$scrollId** string The scrollId as returned by a prior search with parameter `scroll=true`

Returns the next 'page' of search results and keeps the search context alive for another minute. The 'size' of a 'page' is determined by the limit of the initial search request.
Only accessible for logged in users.



### GET /contexts/$entityId

`RequestParameter: fq` *optional*

`RequestParameter: limit` *optional*

`RequestParameter: offset` *optional*

`RequestParameter: fl` *optional*

`RequestParameter: sort` *optional*

`RequestParameter: desc` *optional*

* **$entityId** long Unique ArachneID of the entity

* **_fq_** string Facet query string (e.g. facet_kategorie:"bauwerk").
* **_limit_** int The maximum number of returned search hits.
* **_offset_** int An offset into the search result.
* **_fl_** int The maximum number of returned facet values.
* **_sort_** int The field to sort on.
* **_desc_** boolean If the sort sould be in descending order.

Returns a search result containing the contexts of the specified entityId.



### GET /index/$facetName

`RequestParameter: group` *optional*

* **$facetName** string The name of the facet of interest.

* **_group_** char A single character indicating which sublist of the result to retrieve (supported values are '<', '$', '>' and 'a' to 'z').

Returns a list of all unique facet values. If the group parameter is specified only a sublist will be returned.
'<': Returns all values with initial letters lower than '0'.
'$': Returns all values starting with numbers.
'>': Returns all values with initial letters greater than 'z'.
'a'...'z': Returns all values starting with the specified letter.


## User

### GET /user/$username

* **$username** String Unique Arachne user name

Retrieves the user information for the given user name. This endpoint can also be used implement authentication since only logged in users are allowed to retrieve their user info. Admins (gid 800) are also allowed to retrieve info on other users.



### POST /user/reset

* **body** JSON User information.

```
{
"username" : "somename",
"email" : "some@address.com",
"firstname": "firstname",
"lastname": "lastname",
"zip": "12345"
}
```

Requests a password reset for the account specified by `username` and `email`. An eMail containing an activation link is sent to the user.



### POST /user/activation/$token`

* **$token** string The activation token identifying a password reset request.

* **body** JSON User information.

```
{
"password": "somepassword",
"passwordConfirm": "somepassword",
}
```

Sets the password of the account associated with the password reset request identified by the activation token to the provided one.



### DELETE /userinfo/$username

* **$username** string The user that is being deleted.

Users can delete themselves or can be deleted by admins.


## Image retrieval
All Images are JPEG encoded.
The value of the different image resolutions is in pixels and specifies the max value for the largest dimension (either width or height depending on the aspect ration) of the image (**imageResolutionICON, imageResolutionTHUMBNAIL, imageResolutionPREVIEW, imageResolutionHIGH**).



### GET /image/$entityId

* **$entityId** long Unique ArachneID of the image

Retrieves an image from the image server in the highest possible resolution.
The resolution depends on the users access rights.



### GET /image/icon/$entityId

* **$entityId** long Unique ArachneID of the image
Retrieves an image from the image server in icon resolution.



### GET /image/thumbnail/$entityId
* **$entityId** long Unique ArachneID of the image
Retrieves an image from the image server in thumbnail resolution.



### GET /image/preview/$entityId

* **$entityId** long Unique ArachneID of the image
Retrieves an image from the image server in preview resolution.



### GET /image/width/$entityId?width=$width

`RequestParameter: width` *mandatory*

* **$entityId** long Unique ArachneID of the image
* **$width** int requested width of the image
Retrieves an image from the image server with the specified width.



### GET /image/height/$entityId?height=$height

`RequestParameter: height` *mandatory*

* **$entityId** long Unique ArachneID of the image
* **$height int** requested height of the image

Retrieves an image from the image server with the specified height.



### GET /image/zoomify/$entityId/ImageProperties.xml

* **$entityId** long Unique ArachneID of the image

Retrieves the ImageProperties.xml file for the given image to use with a Zoomify compliant viewer.



### GET /image/zoomify/$entityId/$z-$x-$y.jpg

* **$entityId** long Unique ArachneID of the image
* **$z** int Zoomify resolution level
* **$x** int Zoomify tile column.
* **$y** int Zoomify tile row.

Retrieves an image tile to use with a Zoomify compliant viewer.



### GET /image/iipviewer

`RequestParameter: FIF` *mandatory*

* **FIF** long entityId of the image

Handles communication between the image server and an IIP compliant viewer on the client side.


## Catalog

<details>
<summary>Examples for the catalog-API</summary>

**GET /catalog/$catalogId**

```
{
    "id": 83,
    "root": {
        "id": 597,
        "children": [
            {
                "id": 594,
                "totalChildren": 0,
                "arachneEntityId": null,
                "label": "Vorbebauung",
                "text": null,
                "path": "83/597/594",
                "parentId": 597,
                "indexParent": 0,
                "catalogId": 83
            },
            {
                "id": 593,
                "totalChildren": 6,
                "arachneEntityId": null,
                "label": "Basilica Aemilia",
                "text": null,
                "path": "83/597/593",
                "parentId": 597,
                "indexParent": 1,
                "catalogId": 83
            }
        ],
        "arachneEntityId": null,
        "label": "Die Basilica Aemilia auf dem Forum Romanum in Rom: Brennpunkt des öffentlichen Lebens",
        "text": "Nach der Errichtung in den 60er Jahren des 2. Jhs. v. Chr. durch die beiden Konsuln M. Aemilius Lepidus und M. Fulvius Nobilior wurde die Basilica mehrmals zerstört [...]",
        "path": "83/597",
        "parentId": null,
        "indexParent": null,
        "catalogId": 83
    },
    "author": "Testauthor",
    "public": false
}
```

**POST /catalog**

```
{
    "author": "Testauthor",
    "public": false,
    "root": {
        "label": "Die Basilica Aemilia auf dem Forum Romanum in Rom: Brennpunkt des öffentlichen Lebens",
        "text": "Nach der Errichtung in den 60er Jahren des 2. Jhs. v. Chr. durch die beiden Konsuln M. Aemilius Lepidus und M. Fulvius Nobilior wurde die Basilica mehrmals zerstört [...]",
        "children": [
            {
                "children": [],
                "label": "Vorbebauung"
            },
            {
                "children": [
                    {
                        "children": [
                            {
                                "children": [
                                    {
                                        "children": [
                                            {
                                                "arachneEntityId": 1184191,
                                                "label": "Fundamente der Innensäulen",
                                                "text": "Die Fundamente der Innensäulen."
                                            }
                                        ],
                                        "label": "Fundamente"
                                    }
                                ],
                                "label": "Republikanische Zeit"
                            }
                        ],
                        "label": "Aula"
                    }
                ],
                "arachneEntityId": null,
                "label": "Basilica Aemilia"
            }
        ]
    }
}
```

**PUT /catalog/$catalogId**

```
{
    "id": 83,
    "author": "Testauthor",
    "public": false
}
```

**POST /catalog/entry**

```
{
    "arachneEntityId": null,
    "label": "Testlabel",
    "parentId": 598,
    "indexParent": 0
}
```

**PUT /catalog/entry/$entryId**

```
{
    "id": 535353,
    "catalogId": 13213,
    "arachneEntityId": 1,
    "label": "Updated Testlabel",
    "parentId": 598,
    "indexParent": 1
}
```

</details>



### GET /catalog

Retrieves all catalogs of the current user



### GET /catalog/$catalogId

`RequestParameter: limit` *optional* (default: 0)

`RequestParameter: offset` *optional* (default: 0)

* **$catalogId** long Unique ID of the catalog

* **limit** int this limits the number of children retrieved. A value of 0 retrieves all children.
* **offset** int If the parameter _limit_ is greater than zero this parameter gives an offset into the child list.

Retrieves a single catalog with specified id.
Returns 403 if the catalog is not owned by the current user or not public.

<details>
<summary>Example for this Query</summary>

**GET /catalog/$catalogId**

```
{
    "id": 83,
    "root": {
        "id": 597,
        "children": [
            {
                "id": 594,
                "children": [],
                "arachneEntityId": null,
                "label": "Vorbebauung",
                "text": null,
                "path": "83/597/594",
                "parentId": 597,
                "indexParent": 0,
                "catalogId": 83
            },
            {
                "id": 593,
                "children": [
                    {
                        "id": 595,
                        "children": [
                            {
                                "id": 596,
                                "children": [
                                    {
                                        "id": 598,
                                        "children": [
                                            {
                                                "id": 599,
                                                "children": [],
                                                "arachneEntityId": 1184191,
                                                "label": "Fundamente der Innensäulen",
                                                "text": "Die Fundamente der Innensäulen.",
                                                "path": "83/597/593/595/596/598/599",
                                                "parentId": 598,
                                                "indexParent": 0,
                                                "catalogId": 83
                                            }
                                        ],
                                        "arachneEntityId": null,
                                        "label": "Fundamente",
                                        "text": null,
                                        "path": "83/597/593/595/596/598",
                                        "parentId": 596,
                                        "indexParent": 0,
                                        "catalogId": 83
                                    }
                                ],
                                "arachneEntityId": null,
                                "label": "Republikanische Zeit",
                                "text": null,
                                "path": "83/597/593/595/596",
                                "parentId": 595,
                                "indexParent": 0,
                                "catalogId": 83
                            }
                        ],
                        "arachneEntityId": null,
                        "label": "Aula",
                        "text": null,
                        "path": "83/597/593/595",
                        "parentId": 593,
                        "indexParent": 0,
                        "catalogId": 83
                    }
                ],
                "arachneEntityId": null,
                "label": "Basilica Aemilia",
                "text": null,
                "path": "83/597/593",
                "parentId": 597,
                "indexParent": 1,
                "catalogId": 83
            }
        ],
        "arachneEntityId": null,
        "label": "Die Basilica Aemilia auf dem Forum Romanum in Rom: Brennpunkt des öffentlichen Lebens",
        "text": "Nach der Errichtung in den 60er Jahren des 2. Jhs. v. Chr. durch die beiden Konsuln M. Aemilius Lepidus und M. Fulvius Nobilior wurde die Basilica mehrmals zerstört [...]",
        "path": "83/597",
        "parentId": null,
        "indexParent": null,
        "catalogId": 83
    },
    "author": "Testauthor",
    "public": false
}
```
</details>



### POST /catalog

**RequestBody: a catalog object (JSON)**

Creates the posted catalog and returns it.
Creates all nested catalogEntries.
Returns 403 if no user is signed in.

The order of the CatalogEntries and their children is persisted to the database and always returned the same way.
Newly created catalogs are always private.

<details>
<summary>Example for this Query</summary>

**POST /catalog**

```
{
    "author": "Testauthor",
    "public": false,
    "root": {
        "label": "Die Basilica Aemilia auf dem Forum Romanum in Rom: Brennpunkt des öffentlichen Lebens",
        "text": "Nach der Errichtung in den 60er Jahren des 2. Jhs. v. Chr. durch die beiden Konsuln M. Aemilius Lepidus und M. Fulvius Nobilior wurde die Basilica mehrmals zerstört [...]",
        "children": [
            {
                "children": [],
                "label": "Vorbebauung"
            },
            {
                "children": [
                    {
                        "children": [
                            {
                                "children": [
                                    {
                                        "children": [
                                            {
                                                "arachneEntityId": 1184191,
                                                "label": "Fundamente der Innensäulen",
                                                "text": "Die Fundamente der Innensäulen."
                                            }
                                        ],
                                        "label": "Fundamente"
                                    }
                                ],
                                "label": "Republikanische Zeit"
                            }
                        ],
                        "label": "Aula"
                    }
                ],
                "arachneEntityId": null,
                "label": "Basilica Aemilia"
            }
        ]
    }
}
```
</details>



### PUT /catalog/$catalogId
**RequestBody: a catalog object (JSON)**

* **$catalogId** long Unique ID of the catalog

Updates the catalog, returns 200 and the updated catalog.
Does nothing and returns 403 if the catalog is not owned by the current user.
Ignores root of the posted catalog, so it can be ommited.

<details>
<summary>Example for this Query</summary>

**PUT /catalog/$catalogId**

```
{
    "id": 83,
    "author": "Testauthor",
    "public": false
}
```
</details>



### DELETE /catalog/$catalogId

* **$catalogId** long Unique ID of the catalog

Destroys the catalog and all associated CatalogEntries, returns 402.
Does nothing and returns 403 if the catalog is not owned by the current user.



### GET /catalog/list/$entityId

* **$entityId** long The unique ID of the entity of interest.

Retrieves a list of all catalogs of the current user of which the given entityId is part of.



### GET /catalog/entry/$catalogentryId

**RequestParameter: limit optional** (default: 0)

**RequestParameter: offset optional** (default: 0)

* **$catalogentryId** long Unique ID of the CatalogEntry

* **limit** int This limits the number of children retrieved. A value of 0 retrieves all children.
* **offset** int If the parameter _limit_ is greater than zero this parameter gives an offset into the child list.

Retrieves a single CatalogEntry with specified id.
Returns 403 if the catalog of the catalogEntry is not owned by the current user or not public.


### POST /catalog/entry

**RequestBody: a CatalogEntry object (JSON)**

Creates the posted catalogEntry as a child of the parent CatalogEntry that is specified by parentId at the position specified by indexParent and returns it.
Returns 403 if no user is signed in or if the catalog of the CatalogEntry is not owned by the current user.



### PUT /catalog/entry/$catalogEntryId

**RequestBody: a CatalogEntry object (JSON)**

* **$catalogentryId** long Unique ID of the CatalogEntry

Updates the CatalogEntry, returns 200 and the updated CatalogEntry.
Returns 403 if the catalog of the CatalogEntry is not owned by the current user.
Returns 404 if the entry with the given does not exist.
Returns 422 if the entry cannot be processed.

<details>
<summary>Example for this Query</summary>

**PUT /catalog/entry/$entryId**

```
{
    "id": 535353,
    "catalogId": 13213,
    "arachneEntityId": 1,
    "label": "Updated Testlabel",
    "parentId": 598,
    "indexParent": 1
}
```
</details>


### DELETE /catalog/entry/$catalogEntryId

* **$catalogentryId** long Unique ID of the CatalogEntry

Destroys the CatalogEntry, returns 402.
Does nothing and returns 403 if the catalog of the CatalogEntry is not owned by the current user.


## Book Browser related

### GET /book/$entityId
Gets the book as JSON. Example:

* **$entityId** long Unique ArachneID of the (book's) entity

```
{
  pages:[
    { "img_file":"http://arachne.uni-koeln.de/images/stichwerke/antiquities_of_ionia_1/BOOK-antiquitiesofionia01-0001_196.jpg"}
    { "img_file":"http://arachne.uni-koeln.de/images/stichwerke/antiquities_of_ionia_1/BOOK-antiquitiesofionia01-0002_197.jpg"}
  ]
}
```
### GET /book/$alias

Returns the entity ID of the aliased the (book) entity.

* **$alias** string Unique alias associated with a specific (book) entity

Example:
```
{
  "entityId":15048
}
```


## Administration

### GET /admin/cache
Returns the current backend cache status.


### DELETE /admin/cache
Deletes the backend cache.


### GET /admin/dataimport
Returns the current dataimport status.


### POST /admin/dataimport

**RequestParameter: command** *mandatory*

* command string command to run: **_start_** and **_stop_** are supported.

Issuing one of the supported commands starts or stops the dataimport.
HTTP basic access authentication must be used with an account that has an Arachne UserGroupID of at least 800. The password must be MD5 encrypted.


### GET /info
Gets information about the backend, like the build number of the running instance. 

Response Example:

```
{
  "buildNumber" : "69"
}
```

The build number taken is the one configured in `applicationProperties` as property `buildNumber`. If this property is not defined,
the JSON from `/info` will not contain the `buildNumber` field.

## Data Export

The is no seperate endpoint to generate exports. You use the search or catalog endpoint and append a parameter `mediaType`. If the dataset is small you get the export as a result, if it is bigger an export-task is generated and started and you get a message. 

### GET /export/status

Return the status of running export-tasks.

Response Example:
```
{
	"max_threads": 4,
	"tasks_running": 0,
	"max_stack_size": 10,
	"tasks_enqueued": 0,
	"tasks": {
		"d22149c2-a898-4222-bd33-7f27d5f267f8": {
		    "id": "d22149c2-a898-4222-bd33-7f27d5f267f8",
			"owner": "p.franck",
			"duration": 18302,
			"requestUrl": "http://localhost:8080/data/search?fl=20&q=baum&mediaType=pdf&lang=de",
			"name": "'baum'",
			"created_at": "2018-12-02 12:10:16.16",
			"started_at": "2018-12-02 12:10:16.161",
			"mediaType": "application/pdf",
			"conversionType": "searchResult",
			"stopped_at": "2018-12-02 12:10:34.463",
			"status": "finished"
		}
	}
}

```

### GET /export/types

Returns a list of available export-types.

Response Example:
```
{
    "pdf": "application/pdf",
    "csv": "text/csv",
    "html": "text/html"
}
```

### GET /export/$exportId

Returns the file of export-task with id $exportId and deletes the export-task if the downloader and the tasl-owner are the same.

In case of pdf, the result is base64 encoded.

### POST /export/clean

Aborts all running/pending tasks of the user and removes all finished tasks from the stack completely. 

* **RequestBody: a settings object (JSON) with three optional parameters:**

    * **everyones**: Optional, default: false - If set to true (and user is admin) everyone's tasks are affected not only the user's ones.
    * **outdated**: Optional, default: true - If set to true, only those finished tasks get removed, which are outdated (define in backend-config).   
    * **finished**: Optional, default: true - If set to true, only finished tasks get removed, but running and pending tasks remain untouched. 

Request Examples:

```
{
    "everyones": true,
    "outdated": false,
    "finished":true
}
```

Removes all outdated tasks. Should be done by a chronjob from time to time.

```
{
    "everyones": false,
    "outdated": false,
    "finished": false
}
```

Cleans completely the stack of the current user. Is used by the e2e-tests.


Returns a list of affected Task-Ids.

### POST /export/clean/$exportId

Removes a finished task with $exportId completely and removes the cached output.
Current user have to be the owner of this task or admin. 

### POST /export/cancel/$exportId

Cacnels a running or pending task with $exportId.
Current user have to be the owner of this task or admin.

