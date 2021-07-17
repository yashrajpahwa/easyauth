const express = require('express');
const dotenv = require('dotenv');

// Import middlewares
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middlewares/errors');

// Import success response class
const SuccessResponse = require('./utils/successResponse');

// Import mongo client
const client = require('./config/mongoClient');

// Initialze app
const app = express();

// Configure dotenv
const envOptions = require('./config/envOptions');
dotenv.config(envOptions);

// Use CORS
app.use(cors());

// Use helmet
app.use(helmet());

// Use express json parser
app.use(express.json());

// Sanitize mongodb data
app.use(mongoSanitize());

app.get('/', async (req, res) => {
  collection = db.collection('users');
  const data = await collection.find({ name: 'parth' }).toArray();
  res.status(200).json(new SuccessResponse('healthy', res.statusCode, data));
});

app.post('/', async (req, res) => {
  collection = db.collection('users');
  const data = await collection.insertOne({ name: 'dherya' });
  res.status(200).json(new SuccessResponse('healthy', res.statusCode, data));
});

// Use error handler
app.use(errorHandler);

const port = process.env.PORT || 5000;

let db;

async function connectMongoDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db('admin').command({ ping: 1 });
    db = await client.db(process.env.MONGO_DB_NAME);
    console.log('Connected successfully to server: express');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

connectMongoDB().then(() =>
  app.listen(port, () =>
    console.log(`Listening on port ${port} in ${process.env.NODE_ENV} mode`)
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error [UHP]: ${err.message}`);
  // Close server connection
  process.exit(1);
});

// End all
