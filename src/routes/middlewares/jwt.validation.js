const log = require('../../utils/logger');
const jwt = require('../../utils/jwt');

class JwtValidation {
  static async validate(req, res, next) {
    log.logger.info(`JwtValidation.validate middleware . Request ${req}`);
    if (!req.rawBody) {
      log.logger.error('Error in JwtValidation middleware : Missing JWT Token');
      res.status(400).send('Malformed HTTP Request');
    }
    try {
      const decoded = await jwt(req.rawBody, process.env.JWT_KEY);
      log.logger.info(`Request : ${req.rawBody} - Decode : ${decoded}`);
      req.decoded = decoded;
      next();
    }
    catch (error) {
      log.logger.error(`Error in JwtValidation middleware : ${error}`);
      res.status(401).send('Forbidden access');
    }
  }
}

module.exports = JwtValidation;
