const express = require('express');
const SessionCtrl = require('../controllers/session.ctrl');

const unauthorizedRoute = express.Router();

unauthorizedRoute
  .get('/logs/jsLogs.txt', SessionCtrl.getLogs);

module.exports = unauthorizedRoute;
