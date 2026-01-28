const getNow = (req) => {
  if (process.env.TEST_MODE === '1' && req && req.headers['x-test-now-ms']) {
    return parseInt(req.headers['x-test-now-ms'], 10);
  }
  return Date.now();
};

module.exports = { getNow };
