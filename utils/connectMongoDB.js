const client = require('../config/mongoClient');

async function connectMongoDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db('admin').command({ ping: 1 });
    db = client.db(process.env.MONGO_DB_NAME);
    console.log('Connected successfully to server: express');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = connectMongoDB;
