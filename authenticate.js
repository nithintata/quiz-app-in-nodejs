exports.verifyUser =  (req, res, next) => {

  console.log(req.headers);

  var authHeader = req.headers.authorization;

  if(!authHeader) {
    var err = new Error('You are not authosrised');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
  }

  var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(":");
  var username = auth[0];
  var password = auth[1];

  if (username === 'admin' && password === 'password') {
    next();
  }
  else {
    var err = new Error('password is incorrect');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
  }
}
