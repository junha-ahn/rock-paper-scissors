const router = require('express').Router();

module.exports = app => {
  app.use('/', router);

  router.get(
    '/',
    (req, res, next) => {
      // const key = req.query.key;
      next()
    }
  );
};