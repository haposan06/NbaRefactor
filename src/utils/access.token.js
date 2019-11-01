const log = require('../utils/logger');
const RestUtil = require('../utils/rest');

module.exports = async () => {
  try {
    const mcBody = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'client_credentials'
    };

    const header = {
      'Content-Type': 'application/json'
    };

    const mcRequest = {
      body: mcBody,
      method: 'POST',
      headers: header,
      url: `${process.env.AUTHENTICATIONBASE_URI}v2/token`
    };
    const { response, body } = await RestUtil.post(mcRequest);
    const jsonObject = JSON.parse(body);
    const token = jsonObject.access_token;
    return token;
  }
  catch (error) {
    throw new Error(error);
  }
};
