"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require('../config');
const { BadRequestError } = require("../expressError");

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
  const { username, password } = req.body;
  if (await User.authenticate(username, password) !== true) {
    throw new BadRequestError('INVALID LOGIN');
  }
  let token = jwt.sign({ username }, SECRET_KEY)
  User.updateLoginTimestamp(username);
  return res.json({ token });
});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register", async function (req, res, next) {
  const { username, password, first_name, last_name, phone } = req.body;
  if (await User.register(username, password, first_name, last_name, phone)) {
    throw new BadRequestError('Please choose a different username.');
  }
  let token = jwt.sign({ username }, SECRET_KEY)
  User.updateLoginTimestamp(username);
  return res.json({ token });
});

module.exports = router;