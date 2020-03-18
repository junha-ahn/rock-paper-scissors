const express = require('express');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const Logger = $require('loaders/logger');

function startServer() {
  const app = express();
  const server = !config.HTTPS_ENABLE ? 
  require('http').createServer(app) :
  require('https').createServer({
    key: fs.readFileSync(path.join(__dirname, '../key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../cert.pem'))
  }, app);

  $require('loaders')(app, server);

  server.listen(config.port, err => {
    if (err) {
      Logger.error(err);
      process.exit(1);
    }
    Logger.info(`
      🛡️  Server listening on port: ${config.port} 🛡️
    `);
  });

  module.exports = app
}

startServer();