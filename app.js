const express = require('express');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const dotenv = require('dotenv');

// Import middlewares
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middlewares/errors');

// Import routes
const routes = require(`./routes`);

// Initialze app
const app = express();

// Configure dotenv
const envOptions = require('./config/envOptions');
const ErrorResponse = require('./utils/errorResponse');
const mongoUtil = require('./utils/mongoUtil');
dotenv.config(envOptions);

// Initialize Sentry
Sentry.init({
  dsn: 'https://9261a5ca9549403db9eac9a0d09c3719@o530119.ingest.sentry.io/5888096',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler({ ip: true }));
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// Use CORS
app.use(cors());

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

app.listen(port, () =>
  console.log(`Listening on port ${port} in ${process.env.NODE_ENV} mode`)
);
mongoUtil.connectMongoDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error [UHP]: ${err.message}`);
  // Close server connection
  process.exit(1);
});

// End all
