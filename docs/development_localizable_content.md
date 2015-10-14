# Static Content

Arachne frontend at the moment contains two resources from which it provides static content.
The folder "info" contains the material for the links of the navigation bar and the footer
section, "con10t" (which is a separate git repository) contains the projects, reachable
from the projects overview page.

The links from the navigation bar and footer route to /info/[title].html. Following this route
the content from the "info" folders language sub directories are served. The links from the projects page route
to /project/[title].html. This route serves content from the "con10t" language folders.

The content is localized using the content localization system of idai-components (docs found under i18n if the sample app gets executed). The organization principle (basically the content.json) described there is used, and
is enhanced here by using a certain directory structure in which the different language specific version of 
content (html) is stored.

Note that the projects overview page also gets localized and 
generated from the data structure at con10t/content.json.

## Organization of static content

As described in idai-components documentation, a content file is named content.json. In our case, we have
info/content.json and con10t/content.json. In addition to this and in order for the localization system to
work properly, files containing the actual content need to be organized in the following manner:

1. Every content, identified by its id, must at least be present in german (de).
1. There should be a html named de/id.html and a corresponding node in content.json.
1. For each additional language a html should be placed in the language folder and a title entry should be added to
  the corresponding node.

**Note 1** : The language selection gets performed for each item individually. If the user is italian for example,
and a certain page is available in italian, it will be served in italian, while another item is served in english or
german, depending on which language the item is present. There is a link to the actual language selection rule
in the [Artifacts](#artifacts) section.

**Note 2** : Only "short" forms of language identifiers are usable within the localization system. For example "de", but not
"de-AT" or "de-DE".

**Note 3** : Localization of other items, like user interface messages, texts, other menu items, facets etc. is not handled by the system under discussion here.

**Note 4** : For development purposes, content available on the file system but not configured via content.json can be accessed exclicitely via */[static|con10t]/[title]?lang=[lang]*. If the ?lang=[lang] part is omitted, the content from the "de" directory gets delivered. In both cases the requested content should be present on the file system. The system shows a blank view if it can't find the corresponding html file.

## Artifacts

Here are the main artifacts comprising the content / localization system:

1. Projects Page [specification](feature_localization_con10t.md)
1. Content Delivery [specification](feature_localization.md)
1. The content delivery [code](../js/controllers/static_content.js)
1. The projects overview [code](../js/controllers/projects.js)
