const ActivityStore = require('../stores/activity.store');
const log = require('../utils/logger');

class ActivityController {
  static async save(req, res) {
    try {
      const payload = await ActivityStore.save(req);
      res.send(payload);
    }
    catch (exception) {
      req.status(500).send(exception);
    }
  }

  static async publish(req, res) {
    try {
      const payload = await ActivityStore.publish(req);
      res.send(payload);
    }
    catch (exception) {
      req.status(500).send(exception);
    }
  }

  static async validate(req, res) {
    try {
      const payload = await ActivityStore.validate(req);
      res.send(payload);
    }
    catch (exception) {
      req.status(500).send(exception);
    }
  }

  static async execute(req, res) {
    try {
      log.logger.info(`ActivityController method execute ${JSON.stringify(req.decoded)}`);
      if (req.decoded && req.decoded.inArguments && req.decoded.inArguments.length > 0) {
        const executePayload = await ActivityStore.execute(req);
        return res.status(200).send(executePayload);
      }
      log.logger.error(`Incorrect decoded inArguments : ${req.decoded}`);
      return res.status(400).end();
    }
    catch (exception) {
      return res.status(500).send(exception);
    }
  }

  static async stop(req, res) {
    try {
      const payload = await ActivityStore.stop(req);
      res.send(payload);
    }
    catch (exception) {
      req.status(500).send(exception);
    }
  }
}

module.exports = ActivityController;
