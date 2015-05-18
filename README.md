# Arachne 4 Frontend

## Development

The repository includes a [grunt](http://gruntjs.com/) configuration for setting up a local server, preconfigured with:
* proxying to the backend running on the development server
* url rewriting for AngularJS' HTML5 mode
* live reloading

### Prerequisites

You need the following components in order for the local server to work:
* [NodeJS](https://nodejs.org/download/)
* [Grunt](http://gruntjs.com/getting-started)

To install the necessary dependencies run the following command in the working directory:
```
npm install
```

### Project sites submodule

The static files representing the project pages are stored in the directory `con10t`. The repository comes preconfigured with the Arachne project pages configured as a git submodule.

In order to setup the submodule you have to run the following commands after the initial checkout:
```
cd con10t
git submodule init
git submodule update
```

Subsequent updates can be loaded by running `git pull` inside the directory `con10t`.

### Running the development server

In order to run the frontend in the development server use the following command:
```
grunt server
```

After that you should be able to access the frontend under [http://localhost:1234/](http://localhost:1234/).

Any changes made to HTML, CSS or JS files should automatically trigger a browser reload.


## Deployment

In order for AngularJS' HTML5 mode to work the use the following configurations:

### nginx
```
server {
        listen   80;
        root /usr/share/nginx/www;
        try_files $uri $uri/ /index.html =404;
}
```

The string `try_files $uri $uri/ /index.html =404;` means that now all non-existent urls will be forwarded to index.html file, but without rewriting url in the browser address bar.

### Apache

```
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond $1#%{REQUEST_URI} ([^#]*)#(.*)\1$
	RewriteRule ^(.*)$ %2index.html [QSA,L]
</IfModule>
```