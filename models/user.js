"use strict";

const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const db = require('../db');

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username,
                             password,
                             first_name,
                             last_name,
                             phone, 
                             join_at,
                             last_login_at)
         VALUES
           ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
         RETURNING username, password, first_name, last_name, phone`,
    [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
       FROM users
       WHERE username = $1`,
       [username]);
    const user = result.rows[0];
    
    if (user) {
      return await bcrypt.compare(password, user.password) === true;
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
          `UPDATE users
           SET last_login_at = current_timestamp
             WHERE username = $1
             RETURNING username, last_login_at`,
        [username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`Invalid username`);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name
       FROM users`
    )
    const users = results.rows;

    return users;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
       FROM users
       WHERE username = $1`,
       [username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
          `SELECT m.id,
                  m.to_username AS username,
                  t.first_name AS first_name,
                  t.last_name AS last_name,
                  t.phone AS phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS t ON m.to_username = t.username
             WHERE m.from_username = $1`,
        [username]);
    
    let messages = results.rows.map(function(row) {
      let { id, body, sent_at, read_at, ...to_user } = row;
      return { id, to_user, body, sent_at, read_at };
    });

    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
          `SELECT m.id,
                  m.from_username AS username,
                  f.first_name AS first_name,
                  f.last_name AS last_name,
                  f.phone AS phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS f ON m.from_username = f.username
             WHERE m.to_username = $1`,
        [username]);
    
    let messages = results.rows.map(function(row) {
      let { id, body, sent_at, read_at, ...from_user } = row;
      return { id, from_user, body, sent_at, read_at };
    });

    return messages;
  }
}


module.exports = User;
