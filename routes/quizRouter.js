const express = require("express");
const {verifyUser, verifyAdmin} = require("../authenticate");

const Quizes = require("../models/quizes");

const quizRouter = express.Router();

quizRouter.route("/")
    .get(verifyUser,
         (req, res, next) => {
           Quizes.find({isEnabled : true})
               .then(
                   (quizes) => {
                     res.statusCode = 200;
                     res.setHeader("Content-Type", "text/plain");
                     var text = "";
                     for (var i = 0; i < quizes.length; i++)
                       text = text + "<b>Name: </b>" + quizes[i].name + "<br>" +
                              "<b>id:</b> " + quizes[i]._id + "<br><hr>";
                     res.end(text);
                   },
                   (err) => next(err))
               .catch((err) => next(err));
         })
    .post(verifyUser, verifyAdmin,
          (req, res, next) => {
            Quizes.create(req.body)
                .then(
                    (quiz) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(quiz);
                    },
                    (err) => next(err))
                .catch((err) => next(err));
          })
    .put(verifyUser,
         (req, res, next) => {
           res.statusCode = 403; /*Not supported*/
           res.end("PUT operation not supported on /quizes");
         })
    .delete(verifyUser, verifyAdmin, (req, res, next) => {
      Quizes.deleteMany({})
          .then(
              (resp) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(resp);
              },
              (err) => next(err))
          .catch((err) => next(err));
    });

quizRouter.route("/:quizId")
    .get(verifyUser,
         (req, res, next) => {
           Quizes
               .findById(req.params.quizId, {
                 "questions.createdAt" : 0,
                 "questions.updatedAt" : 0,
               })
               .select("-__v -createdAt -updatedAt")
               .then((quiz) => { res.status(200).json(quiz); },
                     (err) => next(err))
               .catch((err) => next(err));
         })
    .post(verifyUser,
          (req, res, next) => {
            res.statusCode = 403; /*Not supported*/
            res.end("POST operation not supported on /quizes/" +
                    req.params.quizId);
          })
    .put(verifyUser, verifyAdmin,
         (req, res, next) => {
           Quizes
               .findByIdAndUpdate(req.params.quizId, {
                 $set : req.body,
               },
                                  {new : true})
               .then(
                   (quiz) => {
                     res.statusCode = 200;
                     res.setHeader("Content-Type", "application/json");
                     res.json(quiz);
                   },
                   (err) => next(err))
               .catch((err) => next(err));
         })
    .delete(verifyUser, verifyAdmin, (req, res, next) => {
      Quizes.deleteOne({_id : req.params.quizId})
          .then(
              (quiz) => {
                res.statusCode = 204;
                res.setHeader("Content-Type", "application/json");
                res.json(quiz);
              },
              (err) => next(err))
          .catch((err) => next(err));
    });

/*___________________________________________________*/
/*___________________________________________________*/
/*___________________________________________________*/

quizRouter.route("/:quizId/questions")
    .get(verifyUser,
         (req, res, next) => {
           Quizes
               .findById(req.params.quizId, {
                 "questions.createdAt" : 0,
                 "questions.updatedAt" : 0,
               })
               .then(
                   (quiz) => {
                     if (quiz != null) {
                       res.statusCode = 200;
                       res.setHeader("Content-Type", "application/json");
                       res.json(quiz.questions);
                     } else {
                       err = new Error("Quiz " + req.params.quizId +
                                       " not found");
                       err.statusCode = 404;
                       return next(err);
                     }
                   },
                   (err) => next(err))
               .catch((err) => next(err));
         })
    .post(
        verifyUser, verifyAdmin,
        (req, res, next) => {
          Quizes.findById(req.params.quizId)
              .then(
                  (quiz) => {
                    if (quiz != null) {
                      quiz.questions.push(req.body);
                      quiz.save().then((quiz) => {
                        Quizes
                            .findById(quiz._id, {
                              "questions.createdAt" : 0,
                              "questions.updatedAt" : 0,
                            })
                            .select("-__v -createdAt -updatedAt")
                            .then((quiz) => {
                              res.statusCode = 201;
                              res.setHeader("Content-Type", "application/json");
                              res.json(quiz);
                            });
                      }, (err) => next(err));
                    } else {
                      err =
                          new Error("Quiz " + req.params.quizId + " not found");
                      err.statusCode = 404;
                      return next(err);
                    }
                  },
                  (err) => next(err))
              .catch((err) => next(err));
        })
    .put(verifyUser,
         (req, res, next) => {
           res.statusCode = 403; /*Not supported*/
           res.end("PUT operation not supported on /quizes" +
                   req.params.quizId + "/questions");
         })
    .delete(verifyUser, verifyAdmin, (req, res, next) => {
      console.log(req.user);
      Quizes.findById(req.params.quizId)
          .then(
              (quiz) => {
                if (quiz != null) {
                  quiz.questions.splice(0, quiz.questions.length);
                  quiz.save().then((quiz) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(quiz.questions);
                  }, (err) => next(err));
                } else {
                  err = new Error("Quiz " + req.params.quizId + " not found");
                  err.statusCode = 404;
                  return next(err);
                }
              },
              (err) => next(err))
          .catch((err) => next(err));
    });

quizRouter.route("/:quizId/questions/:questionId")
    .get(verifyUser,
         (req, res, next) => {
           Quizes
               .findById(req.params.quizId, {
                 "questions.createdAt" : 0,
                 "questions.updatedAt" : 0,
               })
               .select("-__v -createdAt -updatedAt")
               .then(
                   (quiz) => {
                     if (quiz != null &&
                         quiz.questions.id(req.params.questionId) != null) {
                       res.statusCode = 200;
                       res.setHeader("Content-Type", "application/json");
                       res.json(quiz.questions.id(req.params.questionId));
                     } else if (quiz == null) {
                       err = new Error("Quiz " + req.params.quizId +
                                       " not found");
                       err.statusCode = 404;
                       return next(err);
                     } else {
                       err = new Error("Question " + req.params.questionId +
                                       " not found");
                       err.statusCode = 404;
                       return next(err);
                     }
                   },
                   (err) => next(err))
               .catch((err) => next(err));
         })
    .post(verifyUser, verifyAdmin,
          (req, res, next) => {
            res.statusCode = 403; /*Not supported*/
            res.end("POST operation not supported on /quizes/" +
                    req.params.quizId + "/questions" + req.params.questionId);
          })
    .put(
        verifyUser, verifyAdmin,
        (req, res, next) => {
          Quizes.findById(req.params.quizId)
              .then(
                  (quiz) => {
                    if (quiz != null &&
                        quiz.questions.id(req.params.questionId) != null) {
                      if (req.body.question) {
                        quiz.questions.id(req.params.questionId).question =
                            req.body.question;
                      }
                      if (req.body.answers) {
                        quiz.questions.id(req.params.questionId).answers =
                            req.body.answers;
                      }
                      if (req.body.answer) {
                        quiz.questions.id(req.params.questionId).answer =
                            req.body.answer;
                      }
                      if (req.body.isEnabled != null) {
                        quiz.questions.id(req.params.questionId).isEnabled =
                            req.body.isEnabled;
                      }
                      quiz.save().then((quiz) => {
                        Quizes
                            .findById(quiz._id, {
                              "questions.createdAt" : 0,
                              "questions.updatedAt" : 0,
                            })
                            .select("-__v -createdAt -updatedAt")
                            .then((quiz) => {
                              res.statusCode = 204;
                              res.setHeader("Content-Type", "application/json");
                              res.json(
                                  quiz.questions.id(req.params.questionId));
                            });
                      }, (err) => next(err));
                    } else if (quiz == null) {
                      err =
                          new Error("Quiz " + req.params.quizId + " not found");
                      err.statusCode = 404;
                      return next(err);
                    } else {
                      err = new Error("Question " + req.params.questionId +
                                      " not found");
                      err.statusCode = 404;
                      return next(err);
                    }
                  },
                  (err) => next(err))
              .catch((err) => next(err));
        })
    .delete(verifyUser, verifyAdmin, (req, res, next) => {
      Quizes.findById(req.params.quizId)
          .then(
              (quiz) => {
                if (quiz != null &&
                    quiz.questions.id(req.params.questionId) != null) {
                  quiz.questions.id(req.params.questionId).remove();
                  quiz.save().then((quiz) => {
                    Quizes
                        .findById(quiz._id, {
                          "questions.createdAt" : 0,
                          "questions.updatedAt" : 0,
                        })
                        .select("-__v -createdAt -updatedAt")
                        .then((quiz) => {
                          res.statusCode = 204;
                          res.setHeader("Content-Type", "application/json");
                          res.json(quiz);
                        });
                  }, (err) => next(err));
                } else if (quiz == null) {
                  err = new Error("Quiz " + req.params.quizId + " not found");
                  err.statusCode = 404;
                  return next(err);
                } else {
                  err = new Error("Question " + req.params.questionId +
                                  " not found");
                  err.statusCode = 404;
                  return next(err);
                }
              },
              (err) => next(err))
          .catch((err) => next(err));
    });

module.exports = quizRouter;
