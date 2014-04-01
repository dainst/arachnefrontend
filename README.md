
# Arachne 4 Frontend

### nginx config/installation 
(for html5 mode)
#### nginx-site config
```
server {
        listen   80;

        root /usr/share/nginx/www;
        try_files $uri $uri/ /index.html =404;
}
```
#### index.html (into header) 
```
<base href="/">
```
####app.js
select the right backend url in arachneSettings-object
---
### Bookmarks
## Entity-Bookmark:
* Bookmark erstellen & einer Liste hinzufügen
* Bookmark löschen
* Bookmark erstellen & (einer neuen Liste hinzufügen)

## Bookmarks-Site
* Bookmark-Liste hinzufügen
* Bookmark-Liste löschen
* Bookmark-Liste editieren 
* Einzelne Bookmarks Editieren & löschen

## Depencies
 * leaflet -> http://tombatossals.github.io/angular-leaflet-directive/#!/


##Index.html
 * Fügt Bootstrap ein
 * startet AngularJS  `ng-app="myApp"`
 * Fügt die navbar ein
 * Setzt mit ng-view den Platz für die einzelnen Seiten (siehe app.js routing)

### CSS
## GridSystem
* Die normale __row__ benutzen wir paraktisch um alles herum was Spalten (col-md-?) hat. Eine normale row-class hat margin-top: 10px;. Eine fullscreenrow-class hat margin-top:0px.  Wenn es eine fullscreen-anwendung (wie bspw. map) gibt benutzt man beide um das row-margin zu überschreiben.

##Angular 
---

## Allgemeines
 * Du kannst keine Bindings auf Variablen aus Services oder Factories machen! Siehe http://stackoverflow.com/questions/16023451/binding-variables-from-service-factory-to-controllers  

##app.js
 * legt in erster linie das Routing fest
 * Über die URL öffnet sich ein html Dokument (partials ordner) in der ng-view
 * die Start Seite `/` ruft die _startSite.html_ auf
 * mit `/entity/:id?` wird eine entity über _entity.html_ angezeigt
 * mit `/search/:params?` wird die Suche über _search.html_ angezeigt

##controllers.js
 * legt unsere Controller fest
 * für jede Seite wird ein Controller aufgerufen
 * die _startSite.html_ ruft den `newsController` auf
 * die _entity.html_  ruft den `EntityCtrl` auf
 * die _search.html_ ruft die `SearchCtrl` auf

##directives.js
 * inline Anweisungen für die Seite
 * mit `errSrc` werden nicht vorhandene Bilder durch ein ersatz Bild ausgetauscht
 * mit `imagesrow` werden Bilder in der _search.html_ auf die richtige Größe getrimmt

##filters.js
 * filter für einzelne Anweisungen
 * mit `i18n` wird direkt die richtige Sprache für das Wort angezeigt

##services.js
 * schickt unsere Anfragen an das Backend
 
---