# Arachne 4 Frontend   
  
## tl;dr
Use the following command to get your local instance of the Arachne 4 Frontend running after checking out this repository:
```
npm install && npm run build && npm start
```

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

### Deployment

Build the application by running

```
npm run build
```

### con10t submodule

The static files representing the project pages are stored in the directory `con10t`.

The `con10t`-repository (https://github.com/dainst/con10t) is automatically checked out when building Arachne 4 Frontend with "npm run build" if the con10t-folder doesn't already exist.

#### Updating the submodule con10t

Within the folder of the submodule execute
```
git pull origin master
```
to get the latest con10t version.

### Configurating the Development Server

The Arachne 4 Frontend uses the development server configured in the config file template "dev-config.json.template" in the folder "/config".
  
Change the template if you want to use another server than the default development server.

When running "npm run build", the template file "/config/dev-config.json.template" get's initially copied to "/config/dev-config.json".

In each run of "npm run build", the script checks if "dev-config.js" exists. If it doesn't exist, the template file will be copied and renamed to "dev-config.js". If "dev-config.js" already exists, the file won't be overwritten.

### Running the development server

In order to run the frontend in the development server use the following command after building the Arachne 4 Frontend:

```
npm start
```

After that you should be able to access the frontend under [http://localhost:8082/](http://localhost:8082/).

Any changes made to HTML, SCSS or JS files automatically trigger a browser reload.

### Running the tests

To run the unit tests, call

```bash
npm test
```

This will run all tests matching the filename pattern `test/*_spec.js`. Jasmine is used as the testing framework here.

Call

```
npm run e2e
```

to run the e2e tests matching the filename pattern `e2e/*.spec.js`. Precondition for this to work is that you have the `dist` dir that gets served at `localhost:8082`, as is the case when you run `npm start`.

### Server Configuration

In order for AngularJS' HTML5 mode to work use the following configurations:

#### nginx
```
server {
        listen   80;
        root /usr/share/nginx/www;
        try_files $uri $uri/ /index.html =404;
}
```

#### Apache

```
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond $1#%{REQUEST_URI} ([^#]*)#(.*)\1$
	RewriteRule ^(.*)$ %2index.html [QSA,L]
</IfModule>
```
