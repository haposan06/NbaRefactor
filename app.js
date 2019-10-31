'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var bodyParser  = require('body-parser');
var errorhandler = require('errorhandler');
var http        = require('http');
var path        = require('path');
var request     = require('request');
var routes      = require('./routes/index');
var activity    = require('./routes/activity');
var fs          = require('fs');

const logging = (req, res, next) => {

  let cb = (a,b) => {} 
  let log = {
    body: req.body,
    headers: req.headers,
    rawHeaders: req.rawHeaders,
    method: req.method,
    url: req.url,
    params: req.params
  }
  fs.appendFile("./logs/jsLogs.txt", JSON.stringify(log) + "\r\n", cb)
  next();
}

// EXPRESS CONFIGURATION
var app = express();

var dateNow = Date.now();

console.log('IN APP.JS - >' + dateNow);

// Configure Express
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// comment it this line in Production because it cause performance disruption
app.use(logging)


app.use(bodyParser.raw({type: 'application/jwt'}));
console.log('Directory Name - > ' + __dirname);
app.use('/nba', express.static(path.join(__dirname, 'nba')));
console.log('Joined Path - >' + path.join(__dirname, 'nba'));
//app.use(express.static(path.join(__dirname, 'nba')));
//

// Express in Development Mode
if ('development' == app.get('env')) {
  console.log('AKS-NBA express in development');
  app.use(errorhandler());
}


//logs
app.get('/nba/logs/jsLogs.txt', routes.logs);
//Post Methods

// Custom Routes for MC
app.post('/nba/journeybuilder/save/', activity.save);
app.post('/nba/journeybuilder/validate/', activity.validate );
app.post('/nba/journeybuilder/publish/', activity.publish );
app.post('/nba/journeybuilder/execute/', activity.execute );
app.post('/nba/journeybuilder/stop/', activity.stop );

http.createServer(app).listen(
  app.get('port'), function(){
    console.log('AKS-NBA Express server listening on port ' + app.get('port'));
  }
);
  
//https://github.com/request/request/blob/master/tests/test-api.js