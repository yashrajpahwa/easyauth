const config = require('./config.json');

const options = {
  routePrefix: config.docsPrefix,
  swagger: {
    info: {
      title: 'Easyauth Documentation',
      version: '0.1.0',
    },
  },
  uiConfig: {
    docExpansion: 'full',
    deepLinking: true,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  exposeRoute: config.docs,
};

module.exports = options;
