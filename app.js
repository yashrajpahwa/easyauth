const express = require('express');
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
