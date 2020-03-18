const path = require("path");
global.$require = pathname => require(path.join(__dirname, "../" + pathname));

const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};
const HTTPS_ENABLE = 1;
module.exports = {
  HTTPS_ENABLE,
  NODE_ENV: process.env.NODE_ENV,
  port: normalizePort(HTTPS_ENABLE ? 443 : 
    process.argv[2] || process.env.PORT || 3000),
  logs: {
    level: process.env.LOG_LEVEL || "silly"
  },
};