const config = require('./config.json');

const options = {
  logger: {
    level: config.logLevel || 'info',
  },
};

module.exports = options;
