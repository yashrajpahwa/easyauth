const client = require('../config/mongoClient');

let db;

module.exports = {
  connectMongoDB: () => {
    client
      .connect()
      .then((client) => {
        db = client.db('main');
        console.log('connected to mdb');
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  },
  getDB: () => db,
};
