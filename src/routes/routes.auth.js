const express = require('express');
const ActivityCtrl = require('../controllers/activity.ctrl');
const SessionCtrl = require('../controllers/session.ctrl');

const auth = express.Router();

auth
  .post('/logout', SessionCtrl.logout)
  .post('/journeybuilder/save/', ActivityCtrl.save)
  .post('/journeybuilder/validate/', ActivityCtrl.validate)
  .post('/journeybuilder/publish/', ActivityCtrl.publish)
  .post('/journeybuilder/execute/', ActivityCtrl.execute)
  .post('/journeybuilder/stop/', ActivityCtrl.stop);

module.exports = auth;
