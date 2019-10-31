const log = require('../../utils/logger');
const Token = require('../../utils/access.token');

class AccessTokenValidation {
  static async validate(req, res, next) {
    log.logger.info(`Execute AccessTokenValidation.validate middleware . Request ${req}`);
    if (!req.decoded) {
      log.logger.error('Error in AccessTokenValidation middleware : Missing decoded');
      const err = new Error('Malformed HTTP Request');
      err.statusCode = 400;
      next(err);
    }
    try {
      const token = await Token();
      if (!token) {
        const err = new Error('Forbidden external access');
        err.statusCode = 401;
        next(err);
      }
      req.access_token = token;
      next();
    }
    catch (error) {
      log.logger.error(`Error in AccessTokenValidation middleware : ${error}`);
      const err = new Error('Forbidden external access');
      err.statusCode = 401;
      next(err);
    }
  }
}

module.exports = AccessTokenValidation;
