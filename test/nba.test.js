const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, server } = require('../app');
const jwt = require('../src/utils/jwt');
const Token = require('../src/utils/access.token');

// Configure chai
chai.use(chaiHttp);
chai.should();

const JWT_KEY = 'your-256-bit-secret';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('Session', () => {
  describe('Nba Testing /', () => {
    // Test JWT
    it('JWT Utils', async () => {
      const decoded = await jwt(JWT_TOKEN, JWT_KEY);
      assert.equal(decoded.name, 'John Doe');
    });

    // Access Token
    it('Access token', async () => {
      if (!process.env.CLIENT_ID && !process.env.CLIENT_SECRET
        && !process.env.AUTHENTICATIONBASE_URI) {
        console.log('Lacks clientID and client Secret in env variables. Default result is true');
        assert.equal(1, 1);
        server.close();
      }
      else {
        const accessToken = await Token();
        if (!accessToken) {
          assert.ok(accessToken);
          server.close();
        }
        else {
          console.log(`The token is   =  ${JSON.stringify(accessToken)}`);
          assert.equal(1, 1);
          server.close();
        }
      }
    });

    // Test execute
    it('Excute', () => {
      chai.request(app)
        .post('/nba/journeybuilder/execute')
        .send(JWT_TOKEN)
        .end((err, res) => {
          res.should.satisfy((num) => { // should have 401 or 400 since unimplemented
            if ((res.status === 400) || (res.status === 401)) {
              return true;
            }
            return false;
          });
          server.close();
        });
    });
  });
});
