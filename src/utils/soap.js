const axios = require('axios');
const parser = require('fast-xml-parser');
const he = require('he');
const log = require('./logger');


class SoapUtil {
  static async post({ url, soapAction, body }) {
    log.hostLogger.info(`Soap Request: url->${url}, soapAction->${soapAction}, body->${body}`);
    return axios.post(url, body, {
      headers: {
        'Content-Type': 'text/xml',
        soapAction
      }
    }).then((response) => {
      log.hostLogger.info(`Soap Response: url->${url}, soapAction->${soapAction}, body->${response.data}`);
      if (parser.validate(response.data) === true) {
        const options = {
          attributeNamePrefix: '@_',
          attrNodeName: 'attr',
          textNodeName: '#text',
          ignoreAttributes: true,
          ignoreNameSpace: false,
          allowBooleanAttributes: false,
          parseNodeValue: true,
          parseAttributeValue: false,
          trimValues: true,
          cdataTagName: '__cdata',
          cdataPositionChar: '\\c',
          localeRange: '',
          parseTrueNumberOnly: false,
          attrValueProcessor: (a) => he.decode(a, { isAttributeValue: true }),
          tagValueProcessor: (a) => he.decode(a)
        };
        const jsonObj = parser.parse(response.data, options);

        const soapEnvelope = jsonObj['soap:Envelope'];
        const soapBody = soapEnvelope['soap:Body'];
        return soapBody;
      }
      log.logger.error('PARSER NOT VALIDATE');
    }).catch((err) => {
      log.logger.error(err);
    });
  }
}

module.exports = SoapUtil;
