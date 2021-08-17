const checkEnv = (environment) => {
  function Warning(name, message) {
    this.name = name;
    this.message = message;
  }

  const nodeEnvOpts = ['development', 'production'];
  if (!nodeEnvOpts.includes(environment.NODE_ENV)) {
    throw new Error('Please enter a valid option for NODE_ENV');
  }

  const {
    MONGO_URI,
    MONGO_DB_NAME,
    REDIS_PORT,
    SENTRY_DSN,
    SENTRY_COLLECT_IP,
    SENTRY_SHOULD_TRACE,
    SENTRY_TRACES_SAMPLE_RATE,
    SESSION_TOKEN_EXPIRY,
    ACCESS_TOKEN_EXPIRY,
    CORS_ORIGIN,
  } = environment;
  if (
    !MONGO_DB_NAME ||
    !MONGO_URI ||
    !REDIS_PORT ||
    !SENTRY_DSN ||
    !SESSION_TOKEN_EXPIRY ||
    !ACCESS_TOKEN_EXPIRY ||
    !CORS_ORIGIN ||
    !SENTRY_COLLECT_IP ||
    !SENTRY_SHOULD_TRACE ||
    !SENTRY_TRACES_SAMPLE_RATE
  ) {
    throw new Error('Please enter valid values for the environment variables');
  }

  console.log(parseFloat(SENTRY_TRACES_SAMPLE_RATE));

  const strBools = ['true', 'false'];
  if (
    !strBools.includes(SENTRY_COLLECT_IP) ||
    !strBools.includes(SENTRY_SHOULD_TRACE)
  ) {
    throw new Error('Please enter booleans for these variables');
  }

  const isInteger = (value) => /^\d+$/.test(value);

  if (isInteger(REDIS_PORT) === false)
    throw new Error('REDIS_PORT should be an integer');
  if (isInteger(SESSION_TOKEN_EXPIRY) === false)
    throw new Error('SESSION_TOKEN_EXPIRY should be an integer');
  if (isInteger(ACCESS_TOKEN_EXPIRY) === false)
    throw new Error('ACCESS_TOKEN_EXPIRY should be an integer');

  if (parseInt(ACCESS_TOKEN_EXPIRY) < 1 || parseInt(SESSION_TOKEN_EXPIRY) < 1) {
    throw new Error('Minimum value of ACCESS_TOKEN_EXPIRY should be 1');
  }
  if (parseInt(ACCESS_TOKEN_EXPIRY) > 60) {
    console.log(
      new Warning('TokenExpiryTooLong', 'Access tokens should be short lived')
    );
  }
};

module.exports = checkEnv;
