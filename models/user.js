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
                             join_at)
         VALUES
           ($1, $2, $3, $4, $5, current_timestamp)
         RETURNING username, password, first_name, last_name, phone`,
    [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    console.log(`hashedPw = ${hashedPassword}`)
    const result = await db.query(
      `SELECT password
       FROM users
       WHERE username = $1`,
       [username]);
    const userPw = result.rows[0];
    
    if (userPw) {
      return await bcrypt.compare(password, userPw.password) === true;
    }
    
    throw new NotFoundError(`Invalid login`);
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

    return user;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name
       FROM users`
    )
    const users = results.rows;

    if (!users) throw new NotFoundError(`No users`);

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
                    JOIN users AS f ON m.from_username = f.username
                    JOIN users AS t ON m.to_username = t.username
             WHERE m.from_username = $1`,
        [username]);
        console.log(results.rows[0]);
    let { username, first_name, last_name, phone } = results;
    
    let messages = results.rows.map(function(row) {
        { row.id, to_user, row.body, row.sent_at, row.read_at };
    }) ;

    /* {
      id: 1,
      to_username: 'test2',
      to_first_name: 'Test2',
      to_last_name: 'Testy2',
      to_phone: '+14155552222',
      body: 'u1-to-u2',
      sent_at: 2021-08-02T23:18:03.014Z,
      read_at: null
    } */

    /* [{id, to_user, body, sent_at, read_at}]
    {username, first_name, last_name, phone} */


    if (!messages) throw new NotFoundError(`No such message: ${id}`);

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
                  m.from_username,
                  m.to_username,
                  f.first_name AS from_first_name,
                  f.last_name AS from_last_name,
                  f.phone AS from_phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS f ON m.from_username = f.username
                    JOIN users AS t ON m.to_username = t.username
             WHERE m.to_username = $1`,
        [username]);

    let messages = results.rows;

    if (!messages) throw new NotFoundError(`No such message: ${id}`);

    return {
      id: messages.id,
      from_user: {
        username: messages.from_username,
        first_name: messages.from_first_name,
        last_name: messages.from_last_name,
        phone: messages.from_phone,
      },
      body: messages.body,
      sent_at: messages.sent_at,
      read_at: messages.read_at,
    };
  }
}


module.exports = User;
