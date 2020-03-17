const {
  Router
} = require('express');

const router = () => {
  const app = Router();
  require('./routes/common')(app);
  return app;
};

module.exports = router;