const request = require('request');
const log = require('./logger');

class RestUtil {
  static post(req) {
    return new Promise((resolve, reject) => {
      req.method = 'POST';
      req.body = JSON.stringify(req.body);
      log.hostLogger.info(`REST Request : URL ${req.url} - ${req.body}`);
      request(req, (error, response, body) => {
        try {
          if (error) {
            log.hostLogger.info(`ERROR REST Request : URL ${req.url} - ${error}`);
            reject(error);
          }
          if (response.statusCode !== 200) {
            const err = `Error REST ${req.url} - Status : ${response.statusCode} - Content: ${body}`;
            log.hostLogger.info(err);
            reject(new Error(err));
          }
          log.hostLogger.info(`REST Response : URL ${req.url} - ${response.statusCode} - ${body}`);
          resolve({ response, body });
        }
        catch (promiseError) {
          reject(promiseError);
        }
      });
    });
  }
}

module.exports = RestUtil;
