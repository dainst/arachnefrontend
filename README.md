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

To install the necessary dependencies for the app run the following command in the working directory:
```
npm install
npm install -g bower
bower install
```

To install the testing tools run

```
npm install -g karma
npm install -g karma-jasmine
npm install -g karma-ng-html2js-preprocessor
npm install -g karma@canary phantomjs karma-phantomjs-launcher
npm install -g protractor
webdriver-manager update
```

You may need root permissions on your machine in order to perform these commands successfully.

On Debian-based systems, if you have trouble installing dependencies use the 'nodejs-legacy'-package instead of 'nodejs'. Also the grunt-cli needs to be installed globally to run 'grunt server'.

```
sudo apt-get install nodejs-legacy
sudo npm install -g grunt-cli
```

### Running the tests

Two types of tests are supported at the moment. User Interface (UI) and unit tests. To run the unit tests, call

```bash
karma start test/karma.conf.js
```

which will run all tests matching the filename pattern test/*_spec.js. Jasmine is used as the testing framework here.

The somewhat more complex test setup for e2e testing is described [here](docs/development_e2e_testing.md).

### con10t submodule

The static files representing the project pages are stored in the directory `con10t`. The repository comes preconfigured with the Arachne project pages configured as a git submodule.

In order to set up the submodule you have to run the following commands after the initial checkout:
```
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
