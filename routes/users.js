const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../models/Users");

const { hashPassword, genRandomString } = require("../Utils/utils");

const { generateToken, verifyUser, verifyAdmin } = require("../authenticate");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/test", verifyUser, function (req, res, next) {
  console.log(req.user);

  res.send("respond with a resource");
});

router.get("/test1", verifyUser, verifyAdmin, function (req, res, next) {
  console.log(req.user);

  res.send("respond with a resource from test1 ");
});

router.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing Fields" });
  } else if (username.length < 3 || username.length > 64) {
    return Response(res, "Username");
  } else if (password.length < 6 || password.length > 64) {
    return Response(res, "Password");
  }

  try {
    const user = await User.findOne({ username });
    if (user) {
      return res
        .status(409)
        .json({ error: "User with this username already exists" });
    }

    try {
      let userCreated = await CreateUser(username, password);

      res.status(201).json({
        message: "Signup Success",
        username: userCreated.username,
      });
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(401).json({
        success: false,
        status: "Login Unsuccessfull",
        err: info,
      });
      return;
    }
    req.logIn(user, (err) => {
      if (err) {
        res.status(401).json({
          success: false,
          status: "Login Unsuccessfull",
          err: `Could Not Login, ${err}`,
        });
      }

      let token = generateToken({ _id: user._id });
      res.status(200).json({
        success: true,
        status: "Login successfull",
        token,
      });
    });
  })(req, res, next);
});

module.exports = router;
function Response(res, Message) {
  return res.status(400).json({
    error: `${Message} should be greater than 3 and less than 64 characters`,
  });
}

async function CreateUser(username, password) {
  const Salt = genRandomString(16);
  let newUser = new User({
    username,
    passwordSalt: Salt,
    passwordHash: await hashPassword(password, Salt),
  });
  let userCreated = await newUser.save();
  return userCreated;
}
