const crypto = require("crypto");

const genRandomString = function (length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex") /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

const hashPassword = async (password, salt) => {
  let config = {
    iterations: 1000,
  };
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      config.iterations,
      32,
      "sha512",
      (err, derivedKey) =>
        err ? reject(err) : resolve(derivedKey.toString("hex"))
    );
  });
};

const comparePassword = async (userPassword, userSalt, password) => {
  return userPassword === (await hashPassword(password, userSalt));
};

module.exports = {
  hashPassword,
  genRandomString,
  comparePassword,
};
