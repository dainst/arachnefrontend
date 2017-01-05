# Rest Api Reference

## GET /search

Executes a search. The q-parameter supports the elasticsearch query string "mini-language".

* `RequestParameter: q` _mandatory_, string: The search string
* `RequestParameter: fq` _optional_, string: Facet query string (e.g. facet_kategorie:"bauwerk").
* `RequestParameter: limit` _optional_, int: The maximum number of returned documents. Set this to 0 to retrieve only the number of search hits and facets. Maximum is 1000.
* `RequestParameter: offset` _optional_, int: An offset into the search result. Offsets must be lower than `10000 - limit` for standard searches and are not restricted for 'harvest queries' to allow those queries to be split up or continued after a failure.
* `RequestParameter: fl` _optional_, int: The maximum number of returned facet values. Set this to 0 to get all facet values.
* `RequestParameter: fo` _optional_, int: An offset into the list(s) of facet values.
* `RequestParameter: sort` _optional_, int: The field to sort on.
* `RequestParameter: desc` _optional_, boolean: If the sort should be in descending order.
* `RequestParameter: bbox` _optional_, string: A geospatial bounding box (top-left and buttom-right corner) to filter the results (as comma separated list of values; order: lat lon).
* `RequestParameter: ghprec` _optional_, int: The precision of the geohash used for the geo-grid facet. A value between 1 and 12 (default 5). Cell dimensions at the equator range from 5,009.4km x 4,992.6km (precision 1) down to 3.7cm x 1.9cm (precision 12).
* `RequestParameter: scroll` _optional_, boolean: If true a scrollId will be returned with the result which can be used to scroll through the whole search result via '/search/scroll/$scrollId'. The search context will be available for 1 minute. User must be logged in.
* `RequestParameter: facet` _optional_, string: If specified only the values of this facet will be returned.
* `RequestParameter: editorfields` _optional_, boolean: If the editor fields should be searched and highlighted, too (user must at least have editor rights for this to take effect). The default value is @true@.


