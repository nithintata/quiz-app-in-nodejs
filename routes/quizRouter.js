const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const Quizes = require("../models/quizes");

const quizRouter = express.Router();
quizRouter.use(bodyParser.json());

quizRouter.route('/')
    .get((req, res, next) => {
        Quizes.find({})
            .then((quizes) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(quizes);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
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
    .delete((req, res, next) => {
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
                res.setHeader('Content-Type', 'application/json');
                res.json(quiz);
            }, (err) => next(err)).catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403 /*Not supported*/
        res.end('POST operation not supported on /quizes/'
            + req.params.quizId);
    })
    .put((req, res, next) => {
        Quizes.findByIdAndUpdate(req.params.quizId, {
            $set: req.body
        }, { new: true })
            .then((quiz) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(quiz);
            }, (err) => next(err)).catch((err) => next(err));
    })
    .delete((req, res, next) => {
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
    .post((req, res, next) => {
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
                                    res.json(quiz.questions);
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
    .delete((req, res, next) => {
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
    .put((req, res, next) => {
        Quizes.findById(req.params.quizId)
            .then((quiz) => {
                if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
                    if (req.body.rating) {
                        quiz.questions.id(req.params.questionId).rating = req.body.rating;
                    }
                    if (req.body.question) {
                        quiz.questions.id(req.params.questionId).question = req.body.question;
                    }
                    quiz.save()
                        .then((quiz) => {
                            Quizes.findById(quiz._id)
                                .then((quiz) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(quiz.questions);
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
    .delete((req, res, next) => {
        Quizes.findById(req.params.quizId)
            .then((quiz) => {
                if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
                    quiz.questions.id(req.params.questionId).remove();
                    quiz.save()
                        .then((quiz) => {
                            Quizes.findById(quiz._id)
                                .populate('questions.author')
                                .then((quiz) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(quiz.questions);
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
