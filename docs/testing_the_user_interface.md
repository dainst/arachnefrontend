Asides from unit testing we make use of [Protractor](https://angular.github.io/protractor/#/) and [httParrot](https://github.com/danielmarreirosdeoliveira/httParrot) and Jasmine to perform some basic UI testing.

To set up the testing stack, you need to perform the following steps, each one in its own terminal tab:

1\. Run the Selenium server, which will handle the requests to the browser (currently Chrome) 

```bash
webdriver-manager start
```

It will run on port 4444.

2\. Run the httParrot server, which will mock the backend and will be configured from within the tests

```bash
cd lib/httParrot
node httParrot.js
```

It will run on port 1236.

3\. Run the (AngularJS) application under test itself by calling

```bash
grunt server
````

It will run on port 1234.

4\. Run the tests

```bash
protractor config/protractor.conf.js
```


