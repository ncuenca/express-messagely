"use strict";

const Router = require("express").Router;
const router = new Router();

const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    let message = await Message.get(req.params.id);
    let username = res.locals.user.username

    if (username !== message.from_username || username !== message.to_username) {
        throw new UnauthorizedError("BAD USER!");
    }
    return res.json({ message });
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/:id", ensureLoggedIn, async function (req, res, next) {
    let username = res.locals.user.username;
    let { to_username, body } = req.body;

    try {
        return res.json({ message: await Message.create({ username, to_username, body }) });
    } catch {
        throw new UnauthorizedError("BAD USER!");
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
    let username = res.locals.user.username;
    if (username !== message.to_username) {
        throw new UnauthorizedError("BAD USER!");
    }

    return res.json({ message: await Message.markRead(req.params.id) });
});

module.exports = router;