const expect = require("chai").expect;
const request = require("supertest");

const app = require("../../app.js");
var quiz_id = 0;
var question_id = 0;
let token = null;

describe("Unit tests  operations on User SignUp", () => {
  it("Ok, should get a error on missing field", (done) => {
    request(app)
      .post("/users/signup")
      .send({ username: "MAb" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(400);

        const errorMessage = JSON.parse(res.text);
        expect(errorMessage.error).equal("Missing Fields");
        done();
      })
      .catch((err) => done(err));
  });

  it("Ok, should get a error on missing field", (done) => {
    request(app)
      .post("/users/signup")
      .send({ username: "", password: "@ble" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(400);

        const errorMessage = JSON.parse(res.text);
        expect(errorMessage.error).equal("Missing Fields");

        done();
      })
      .catch((err) => done(err));
  });

  it("Ok, should get a error on  username input validatoin", (done) => {
    request(app)
      .post("/users/signup")
      .send({ username: "MA", password: "someRandom" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(400);

        const errorMessage = JSON.parse(res.text);
        expect(errorMessage.error).equal(
          "Username should be greater than 3 and less than 64 characters"
        );

        done();
      })
      .catch((err) => done(err));
  });

  it("Ok, should get a error on  password input validation", (done) => {
    request(app)
      .post("/users/signup")
      .send({ username: "MAb", password: "@blem" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(400);

        const errorMessage = JSON.parse(res.text);
        expect(errorMessage.error).equal(
          "Password should be greater than 3 and less than 64 characters"
        );

        done();
      })
      .catch((err) => done(err));
  });

  it("Ok, should get error on Username already exist", (done) => {
    request(app)
      .post("/users/signup")
      .send({ username: "MAb", password: "@blemessi" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(409);

        const Message = JSON.parse(res.text);
        expect(Message.error).equal("User with this username already exists");
        done();
      })
      .catch((err) => done(err));
  });

  it("Ok, should get success on user signup", (done) => {
    request(app)
      .post("/users/signup")
      .send({ username: "Testing", password: "Testing" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(201);

        const Message = JSON.parse(res.text);
        expect(Message.message).equal("Signup Success");
        done();
      })
      .catch((err) => done(err));
  });
});

describe("Unit tests  operations on User Login", () => {
  it("Ok, should get a error on username Missing credentials", (done) => {
    request(app)
      .post("/users/login")
      .send({ username: "MAb" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(401);

        const errorMessage = JSON.parse(res.text);
        expect(errorMessage.success).equal(false);
        expect(errorMessage.err.message).equal("Missing credentials");
        done();
      })
      .catch((err) => done(err));
  });

  it("Ok, should get a error on password Missing credentials", (done) => {
    request(app)
      .post("/users/login")
      .send({ password: "test1234" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(401);

        const errorMessage = JSON.parse(res.text);
        expect(errorMessage.success).equal(false);
        expect(errorMessage.err.message).equal("Missing credentials");
        done();
      })
      .catch((err) => done(err));
  });

  it("Ok, should get a error on Invalid Username", (done) => {
    request(app)
      .post("/users/login")
      .send({ username: "Testin", password: "Testing" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(401);

        const errorMessage = JSON.parse(res.text);
        expect(errorMessage.success).equal(false);
        expect(errorMessage.err.message).equal("Incorrect Username.");
        done();
      })
      .catch((err) => done(err));
  });

  it("Ok, should get a error on Invalid Password", (done) => {
    request(app)
      .post("/users/login")
      .send({ username: "Testing", password: "Testin" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(401);

        const errorMessage = JSON.parse(res.text);
        expect(errorMessage.success).equal(false);
        expect(errorMessage.err.message).equal("Incorrect password.");
        done();
      })
      .catch((err) => done(err));
  });

  it("Ok,  should get success on user login", (done) => {
    request(app)
      .post("/users/login")
      .send({ username: "MAb", password: "@bleomessi" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(200);

        const errorMessage = JSON.parse(res.text);
        token = errorMessage.token;
        expect(errorMessage.success).equal(true);
        expect(errorMessage.status).equal("Login successfull");
        done();
      })
      .catch((err) => done(err));
  });
});

describe("Unit tests for CRUD operations on quizzes end points", () => {
  it("OK, cannot create a new Quiz without authorization", (done) => {
    request(app)
      .post("/quizes")
      .send({
        name: "My Quiz",
        instructions: "Instructions goes here",
        isEnabled: true,
        questions: [
          {
            question: "What is capital of AP",
            answers: [
              { option: "new york" },
              { option: "Bombay" },
              { option: "Vijayawada" },
              { option: "noida" },
            ],
            answer: 2,
            isEnabled: true,
            explanation: "Something",
          },
          {
            question: "What is capital of us",
            answers: [
              { option: "new york" },
              { option: "dc" },
              { option: "qwer" },
              { option: "mumbai" },
            ],
            answer: 2,
            isEnabled: true,
            explanation: "Something",
          },
        ],
        duration: { hours: 10, minutes: 20, seconds: 30 },
      })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(401);
        const responseMessage = res.text;
        expect(responseMessage).equal("Unauthorized");
        done();
      })
      .catch((err) => done(err));
  });

  it("OK, Only Admin can create a new Quiz", (done) => {
    request(app)
      .post("/quizes")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "My Quiz",
        instructions: "Instructions goes here",
        isEnabled: true,
        questions: [
          {
            question: "What is capital of AP",
            answers: [
              { option: "new york" },
              { option: "Bombay" },
              { option: "Vijayawada" },
              { option: "noida" },
            ],
            answer: 2,
            isEnabled: true,
            explanation: "Something",
          },
          {
            question: "What is capital of us",
            answers: [
              { option: "new york" },
              { option: "dc" },
              { option: "qwer" },
              { option: "mumbai" },
            ],
            answer: 2,
            isEnabled: true,
            explanation: "Something",
          },
        ],
        duration: { hours: 10, minutes: 20, seconds: 30 },
      })
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property("_id");
        quiz_id = body._id;
        done();
      })
      .catch((err) => done(err));
  });

  it("OK, Only Admin can update a existing Quiz", (done) => {
    request(app)
      .put("/quizes/" + quiz_id)
      .set("Authorization", `Bearer ${token}`)
      .send({
        instructions:
          "Instructions are updated and should be in effect from now",
      })
      .then((res) => {
        const update = res.body.instructions;
        expect(update).equal(
          "Instructions are updated and should be in effect from now"
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("OK, Only Admin can Add a new question", (done) => {
    request(app)
      .post("/quizes/" + quiz_id + "/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        question: "What is capital of Japan",
        answers: [
          { option: "new york" },
          { option: "Tokyo" },
          { option: "Vijayawada" },
          { option: "berlin" },
        ],
        answer: 2,
        isEnabled: true,
        explanation: "Something",
      })
      .then((res) => {
        const added = res.body.questions.length;
        expect(added).equal(3);
        question_id = res.body.questions[2]._id;
        done();
      })
      .catch((err) => done(err));
  });

  it("OK, Only Admin can Update an existing question", (done) => {
    request(app)
      .put("/quizes/" + quiz_id + "/questions/" + question_id)
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "What is Capital of Japan ??" })
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(204); // 204 resource updated successfully status code
        done();
      })
      .catch((err) => done(err));
  });

  it("OK,  Getting data from the end point /quizes/:quizId/questions/:questionId", (done) => {
    request(app)
      .get("/quizes/" + quiz_id + "/questions/" + question_id)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(200);
        done();
      })
      .catch((err) => done(err));
  });

  it("OK, Getting data from the end point /quizes/:quizId/questions", (done) => {
    request(app)
      .get("/quizes/" + quiz_id + "/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(200);
        done();
      })
      .catch((err) => done(err));
  });

  it("OK, Getting data from the end point /quizes/:quizId", (done) => {
    request(app)
      .get("/quizes/" + quiz_id)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(200);
        done();
      })
      .catch((err) => done(err));
  });

  it("OK, Getting data from the end point /quizes", (done) => {
    request(app)
      .get("/quizes")
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(200);
        done();
      })
      .catch((err) => done(err));
  });

  it("OK, Deleted a question from a quiz", (done) => {
    request(app)
      .delete("/quizes/" + quiz_id + "/questions/" + question_id)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(204);

        done();
      })
      .catch((err) => done(err));
  });

  it("OK, Deleted a quiz", (done) => {
    request(app)
      .delete("/quizes/" + quiz_id)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .then((res) => {
        const statusCode = res.statusCode;
        expect(statusCode).equal(204);
        done();
      })
      .catch((err) => done(err));
  });
});
