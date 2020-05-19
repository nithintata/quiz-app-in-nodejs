const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Quizes = require("../models/quizes");

const quizRouter = express.Router();
quizRouter.use(bodyParser.json());

quizRouter.route('/')
    .get((req, res, next) => {
        Quizes.find({isEnabled : true})
            .then((quizes) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                var text = "";
                for (var i = 0; i < quizes.length; i++)
                   text = text + "<b>Name: </b>" + quizes[i].name + "<br>" + "<b>id:</b> " + quizes[i]._id + "<br><hr>";
                res.end(text);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Quizes.create(req.body)
            .then((quiz) => {
                console.log('Quiz Created: ', quiz);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(quiz);
            }, (err) => next(err)).catch((err) => next(err));
    })
    .put((req, res, next) => {
        res.statusCode = 403 /*Not supported*/
        res.end('PUT operation not supported on /quizes');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Quizes.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err)).catch((err) => next(err));
    });


quizRouter.route('/:quizId')
    .get((req, res, next) => {
        Quizes.findById(req.params.quizId)
            .then((quiz) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                var html = "<p style = 'text-align: center'><b>" + quiz.name + "</b></p><b>Instructions: </b>" + quiz.instructions + "<br>";
                html = html + "<b>Duration: </b>" + quiz.duration.hours + ":" + quiz.duration.minutes + ":" + quiz.duration.seconds + "<hr>";
                var num = 1;
                for (var i = 0; i < quiz.questions.length; i++) {
                  if (!quiz.questions[i].isEnabled)
                      continue;
                  html = html + num + ". " + quiz.questions[i].question + "  -  " + quiz.questions[i]._id + "<br><div style = 'margin: 10px'>";
                  num = num + 1;
                  for (var j = 0; j < quiz.questions[i].answers.length; j++) {
                    html = html + (j+1) + ". " + quiz.questions[i].answers[j].option + "<br>";
                  }
                  html = html + "</div><b> Answer: </b>" + quiz.questions[i].answer + "<br><b>Explanation: </b>" + quiz.questions[i].explanation + "<br><hr>";
                }
                res.end(html);
            }, (err) => next(err)).catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403 /*Not supported*/
        res.end('POST operation not supported on /quizes/'
            + req.params.quizId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Quizes.findByIdAndUpdate(req.params.quizId, {
            $set: req.body
        }, { new: true })
            .then((quiz) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(quiz);
            }, (err) => next(err)).catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Quizes.findByIdAndRemove(req.params.quizId)
            .then((quiz) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(quiz);
            }, (err) => next(err)).catch((err) => next(err));
    });

/*___________________________________________________*/
/*___________________________________________________*/
/*___________________________________________________*/


quizRouter.route('/:quizId/questions')
    .get((req, res, next) => {
        Quizes.findById(req.params.quizId)
            .then((quiz) => {
                if (quiz != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(quiz.questions);
                }
                else {
                    err = new Error('Quiz ' + req.params.quizId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err)).catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Quizes.findById(req.params.quizId)
            .then((quiz) => {
                if (quiz != null) {
                    quiz.questions.push(req.body);
                    quiz.save()
                        .then((quiz) => {
                            Quizes.findById(quiz._id)
                                .then((quiz) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(quiz);
                                })
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Quiz ' + req.params.quizId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err)).catch((err) => next(err));
    })
    .put((req, res, next) => {
        res.statusCode = 403 /*Not supported*/
        res.end('PUT operation not supported on /quizes'
            + req.params.quizId + '/questions');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Quizes.findById(req.params.quizId)
            .then((quiz) => {
                if (quiz != null) {
                    for (var i = (quiz.questions.length - 1); i >= 0; i--) {
                        quiz.questions.id(quiz.questions[i]._id).remove();
                    }
                    quiz.save()
                        .then((quiz) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(quiz.questions);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Quiz ' + req.params.quizId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err)).catch((err) => next(err));
    });


quizRouter.route('/:quizId/questions/:questionId')
    .get((req, res, next) => {
        Quizes.findById(req.params.quizId)
            .then((quiz) => {
                if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(quiz.questions.id(req.params.questionId));
                }
                else if (quiz == null) {
                    err = new Error('Quiz ' + req.params.quizId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
                else {
                    err = new Error('Question ' + req.params.questionId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err)).catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403 /*Not supported*/
        res.end('POST operation not supported on /quizes/'
            + req.params.quizId + '/questions' + req.params.questionId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Quizes.findById(req.params.quizId)
            .then((quiz) => {

                if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
                    if (req.body.question) {
                        quiz.questions.id(req.params.questionId).question = req.body.question;
                    }
                    if (req.body.answers) {
                        quiz.questions.id(req.params.questionId).answers = req.body.answers;
                    }
                    if (req.body.answer) {
                        quiz.questions.id(req.params.questionId).answer = req.body.answer;
                    }
                    if (req.body.isEnabled != null) {
                        quiz.questions.id(req.params.questionId).isEnabled = req.body.isEnabled;
                    }
                    quiz.save()
                        .then((quiz) => {
                            Quizes.findById(quiz._id)
                                .then((quiz) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(quiz.questions.id(req.params.questionId));
                                })
                        }, (err) => next(err));
                }
                else if (quiz == null) {
                    err = new Error('Quiz ' + req.params.quizId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
                else {
                    err = new Error('Question ' + req.params.questionId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err)).catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Quizes.findById(req.params.quizId)
            .then((quiz) => {
                if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
                    quiz.questions.id(req.params.questionId).remove();
                    quiz.save()
                        .then((quiz) => {
                            Quizes.findById(quiz._id)
                                .then((quiz) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(quiz);
                                })
                        }, (err) => next(err));
                }
                else if (quiz == null) {
                    err = new Error('Quiz ' + req.params.quizId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
                else {
                    err = new Error('Question ' + req.params.questionId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err)).catch((err) => next(err));
    });


module.exports = quizRouter;
