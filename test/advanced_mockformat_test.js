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

function testAdvancedFormatGet(test, path, expectedStatus, expectedMessage, failMessage){
    testAdvancedFormatGetWithHeaders(test, path, {}, expectedStatus, expectedMessage, failMessage);
}

function testAdvancedFormatGetWithHeaders(test, path, headers, expectedStatus, expectedMessage, failMessage){
    test.expect(3);
    http.request({
      path: path,
      method: 'GET',
      port: 8080,
      headers: headers
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(response.statusCode, expectedStatus);
        test.equal(response.headers['content-type'], 'application/json;charset=UTF-8');
        var responseBody = JSON.parse(data);
        test.equal(responseBody.message, expectedMessage, failMessage);
        test.done();
      });
    }).end();
}

function testAdvancedFormatPost(test, path, body, expectedStatus, expectedMessage, failMessage){
    test.expect(3);
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
        test.equal(response.headers['content-type'], 'application/json;charset=UTF-8');
        var responseBody = JSON.parse(data);
        test.equal(responseBody.message, expectedMessage, failMessage);
        test.done();
      });
    });
    //console.log('sent body: ' + body);
    req.write(body);
    req.end();
}

exports.connect_apimock = {
  setUp: function (done) {
    // setup here if necessary
    done();
  },
  empty_file: function(test){
    test.expect(3);
    http.request({
      path: '/api/advanced/emptyfile',
      method: 'GET',
      port: 8080
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(response.statusCode, 200);
        test.equal(response.headers['content-type'], 'application/json;charset=UTF-8');
        var expected = '';
        test.equal(data, expected, 'GET /api/advanced/emptyfile should return an empty string');
        test.done();
      });
    }).end();
  },
  only_defaultresponse: function(test){
    testAdvancedFormatGet(test, 
      '/api/advanced/only_defaultresponse', 
      201, 
      'foofoofoo', 
      'only_defaultresponse should return {"message":"foofoofoo"}');
  },
  only_defaultresponse_no_body: function(test){
    test.expect(3);
    http.request({
      path: '/api/advanced/only_defaultresponse_no_body',
      method: 'GET',
      port: 8080
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(response.statusCode, 201);
        test.equal(response.headers['content-type'], 'application/json;charset=UTF-8');
        var expected = '';
        test.equal(data, expected, 'only_defaultresponse_no_body should return an empty string');
        test.done();
      });
    }).end();
  },
  only_defaultresponse_no_status: function(test){
    testAdvancedFormatGet(test, 
      '/api/advanced/only_defaultresponse_no_status', 
      200, 
      'foofoofoo', 
      'only_defaultresponse_no_status should return default status');
  },


  requestparameter_first_match: function(test){
    testAdvancedFormatGet(test, 
      '/api/advanced/requestparameter?foo=foo', 
      400, 
      'foo', 
      'requestparameter?foo=foo should return {"message":"foo"}');
  },
  requestparameter_second_match: function(test){
    testAdvancedFormatGet(test, 
      '/api/advanced/requestparameter?foo=bar', 
      200, 
      'bar', 
      'requestparameter?foo=bar should return {"message":"bar"}');
  },
  requestparameter_no_match1: function(test){
    testAdvancedFormatGet(test, 
      '/api/advanced/requestparameter?foo=asdf', 
      201, 
      'foofoofoo', 
      'requestparameter?foo=asdf should return {"message":"foofoofoo"}');
  },
  requestparameter_no_match2: function(test){
    testAdvancedFormatGet(test, 
      '/api/advanced/requestparameter?bar=asdf', 
      201, 
      'foofoofoo', 
      'requestparameter?bar=asdf should return {"message":"foofoofoo"}');
  },
  requestparameter_no_defaultresponse_no_match: function(test){
    test.expect(3);
    http.request({
      path: '/api/advanced/requestparameter_no_defaultresponse',
      method: 'GET',
      port: 8080
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(response.statusCode, 500);
        test.equal(response.headers['content-type'], 'application/json;charset=UTF-8');
        var expected = '{"error":"No response could be found"}';
        test.equal(data, expected, 'requestparameter_no_defaultresponse_no_match should return an error');
        test.done();
      });
    }).end();
  },
  requestparameter_no_parameters: function(test){
    testAdvancedFormatGet(test, 
      '/api/advanced/requestparameter_no_parameters', 
      201, 
      'foofoofoo', 
      'requestparameter_no_parameters should return {"message":"foofoofoo"}');
  },



  requestparameters_one_match: function(test){
    testAdvancedFormatGet(test, 
      '/api/advanced/requestparameters?foo=bar', 
      201, 
      'foofoofoo', 
      'requestparameters?foo=bar should return {"message":"foofoofoo"}');
  },
  requestparameters_both_matches: function(test){
    testAdvancedFormatGet(test, 
      '/api/advanced/requestparameters?foo=bar&bar=foo', 
      401, 
      'foobar', 
      'requestparameters?foo=bar&bar=foo should return {"message":"foobar"}');
  },



  bodyparameter_first_match: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameter', 
      '{"foo":"foo"}',
      402, 
      'foo', 
      'bodyparameter {"foo":"foo"} should return {"message":"foo"}');
  },
  bodyparameter_second_match: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameter?foo=bar', 
      '{"foo":"bar"}',
      200, 
      'bar', 
      'bodyparameter {"foo":"bar"} should return {"message":"bar"}');
  },
  bodyparameter_no_match1: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameter', 
      '{"foo":"asdf"}',
      201, 
      'foofoofoo', 
      'bodyparameter {"foo":"asdf"} should return {"message":"foofoofoo"}');
  },
  bodyparameter_no_match2: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameter',
      '{"bar":"asdf"}', 
      201, 
      'foofoofoo', 
      'bodyparameter {"bar":"asdf"} should return {"message":"foofoofoo"}');
  },
  bodyparameter_no_defaultresponse_no_match: function(test){
    test.expect(3);
    var req = http.request({
      path: '/api/advanced/bodyparameter_no_defaultresponse',
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
        test.equal(response.statusCode,500);
        test.equal(response.headers['content-type'], 'application/json;charset=UTF-8');
        var expected = '{"error":"No response could be found"}';
        test.equal(data, expected, 'bodyparameter_no_defaultresponse_no_match should return an error');
        test.done();
      });
    });
    req.write('{"foo":"asdf"}');
    req.end();
  },
  bodyparameter_no_parameters: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameter_no_parameters', 
      '{"foo":"bar"}',
      201, 
      'foofoofoo', 
      'bodyparameter_no_parameters should return {"message":"foofoofoo"}');
  },


  bodyparameter_complex_body_1: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameter_complex_body', 
      '{"user":{"firstname":"Luke","lastname":"Skywalker","address":{"street":"Milkyway","zipcode":"12345"}}, "foo":"foo"}',
      500, 
      'Firstname and lastname matches', 
      'bodyparameter_complex_body should match two parameters on second level');
  },
  bodyparameter_complex_body_2: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameter_complex_body', 
      '{"user":{"firstname":"Luke","lastname":"Macahan","address":{"street":"Milkyway","zipcode":"12345"}}, "foo":"foo"}',
      501, 
      'Firstname matches', 
      'bodyparameter_complex_body should match one parameter on second level');
  },
  bodyparameter_complex_body_3: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameter_complex_body', 
      '{"user":{"firstname":"Zeb","lastname":"Macahan","address":{"street":"The wild west","zipcode":"55555"}}, "foo":"foo"}',
      502, 
      'zipcode matches', 
      'bodyparameter_complex_body should match one parameter on third level');
  },
  bodyparameter_complex_body_4: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameter_complex_body', 
      '{"user":{"firstname":"Zeb","lastname":"Macahan","address":{"street":"The wild west","zipcode":"12345"}}, "foo":"bar"}',
      503, 
      'foo matches', 
      'bodyparameter_complex_body should match one parameter on first level');
  },
  bodyparameter_complex_body_5: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameter_complex_body', 
      '{"foo":"bar"}',
      503, 
      'foo matches', 
      'bodyparameter_complex_body should handle a request that do not contain the mock parameters');
  },


  bodyparameters_one_match: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameters', 
      '{"foo":"bar"}',
      201, 
      'foofoofoo', 
      'bodyparameters {"foo":"bar"} should return {"message":"foofoofoo"}');
  },
  bodyparameters_both_matches: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/bodyparameters', 
      '{"foo":"bar","bar":"foo"}',
      403, 
      'foobar', 
      'bodyparameters {"foo":"bar","bar":"foo"} should return {"message":"foobar"}');
  },




  requestparameter_bodyparameter_request_match: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/requestparameter_bodyparameter?foo=bar', 
      '{"asdf":"asdf"}',
      201, 
      'foofoofoo', 
      'should return {"message":"foofoofoo"}');
  },
  requestparameter_bodyparameter_body_match: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/requestparameter_bodyparameter?asdf=asdf', 
      '{"bar":"foo"}',
      201, 
      'foofoofoo', 
      'should return {"message":"foofoofoo"}');
  },
  requestparameter_bodyparameter_both_match: function(test){
    testAdvancedFormatPost(test, 
      '/api/advanced/requestparameter_bodyparameter?foo=bar', 
      '{"bar":"foo"}',
      404, 
      'foobar', 
      'should return {"message":"foobar"}');
  },



  requestheaders_one_of_two_matches: function(test) {
    testAdvancedFormatGetWithHeaders(test,
      '/api/advanced/requestheaders',
      {
        header1: 'one',
        header2: '2'
      },
      201,
      'foofoofoo',
      'requestheaders should return {"message": "foofoofoo"}');
  },
  requestheaders_both_matches: function(test) {
    testAdvancedFormatGetWithHeaders(test,
      '/api/advanced/requestheaders',
      {
        header1: 'one',
        header2: 'two'
      },
      401,
      'foobar',
      'requestheaders should return {"message": "foobar"}');
  },
  requestheaders_two_of_three_matches: function(test) {
    testAdvancedFormatGetWithHeaders(test,
      '/api/advanced/requestheaders',
      {
        header1: 'one',
        header2: 'two',
        header3: 'three'
      },
      401,
      'foobar',
      'requestheaders should return {"message": "foobar"}');
  },



  malformedfile: function(test){
    test.expect(3);
    http.request({
      path: '/api/advanced/malformedfile',
      method: 'GET',
      port: 8080
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(response.statusCode, 500);
        test.equal(response.headers['content-type'], 'application/json;charset=UTF-8');
        var expected = '{"error":"Malformed mockfile. See server log"}';
        test.equal(data, expected, 'malformedfile should return an error');
        test.done();
      });
    }).end();
  },
  malformed_inputbody: function(test){
    test.expect(3);
    var req = http.request({
      path: '/api/advanced/bodyparameter',
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
        test.equal(response.statusCode,500);
        test.equal(response.headers['content-type'], 'application/json;charset=UTF-8');
        var expected = '{"error":"Malformed input body"}';
        test.equal(data, expected, 'malformed_inputbody should return an error');
        test.done();
      });
    });
    req.write('{');
    req.end();
  }
  
};
