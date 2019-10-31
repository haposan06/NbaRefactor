const express = require('express');
const SessionCtrl = require('../controllers/session.ctrl');

const unauth = express.Router();

unauth
  .get('/logs/jsLogs.txt', SessionCtrl.getLogs)
  .post('/login', SessionCtrl.login);

module.exports = unauth;
