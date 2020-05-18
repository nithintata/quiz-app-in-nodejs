exports.verifyUser =  (req, res, next) => {

  console.log(req.signedCookies);

  if(!req.signedCookies.user) {
    var authHeader = req.headers.authorization;

    if(!authHeader) {
      var err = new Error('You are not authosrised');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(":");
    var username = auth[0];
    var password = auth[1];

    if (username === 'admin' && password === 'password') {
      res.cookie('user', 'admin', {signed: true})
      next();
    }
    else {
      var err = new Error('password is incorrect');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  }

  else {
    if(req.signedCookies.user === 'admin') {
      next();
    }
    else {
      var err = new Error('cookie is invalid');

      err.status = 401;
      return next(err);
    }
  }
}
