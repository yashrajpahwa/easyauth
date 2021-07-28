const argon2 = require('argon2');
const { exit } = require('process');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Password - ', async (pwd) => {
  const hashedPassword = await argon2.hash(pwd);
  console.log(hashedPassword);
  exit(0);
});
