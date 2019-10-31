const log = require('../utils/logger');

class AuthStore {
  static async authenticate(req, res, next) {
    // TODO
    log.logger.info(`Execute AuthStore.authenticate middleware . Request ${req}`);
    next();
    log.logger.info(`Execute AuthStore.authenticate middleware . Response ${req}`);
  }
}

module.exports = AuthStore;
