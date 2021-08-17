const express = require('express');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const dotenv = require('dotenv');
const ErrorResponse = require('./utils/errorResponse');
const mongoUtil = require('./utils/mongoUtil');
const checkEnv = require('./utils/checkEnv');

// Import middlewares
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middlewares/errors');

// Import routes
const routes = require(`./routes`);

// Initialze app
const app = express();

// Configure dotenv
const envOptions = require('./config/envOptions');
dotenv.config(envOptions);

// Check environment variables
checkEnv(process.env);

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: process.env.SENTRY_SHOULD_TRACE }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler({ ip: process.env.SENTRY_COLLECT_IP }));
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// Use cookie parser
app.use(cookieParser());

// Use CORS
const corsOrigin = process.env.CORS_ORIGIN.split(',');

const corsOptions = {
  origin: corsOrigin,
  optionsSuccessStatus: 200,
};

if (process.env.ALLOW_CREDENTIALS_HEADER === 'true') {
  corsOptions.credentials = true;
}

app.use(cors(corsOptions));

// Use helmet
app.use(helmet());

// Use express json parser
app.use(express.json());

// Sanitize mongodb data
app.use(mongoSanitize());

app.use((req, res, next) => {
  if (!mongoUtil.getDB()) {
    res.send(new ErrorResponse('Connecting to network', res));
  } else {
    next();
  }
});

app.use('/api/v1', routes);

// Sentry error handler
app.use(Sentry.Handlers.errorHandler());

// Use error handler
app.use(errorHandler);

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port} in ${process.env.NODE_ENV} mode`);
  mongoUtil.connectMongoDB();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error [UHP]: ${err.message}`);
  // Close server connection
  server.close(() => process.exit(1));
});

// End all
