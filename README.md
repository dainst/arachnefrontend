# Arachne 4 Frontend     

## Development

The repository includes a [gulp](http://gulpjs.com/) configuration for setting up a local server, preconfigured with:
* proxying to the backend running on the development server
* url rewriting for AngularJS' HTML5 mode
* live reloading

### Prerequisites

You need the following components in order for the local server to work:
* [NodeJS](https://nodejs.org/)
* [gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)

To install the necessary dependencies for the app run the following command in the working directory:
```
npm install
```

On Debian-based systems, if you have trouble installing dependencies use the 'nodejs-legacy'-package instead of 'nodejs'. Also gulp needs to be installed globally to run 'gulp server'.

```
sudo apt-get install nodejs-legacy
sudo npm install -g gulp
```

### Running the tests

To run the unit tests, call

```bash
npm run tests
```

This will run all tests matching the filename pattern test/*_spec.js. Jasmine is used as the testing framework here.

### con10t submodule

The static files representing the project pages are stored in the directory `con10t`. 

In order to set up con10t you have to run the following commands after the initial checkout:

```
cd (this-repo)
git clone https://github.com/dainst/con10t.git
```

Subsequent updates can be loaded by running `git pull origin master` inside the directory `con10t`.

#### Updating the submodule con10t

Within the folder of the submodule execute
```
git pull origin master
```
to get the latest con10t version.

### Running the development server

In order to run the frontend in the development server use the following command:
```
npm start
```

After that you should be able to access the frontend under [http://localhost:8082/](http://localhost:8082/).

Any changes made to HTML, SCSS or JS files should automatically trigger a browser reload.

## Deployment

Build the application by running

```
npm run build
```

In order for AngularJS' HTML5 mode to work use the following configurations:

### nginx
```
server {
        listen   80;
        root /usr/share/nginx/www;
        try_files $uri $uri/ /index.html =404;
}
```

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
