const fs = require('fs');

module.exports = {
  publicPath: '/',
  devServer: {
    https: {
      key: fs.readFileSync('./sslcert/key.pem'),
      cert: fs.readFileSync('./sslcert/cert.pem'),
    },
  },
}
