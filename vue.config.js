const fs = require('fs');

module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync('./sslcert/key.pem'),
      cert: fs.readFileSync('./sslcert/cert.pem'),
    },
    public: 'https://localhost:8080/',
  },
}
