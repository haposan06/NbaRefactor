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
      // const { body, statusCode } = response.data;
      // optional (it'll return an object in case it's not valid)
      if (parser.validate(response.data) === true) {
        // writeToFile(response.data, "204");
        const options = {
          attributeNamePrefix: '@_',
          attrNodeName: 'attr', // default is 'false'
          textNodeName: '#text',
          ignoreAttributes: true,
          ignoreNameSpace: false,
          allowBooleanAttributes: false,
          parseNodeValue: true,
          parseAttributeValue: false,
          trimValues: true,
          cdataTagName: '__cdata', // default is 'false'
          cdataPositionChar: '\\c',
          localeRange: '', // To support non english character in tag/attribute values.
          parseTrueNumberOnly: false,
          attrValueProcessor: (a) => he.decode(a, { isAttributeValue: true }), // default is a=>a
          tagValueProcessor: (a) => he.decode(a) // default is a=>a
        };
        const jsonObj = parser.parse(response.data, options);

        const soapEnvelope = jsonObj['soap:Envelope'];
        const soapBody = soapEnvelope['soap:Body'];
        return soapBody;
        // requestGetProductInformationJD(accountDeMapping, decodedArgs, token);
      }
      log.logger.error('PARSER NOT VALIDATE');
    }).catch((err) => {
      log.logger.error(err);
    });
  }
}

module.exports = SoapUtil;
