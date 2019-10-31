'use strict';

// Module Dependencies
// -------------------
const bodyParser = require('body-parser');
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

const customErrHandler = (err, req, res, next) => {
  log.logger.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
};

app.use(express.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: '*/*' }));
app.use(log.logMiddleware);

require('./src/routes/routes.index.js')(app);

app.use(customErrHandler);

// Configure Express
app.set('port', process.env.PORT || 3000);

const server = http.createServer(app).listen(
  app.get('port'), () => {
    console.log(`AKS-NBA Express server listening on port ${app.get('port')}`);
  }
);

module.exports = { app, server };
