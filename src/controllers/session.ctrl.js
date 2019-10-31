const path = require('path');

class SessionController {
  static async login(req, res) {
    try {
      res.send(200, 'Log in');
    }
    catch (exception) {
      req.status(500).send(exception);
    }
  }

  static async logout(req, res) {
    try {
      res.send(200, 'Log out');
    }
    catch (exception) {
      req.status(500).send(exception);
    }
  }

  static async getLogs(req, res) {
    try {
      res.sendFile(path.resolve(__dirname, '../logs/jsLogs.txt'));
    }
    catch (exception) {
      req.status(500).send(exception);
    }
  }
}

module.exports = SessionController;
