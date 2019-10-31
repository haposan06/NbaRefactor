'use strict';

// Module Dependencies
// -------------------
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const express = require('express');
const http = require('http');
const log = require('./src/utils/logger');
// EXPRESS CONFIGURATION
const app = express();


var dateNow = Date.now();

console.log(`IN APP.JS - >${dateNow}`);

const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(express.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: '*/*' }));
app.use(log.logMiddleware);

/*
app.use(bodyParser.raw({type: 'application/jwt'}));
app.use('/nba', express.static(path.join(__dirname, 'nba')));
*/
if (app.get('env') === 'development') {
  log.logger.info('AKS-NBA express in development');
  app.use(errorhandler());
}

require('./src/routes/routes.index.js')(app);


// Configure Express
app.set('port', process.env.PORT || 3000);

http.createServer(app).listen(
  app.get('port'), () => {
    console.log(`AKS-NBA Express server listening on port ${app.get('port')}`);
  }
);

// https://github.com/request/request/blob/master/tests/test-api.js