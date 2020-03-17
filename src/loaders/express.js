const express = require('express');
const path = require('path');
const routes = $require("controllers");

module.exports = app => {
  app.use('/', routes());
  app.use(express.static(path.join(__dirname, "../public")));
};