const expressLoader = require("./express");
const socketLoader = require("./socket");
const Logger = require("./logger");

module.exports = async (app, server) => {
  expressLoader(app);
  Logger.info("✌️ Express loaded");

  socketLoader(server);
  Logger.info("✌️ Socket loaded");
};