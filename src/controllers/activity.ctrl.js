const ActivityStore = require('../stores/activity.store');
const log = require('../utils/logger');

class ActivityController {
  static async save(req, res, next) {
    try {
      const payload = await ActivityStore.save(req);
      res.send(payload);
    }
    catch (exception) {
      next(new Error(`Internal Server Error: ${exception}`));
    }
  }

  static async publish(req, res, next) {
    try {
      const payload = await ActivityStore.publish(req);
      res.send(payload);
    }
    catch (exception) {
      next(new Error(`Internal Server Error: ${exception}`));
    }
  }

  static async validate(req, res, next) {
    try {
      const payload = await ActivityStore.validate(req);
      res.send(payload);
    }
    catch (exception) {
      next(new Error(`Internal Server Error: ${exception}`));
    }
  }

  static async execute(req, res, next) {
    try {
      log.logger.info(`ActivityController method execute ${JSON.stringify(req.decoded)}`);
      if (req.decoded && req.decoded.inArguments && req.decoded.inArguments.length > 0) {
        const executePayload = await ActivityStore.execute(req);
        res.status(200).send(executePayload);
      }
      log.logger.error(`Incorrect decoded inArguments : ${req.decoded}`);
      next(new Error(`Incorrect decoded inArguments : ${req.decoded}`));
    }
    catch (exception) {
      next(new Error(`Internal Server Error: ${exception}`));
    }
  }

  static async stop(req, res, next) {
    try {
      const payload = await ActivityStore.stop(req);
      res.send(payload);
    }
    catch (exception) {
      next(new Error(`Internal Server Error: ${exception}`));
    }
  }
}

module.exports = ActivityController;
