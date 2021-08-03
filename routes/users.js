"use strict";

const Router = require("express").Router;
const router = new Router();

const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, function (req, res, next) {
    return res.json({ users: await Users.all });
})


/** GET /:username - get detail of user.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureLoggedIn, ensureCorrectUser, function (req, res, next) {
    return res.json({ user: await Users.get(username) });
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureLoggedIn, ensureCorrectUser, function (req, res, next) {
    return res.json({ user: await Users.messagesTo(username) });
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", ensureLoggedIn, ensureCorrectUser, function (req, res, next) {
    return res.json({ user: await Users.messagesFrom(username) });
})

module.exports = router;