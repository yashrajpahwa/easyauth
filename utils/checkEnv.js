const checkEnv = (environment) => {
  const nodeEnvOpts = ['development', 'production'];
  if (!nodeEnvOpts.includes(environment.NODE_ENV)) {
    throw new Error('Please enter a valid option for NODE_ENV');
  }

  const { MONGO_DB_NAME, MONGO_URI, REDIS_PORT, SENTRY_DSN } = environment;
  if (!MONGO_DB_NAME || !MONGO_URI || !REDIS_PORT || !SENTRY_DSN) {
    throw new Error('Please enter valid values for the environment variables');
  }
};

module.exports = checkEnv;
