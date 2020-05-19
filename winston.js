var winston = require('winston');

var options = {
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
  file: {
    level: 'info',
    filename: './logs/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
};

//var logger = new winston.Logger
var logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false,
});

// for integrating with morgan
logger.stream = {
  write: function(message, encoding) {
  logger.info(message);
  },
};

module.exports = logger;
