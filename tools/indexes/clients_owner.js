const dotenv = require('dotenv');
dotenv.config({ path: '../../config/.env' });

// Importing MongoClient from mongodb driver
const { MongoClient } = require('mongodb');

// Conencting to a local port
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

connect();

// ESNext syntax using async-await
async function connect() {
  try {
    await client.connect();
    const db = client.db('main');
    let result = await db.collection('clients').createIndex({ owner: 1 });
    console.log(`Index created: ${result}`);
  } catch (err) {
    console.error(`we encountered ${err}`);
  } finally {
    client.close();
  }
}
