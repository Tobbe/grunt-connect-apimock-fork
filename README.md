# grunt-connect-apimock

> A middleware for the grunt-contrib-connect plugin that mocks a REST api with json-files from the filesystem. Makes it easy to develop and test your client code independent of the server.

The mocked api consistst of a number of json-files in a directory structure that represents the api.

E.g. with this configuration {url:'/myApp/api/', dir:'mymockdirectory'}, then apimock works like this:

GET `/myApp/api/users` uses the file `mymockdirectory/users.json`

POST `/myApp/api/users` uses the file `mymockdirectory/users_post.json`

GET `/myApp/api/users/1` uses the file `mymockdirectory/users/1.json`

PUT `/myApp/api/users/1` uses the file `mymockdirectory/users/1_put.json`

DELETE `/myApp/api/users/1` uses the file `mymockdirectory/users/1_delete.json`

The format of the json-files can be in a simple or an advanced format. When using the simple format, the file content will be returned as the body of the response and http-status 200. When using the advanced format, it is possible to specify different responses and different http-status depending on the request parameters, body parameters, and/or the headers of the request.

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-connect-apimock --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-connect-apimock');
```

## Configuration

E.g. I have a REST-api on the url:s /myApp/api/users, /myApp/api/products etc. And I want to mock this api with json-files in the directories mymockdirectory/users, mymockdirectory/products.

### Configuring the "connect" task to use apimock

In your project's Gruntfile, add a section named `apimock` to your existing connect definition. And add the middleware call from the connect option middleware hook.

```js
grunt.initConfig({
    connect: {
      options: {
            port: 8000,
            hostname: 'localhost',
            middleware: function (connect) {
                var middlewares = [];
                //add the apimock middleware to connect
                middlewares.push(require('grunt-connect-apimock/lib/apimock').mockRequest);
                return middlewares;
            }
      },
      apimock: {
        //apimock configuration
        url: '/myApp/api/',
        dir: 'mymockdirectory'
      }
    }

  });
```

### Adding the configureApimock task to the serve task

For the serve task, add the configureApimock task before the connect task.

```js
grunt.registerTask('serve', ['configureApimock', 'connect', 'watch']);
```

For multi-server configuration, see that section below.

### apimock config parameters

#### apimock.url
Type: `String`

The beginning of the url for your REST-api that you want to mock.

#### apimock.dir
Type: `String`

The directorypath where your json-files for the apimock is located. The location is relative to the Gruntfile.js.




## json-file format
The json-files can be written in a simple or an advanced format. 

Use the simple format if it is ok to get the same response body and HTTP-status 200 for any request data.

If you need to get different responses or HTTP-status depending on the request parameters, the request body and/or the request headers you need to use the advanced format.

### Simple format
This is simple. The content of the file will be returned as the body of the response. With HTTP-status 200.

### Advanced format
The apimock will switch to advanced format if the json object in the file has the variable "responses"
or/and the variable "defaultResponse" on the root level that is != undefined. If none of the variables are defined. Then the content is considered as simple format.

#### defaultResponse
Type: `Object`
Required: yes

The default response that will be retured if none of the requests in the responses array matches.

#### defaultResponse.status
Type: `Number`
Required: no
Default value: 200

The HTTP-status.

#### defaultResponse.body
Type: `Object`
Required: yes

The response body.


#### responses
Type: `Array`
Required: no

An array of objects that contains the required request and the response that will be returned.

#### responses.request
Type: `Object`
Required: yes

Describing the matching criteria.

#### responses.request.parameters
Type: `Object`
Required: no

Names and values of the request parametes that needs to be matched for this response.

#### responses.request.headers
Type: `Object`
Required: no

Names and values of the request headers that needs to be matched for this response.

#### responses.request.body
Type: `Object`
Required: no

Names and values of the request body parametes that needs to be matched for this response.

#### responses.response
Type: `Object`
Required: yes

Describing the response that will be retured if the request matches.

#### responses.response.status
Type: `Number`
Required: no
Default value: 200

The HTTP-status.

#### responses.response.body
Type: `Object`
Required: yes

The response body.



### Examples

Different responses depending on the request parameters:

```
{
  "responses":[
    {
      "request":{
        "parameters":{
          "foo":"bar",
          "bar":"foo"
        }
      },
      "response":{
        "status":401,
        "body":{
          "message":"Two parameters matches"
        }
      }
    },
    {
      "request":{
        "parameters":{
          "foo":"bar"
        }
      },
      "response":{
        "status":402,
        "body":{
          "message":"One parameter matches"
        }
      }
    }
  ],
  "defaultResponse":{
    "status":201,
    "body":{
      "message":"Nothing matches. Default response"
    }
  }
}
```

Different responses depending on the request body:

```
{
  "responses":[
    {
      "request":{
        "body":{
          "user":{"firstname":"Luke", "lastname":"Skywalker"}
        }
      },
      "response":{
        "status":403,
        "body":{
          "message":"Two body parameters matches"
        }
      }
    },
    {
      "request":{
        "body":{
          "foo":"bar"
        }
      },
      "response":{
        "status":404,
        "body":{
          "message":"One body parameter matches"
        }
      }
    }
  ],
  "defaultResponse":{
    "status":201,
    "body":{
      "message":"Nothing matches. Default response"
    }
  }
}
```

A combination of request parameter and request body

```
{
  "responses":[
    {
      "request":{
        "parameters":{
          "foo":"bar"
        },
        "body":{
          "bar":"foo"
        }
      },
      "response":{
        "status":400,
        "body":{
          "message":"Both parameter and body matches"
        }
      }
    }
  ],
  "defaultResponse":{
    "status":201,
    "body":{
      "message":"Nothing matches. Default response"
    }
  }
}
```

For more examples see the tests in test/



## Multi-server configuration
grunt-contrib-connect multi-server configuration is supported. You can make a config of apimock that is common to all server configurations. Or make a config that is specific to one server configuration.

In this example `grunt serve` will listen to port 8000 and serve api files from mymockdirectory.

`grunt serve2` will listen to port 8080 and serve api files from mymockdirectory.

`grunt serve3` will listen to port 8080 and serve api files from someOtherDirectory.

```js
grunt.initConfig({
    connect: {
      options: {
            port: 8000,
            hostname: 'localhost',
            middleware: function (connect) {
                var middlewares = [];
                //add the apimock middleware to connect
                middlewares.push(require('grunt-connect-apimock/lib/apimock').mockRequest);
                return middlewares;
            }
      },
      apimock: {
        //apimock configuration
        url: '/myApp/api/',
        dir: 'mymockdirectory'
      },
      server1: {
          options:{
          }
      },
      server2: {
          options:{
            port: 8080
          }
      },
      server3: {
          apimock: {
            url: '/myApp/api/',
            dir: 'someOtherDirectory'
          },
          options:{
            port: 8080
          }
      }
    }
});

grunt.registerTask('serve', ['configureApimock', 'connect:server1', 'watch']);
grunt.registerTask('serve2', ['configureApimock', 'connect:server2', 'watch']);
grunt.registerTask('serve3', ['configureApimock:server3', 'connect:server3', 'watch']);
```



## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* 0.1.0 Initial release

## License
Copyright (c) 2015 Lars Johansson. Licensed under the MIT license.
