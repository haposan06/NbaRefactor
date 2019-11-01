const jwt = require('jsonwebtoken');
const log = require('./logger');

module.exports = async (token, secret) => {
  log.logger.info(`Token is : ${token}`);
  if (!token) {
    throw new Error('invalid jwtdata');
  }
  try {
    const decode = jwt.verify(token, secret, { algorithm: 'HS256' });
    return decode;
  }
  catch (error) {
    throw new Error(error);
  }
};
