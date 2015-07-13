# Localizable Static Content

Arachne frontend at the moment contains two resources from which it provides static content.
The folder "static" contains the material for the links of the navigation bar and the footer
section, "con10t" (which is a separate git repository) contains the projects, reachable
from the projects overview page.

The links from the navigation bar and footer route to /info/[title].html. Following this route
the content from the "static" folders language sub directories are served. The links from the projects page route
to /project/[title].html. This route serves content from the "con10t" language folders.

The contents can be localized, which means, the language in which the link titles are visible and
in which the content is delivered, is
 automatically determined by the system. This is explained in the paragraph on
 [Automatic Localization](#Automatic\ Localization).
But first lets have a look on the basic data structure and folder layout for localizable static content.

## Data and Content Structure

The links from the footer and navigation bar section are directly generated from the contents
of static/content.json. The links from the project overview get generated from
con10t/content.json.

The following excerpt shows a valid example of such a data structure:

```json
{
	"children": [
	{
		"id": "navbar",
		"children":[{
			"id": "about",
			"title": {
				"de": "Über Arachne",
				"en": "About Arachne"
			}
		},
	      ...
```

A few things to note:

1. There must be exactly one root node.
1. The identifiers must be unique.
1. Each node can have and array of nodes as children.
1. Each node can have the id and title fields, which make are the precondition for localization.
1. The structure itself and the program code is of recursive nature, so nodes can theoretically be nested infinitely.\
 Practically the nesting is limited due to practical concerns. (See artifacts using the core localization system\
 in section [artifacts](#Artifacts))


The directory structure of a content dir matching the json example from the top
of the page is as follows:

```
static/content.json
static/de/about.html
static/en/about.html
```

Again, a few things to note:

1. "about" corresponds to an identifier of a node in content.json.
1. The de/about.html and en/about.html files correspond to german / english versions of the same content.
1. The file system structure does not reflect the nesting. This is no problem since the identifiers are required \
  to be unique.

## Automatic Localization

The system is able to automatically determine a suitable language for links and contents. The selection is performed
 based on a rule, taking into consideration the browsers primary language and the availability of the language for
 items.

From a usage or content management perspective it is important to make follow some guidelines for the system to behave
properly as far as localization concerns:

1. Every content, identified by its id, must at least be present in german (de).
1. There should be a html named de/id.html and a corresponding node in content.json.
1. For each additional language a html should be placed in the language folder and a title entry should be added to \
  the corresponding node.

**Note** that the language selection gets performed for each item individually. If the user is italian for example,
and a certain page is available in italian, it will be served in italian, while another item is served in english or
german, depending on which language the item is present. There is a link to the actual language selection rule
in the [Artifacts](#Artifacts) section.

## Artifacts

Here are the main artifacts comprising the content / localization system:

1. The language selection rule [specification](feature_localization_con10t.md)
1. The language selection rule [code](../js/services_language_selection.js)
1. The data structure handling [code](../js/services_localized_content.js)
1. The browsers language determination [code](../js/services_language.js)

Here are further artifacts using the core components:

1. The content delivery [code](../js/controllers_static_content.js)
1. The navbar [code](../js/directives_navbar.js)
1. The footer [code](../js/directives_footer.js)
1. The projects overview [code](../js/controllers_projects.js)
