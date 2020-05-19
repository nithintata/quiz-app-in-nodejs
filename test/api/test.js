const expect = require('chai').expect;
const request = require('supertest');

const app = require('../../app.js');
var quiz_id = 0;
var question_id = 0;

describe('Unit tests for CRUD operations on different end points', () => {

  it('OK, cannot create a new Quiz without authorization', (done)=> {
    request(app).post('/quizes')
    .send({"name":"My Quiz","instructions":"Instructions goes here","isEnabled":true,"questions":[{"question":"What is capital of AP","answers":[{"option":"new york"},{"option":"Bombay"},{"option":"Vijayawada"},{"option":"noida"}],"answer":2,"isEnabled":true,"explanation":"Something"},{"question":"What is capital of us","answers":[{"option":"new york"},{"option":"dc"},{"option":"qwer"},{"option":"mumbai"}],"answer":2,"isEnabled":true,"explanation":"Something"}],"duration":{"hours":10,"minutes":20,"seconds":30}})
    .then((res) => {
      const statusCode = res.statusCode
      expect(statusCode).equal(401);
      done();
    })
    .catch((err) => done(err));
  });

  it('OK, created a new Quiz', (done)=> {
    request(app).post('/quizes')
    .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=')
    .send({"name":"My Quiz","instructions":"Instructions goes here","isEnabled":true,"questions":[{"question":"What is capital of AP","answers":[{"option":"new york"},{"option":"Bombay"},{"option":"Vijayawada"},{"option":"noida"}],"answer":2,"isEnabled":true,"explanation":"Something"},{"question":"What is capital of us","answers":[{"option":"new york"},{"option":"dc"},{"option":"qwer"},{"option":"mumbai"}],"answer":2,"isEnabled":true,"explanation":"Something"}],"duration":{"hours":10,"minutes":20,"seconds":30}})
    .then((res) => {
      const body = res.body
      expect(body).to.contain.property('_id');
      quiz_id = body._id;
      done();
    })
    .catch((err) => done(err));
  });

  it('OK, updated a new Quiz', (done)=> {
    request(app).put('/quizes/' + quiz_id)
    .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=')
    .send({"instructions":"Instructions are updated"})
    .then((res) => {
      const update = res.body.instructions;
      expect(update).equal('Instructions are updated');
      done();
    })
    .catch((err) => done(err));
  });

  it('OK, Added a new question', (done)=> {
    request(app).post('/quizes/' + quiz_id + '/questions')
    .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=')
    .send({"question":"What is capital of Japan","answers":[{"option":"new york"},{"option":"Tokyo"},{"option":"Vijayawada"},{"option":"berlin"}],"answer":2,"isEnabled":true,"explanation":"Something"})
    .then((res) => {
      const added = res.body.questions.length;
      expect(added).equal(3);
      question_id = res.body.questions[2]._id;
      done();
    })
    .catch((err) => done(err));
  });

  it('OK, Updated an existing question', (done)=> {
    request(app).put('/quizes/' + quiz_id + '/questions/' + question_id)
    .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=')
    .send({"question":"What is capital of Japan ??"})
    .then((res) => {
      const update = res.body.question;
      expect(update).equal('What is capital of Japan ??');
      done();
    })
    .catch((err) => done(err));
  });

  it('OK, Getting data from the end point /quizes/:quizId/questions/:questionId', (done)=> {
    request(app).get('/quizes/' + quiz_id + '/questions/' + question_id)
    .send({})
    .then((res) => {
      const statusCode = res.statusCode
      expect(statusCode).equal(200);
      done();
    })
    .catch((err) => done(err));
  });

  it('OK, Getting data from the end point /quizes/:quizId/questions', (done)=> {
    request(app).get('/quizes/' + quiz_id + '/questions')
    .send({})
    .then((res) => {
      const statusCode = res.statusCode
      expect(statusCode).equal(200);
      done();
    })
    .catch((err) => done(err));
  });

  it('OK, Getting data from the end point /quizes/:quizId', (done)=> {
    request(app).get('/quizes/' + quiz_id)
    .send({})
    .then((res) => {
      const statusCode = res.statusCode
      expect(statusCode).equal(200);
      done();
    })
    .catch((err) => done(err));
  });

  it('OK, Getting data from the end point /quizes', (done)=> {
    request(app).get('/quizes')
    .send({})
    .then((res) => {
      const statusCode = res.statusCode
      expect(statusCode).equal(200);
      done();
    })
    .catch((err) => done(err));
  });

  it('OK, Deleted a question from a quiz', (done)=> {
    request(app).delete('/quizes/' + quiz_id + '/questions/' + question_id)
    .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=')
    .send({})
    .then((res) => {
      const afterDeletion = res.body.questions.length;
      expect(afterDeletion).equal(2);
      done();
    })
    .catch((err) => done(err));
  });

  it('OK, Deleted a quiz', (done)=> {
    request(app).delete('/quizes/' + quiz_id)
    .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQ=')
    .send({})
    .then((res) => {
      const statusCode = res.statusCode
      expect(statusCode).equal(200);
      done();
    })
    .catch((err) => done(err));
  });

});
