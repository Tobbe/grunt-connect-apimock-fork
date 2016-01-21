'use strict';

var grunt = require('grunt');
var http = require('http');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/


function testAdvancedFormatPost(test, path, body, expectedStatus, expectedMessage){
    test.expect(2);
    var req = http.request({
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      port: 8080
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(response.statusCode, expectedStatus);
        var responseBody = JSON.parse(data);
        test.equal(responseBody.message, expectedMessage);
        test.done();
      });
    });
    req.write(body);
    req.end();
}

exports.connect_apimock = {
  setUp: function (done) {
    // setup here if necessary
    done();
  },

  nothing_matches: function(test){
    testAdvancedFormatPost(test, 
      '/api/examplefile', 
      '',
      201, 
      'Nothing matches. Default response');
  },

  one_requestparameter_matches: function(test){
    testAdvancedFormatPost(test, 
      '/api/examplefile?foo=bar', 
      '',
      402, 
      'One parameter matches');
  },

  two_requestparameters_matches: function(test){
    testAdvancedFormatPost(test, 
      '/api/examplefile?foo=bar&bar=foo', 
      '',
      401, 
      'Two parameters matches');
  },

  one_bodyparameter_matches: function(test){
    testAdvancedFormatPost(test, 
      '/api/examplefile', 
      '{"foo":"foo"}',
      404, 
      'One body parameter matches');
  },

  two_bodyparameters_matches: function(test){
    testAdvancedFormatPost(test, 
      '/api/examplefile', 
      '{"user":{"firstname":"Luke","lastname":"Skywalker"}}',
      403, 
      'Two body parameters matches');
  },

  requestparameter_and_bodyparameter_matches: function(test){
    testAdvancedFormatPost(test, 
      '/api/examplefile?foo=bar', 
      '{"bar":"foo"}',
      400, 
      'Both parameter and body matches');
  },

  default_status: function(test){
    testAdvancedFormatPost(test, 
      '/api/examplefile', 
      '{"foo":"bar"}',
      200, 
      'One body parameter matches. Default status');
  }
  
};
