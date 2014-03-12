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

##Angular JS Files
--- 

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



---

# Sample Markdown

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod.

## Text basics

This is *italic* and this is **bold**.  Another _italic_ and another __bold__.

> __Here is some quotation__. Lorem ipsum dolor sit amet, consectetur
> adipisicing elit, sed do eiusmod tempor incididunt ut labore et
> dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.

## Links

This is an [example inline link](http://example.com/) and [another one with a title](http://example.com/ "Hello, world"). And [another][someref] one.

## Code

This is inline code: `some code here`.

    <script>
        document.location = 'http://example.com/?q=markdown+cheat+sheet';
    </script>
```java
public class HelloWorld {
   public static void main(String[] args) {
       System.out.println("Hello, world!");
   }
}
```

[someref]: http://example.com "rich web apps"
[MarkdownREF]: http://daringfireball.net/projects/markdown/basics
[gfm]: http://github.github.com/github-flavored-markdown/