"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");


describe("User Routes Test", function () {
  let token;

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });

    // make a request to the login endpoint
    let resp = await request(app)
        .post("/auth/login")
        .send({ username: "test1", password: "password" });

    token = resp.body.token;
    
  });

    

/*   router.get("/", ensureLoggedIn, function (req, res, next) {
    return res.json({ users: await User.all() });
}); */

  /** GET / => all users  */

  describe("GET /users/", function () {
    test("can get all users", async function () {
       

      let response = await request(app)
        .get("/users/")
        .send({_token : token });//send body that includes _token  
    console.log(`RESPONSE.BODY IS`, response.body)
 

      expect(response.body).toEqual({ users: [{
        username: "test1",
        first_name: "Test1",
        last_name: "Testy1",
      }]});
    });
  });




///////////////////////////////////////////////////////////////////////////
// stuff below here is copied and pasted from auth to use as a model




  /** POST /auth/login => token  */

  /* 
  describe("POST /auth/login", function () {
    test("can login", async function () {
      let response = await request(app)
        .post("/auth/login")
        .send({ username: "test1", password: "password" });

      let token = response.body.token;
      expect(jwt.decode(token)).toEqual({
        username: "test1",
        iat: expect.any(Number)
      });
    });

    test("won't login w/wrong password", async function () {
      let response = await request(app)
        .post("/auth/login")
        .send({ username: "test1", password: "WRONG" });
      expect(response.statusCode).toEqual(400);
    });

    test("won't login w/wrong username", async function () {
      let response = await request(app)
        .post("/auth/login")
        .send({ username: "not-user", password: "password" });
      expect(response.statusCode).toEqual(400);
    });
  });
});

afterAll(async function () {
  await db.end();
});
 */

