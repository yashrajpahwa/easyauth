const client = require('../config/mongoClient');

let db;

exports.findMany = (collection, filter) => {
  const query = { ...filter };
  return new Promise(async (resolve, reject) => {
    const dbCollection = db.collection(collection);
    const dataCursor = await dbCollection.find(query);
    if ((await dataCursor.count()) === 0) reject({ name: 'NoDataFound' });
    let data = [];
    await dataCursor.forEach((c) => data.push(c));
    resolve(data);
  });
};

exports.connectMongoDB = () => {
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
};

exports.getDB = () => db;
