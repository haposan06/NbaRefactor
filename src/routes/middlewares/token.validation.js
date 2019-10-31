const log = require('../../utils/logger');
const Token = require('../../utils/access.token');

class AccessTokenValidation {
  static async validate(req, res, next) {
    log.logger.info(`Execute AccessTokenValidation.validate middleware . Request ${req}`);
    if (!req.decoded) {
      log.logger.error('Error in AccessTokenValidation middleware : Missing decoded');
      res.status(400).send('Malformed HTTP Request');
    }
    try {
      const token = await Token();
      if (!token) {
        res.status(401).send('Forbidden external access');
      }
      req.access_token = token;
      next();
    }
    catch (error) {
      log.logger.error(`Error in AccessTokenValidation middleware : ${error}`);
      res.status(401).send('Forbidden access');
    }
  }
}

module.exports = AccessTokenValidation;
