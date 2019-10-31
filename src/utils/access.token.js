const log = require('../utils/logger');
const RestUtil = require('../utils/rest');

module.exports = async () => {
  try {
    const mcBody = {
      // client id of installed app created in marketing cloud. stored as environment variable in
      // host server
      client_id: process.env.CLIENT_ID,
      // client secret of installed app created in marketing cloud. stored as environment variable
      // in host server
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'client_credentials' // fixed value
    };

    const header = {
      'Content-Type': 'application/json'
    };

    const mcRequest = {
      body: mcBody,
      method: 'POST',
      headers: header,
      url: `${process.env.AUTHENTICATIONBASE_URI}v2/token` // authentication base uri of installed app created in marketing cloud
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
