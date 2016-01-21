//Connect middleware for mocking a REST api.
//The mocked api consistst of a number of json-files in a directory structure that represents the api.
//
//E.g with this configuration config({url:'/myApp/api', dir:'./api'}), then apimock works like this:
//GET /myApp/api/users returns the file ./api/users.json
//GET /myApp/api/users/1 returns the file ./api/users/1.json
//PUT /myApp/api/users/1 returns the file ./api/users/1_put.json
//POST /myApp/api/users returns the file ./api/users_post.json

var fs = require('fs');
var path = require('path');
var url = require('url');

var mockurl, mockdir;
var defaultStatus = 200;
var defaultContentType = 'application/json;charset=UTF-8';

module.exports = {
    config: function(options){
        mockurl = options.url;
        mockdir = path.join(process.cwd(), options.dir);
        console.log('Mocking api calls from: ' + mockurl);
        console.log('to: ' + mockdir);
    },

    mockRequest: function(req, res, next){
        if(req.url.indexOf(mockurl)===0){
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            var filepath = createFilepath(req);
            if(fs.existsSync(filepath)){

                var fileContent = fs.readFileSync(filepath, {encoding: 'utf8'});
                if(fileContent.length === 0){
                    //empty file
                    res.writeHead(defaultStatus, {'Content-Type': defaultContentType});
                    res.end();
                }
                else{
                    var mockdata;
                    try{
                        mockdata = JSON.parse(fileContent);
                    }
                    catch(err){
                        console.error('Malformed file: ' + filepath);
                        mockdata = {defaultResponse:{status:500,body:{error:'Malformed mockfile. See server log'}}};
                    }
                    if(mockdata.responses === undefined && mockdata.defaultResponse === undefined){
                        simpleMockformat(res, filepath);
                    }
                    else {
                        advancedMockformat(req, res, mockdata);
                    }
                }
            }
            else{
                console.error('Can not find ' + filepath);
                var response = {status:500,body:{error:'Can not find mockfile. See server log'}};
                respondData(res, response);
            }
        }
        else{
            next();
        }
    }
};

function createFilepath(req){
    var filepath = req.url;
    //remove mockurl beginning
    filepath = filepath.substring(mockurl.length);
    //remove trailing /
    if(filepath.indexOf("/", filepath.length - 1) !== -1) {
        filepath = filepath.substring(0, filepath.length -1);
    }
    //remove parameters
    var questionMarkPos = filepath.indexOf("?");
    if(questionMarkPos !== -1) {
        filepath = filepath.substring(0, questionMarkPos);
    }
    //add method if not GET
    if(req.method !== 'GET') {
        filepath = filepath+"_" + req.method.toLowerCase();
        //config.method = 'GET';
    }
    //add .json
    if(filepath.indexOf(".") === -1) {
        filepath += ".json";
    }
    filepath = path.join(mockdir, filepath);
    return filepath;
}

function simpleMockformat(res, filepath){
    res.writeHead(defaultStatus, {'Content-Type': defaultContentType});
    var filestream = fs.createReadStream(filepath);
    filestream.pipe(res);
}

function advancedMockformat(req, res, mockdata){
    var requestparameters = url.parse(req.url, true).query;
    var bodyParameters = {};
    var body = '';
    req.on('data', function(chunk){
        body += chunk;
    });
    req.on('end', function(){
        var parseError = false;
        try{
            if(body.length > 0){
                bodyParameters =JSON.parse(body);
            }
        }
        catch(err){
            parseError = true;
        }
        var response;
        if(parseError){
            console.error('Malformed input body. url: ' + req.url);
            response = {status:500,body:{error:'Malformed input body'}};
        }
        else{
            response = selectResponse(res, mockdata, requestparameters, bodyParameters);
        }
        respondData(res, response);
    });
}

function respondData(res, response){
    if(response){
        var status = defaultStatus;
        if(response.status){
            status = response.status;
        }
        var body = '';
        if(response.body){
            body = JSON.stringify(response.body);
        }
        res.writeHead(status, {'Content-Type': defaultContentType});
        res.write(body);
        res.end();
    }
    else{
        console.error('No response could be found');
        res.writeHead(500, {'Content-Type': defaultContentType});
        res.write('{"error":"No response could be found"}');
        res.end();
    }
}

function selectResponse(res, mockdata, requestparameters, bodyParameters){
    var mockresponses = mockdata.responses;
    var selectedResponse;
    if(mockresponses){
        for(var i = 0; i < mockresponses.length && selectedResponse === undefined; i++){
            //iterate over mockresponses
            var mockresponse = mockresponses[i];
            var parametersMatch = false;
            if(mockresponse.request.parameters !== undefined && mockresponse.request.body === undefined){
                //match only parameters
                if(matchParameters(requestparameters, mockresponse.request.parameters)){
                    selectedResponse = mockresponse.response;
                }
            }
            else if(mockresponse.request.parameters === undefined && mockresponse.request.body !== undefined){
                //match only body
                if(matchParameters(bodyParameters, mockresponse.request.body)){
                    selectedResponse = mockresponse.response;
                }
            }
            else if(mockresponse.request.parameters !== undefined && mockresponse.request.body !== undefined){
                //match both parameters and body
                if(matchParameters(requestparameters, mockresponse.request.parameters) &&
                    matchParameters(bodyParameters, mockresponse.request.body)){
                    selectedResponse = mockresponse.response;
                }
            }
        }
    }

    if(selectedResponse === undefined ) {
        selectedResponse = mockdata.defaultResponse;
    }
    return selectedResponse;
}

function matchParameters(incomingParameters, mockParameters){
    var numberOfParameters = 0;
    var matches = 0;
    if(incomingParameters && mockParameters){
        for (var key in mockParameters) {
            //Iterate through object properties
            if (mockParameters.hasOwnProperty(key)) {
                numberOfParameters ++;
                if(typeof mockParameters[key] === 'object'){
                    //is object, match on next level
                    if(matchParameters(incomingParameters[key], mockParameters[key])){
                        matches++;
                    }
                }
                else{
                    //is primitive
                    if(mockParameters[key] === incomingParameters[key]){
                        matches ++;
                    }
                }
            }
        }
    }
    return numberOfParameters > 0 && matches === numberOfParameters;
}