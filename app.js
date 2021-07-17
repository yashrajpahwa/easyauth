const fastifyOptions = require('./config/fastifyOptions');
const fastify = require('fastify')(fastifyOptions);

const cors = require('fastify-cors');
const helmet = require('fastify-helmet');
const swagger = require('fastify-swagger');
const dotenv = require('dotenv');

const swaggerOptions = require('./config/swaggerOptions');
const envOptions = require('./config/envOptions');

dotenv.config(envOptions);
fastify.register(cors);
fastify.register(helmet);
fastify.register(swagger, swaggerOptions);

fastify.get('/', async (req, res) => {
  return { message: 'Server is running' };
});

const start = async () => {
  const port = process.env.PORT || 5000;
  try {
    await fastify.listen(port);
    console.log(`Server listening at port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

// End all
