// returns an object with the cookies' name as keys
const getCookies = (req) => {
  // We extract the raw cookies from the request headers
  const rawCookies = req.headers.cookie.split('; ');
  // rawCookies = ['myapp=secretcookie, 'analytics_cookie=beacon;']

  const cookies = {};
  rawCookies.forEach((rawCookie) => {
    const parsedCookie = rawCookie.split('=');
    // parsedCookie = ['myapp', 'secretcookie'], ['analytics_cookie', 'beacon']
    cookies[parsedCookie[0]] = parsedCookie[1];
  });
  return cookies;
};

module.exports = getCookies;
