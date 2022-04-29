const fs = require('fs');

module.exports = {
  publicPath: '/',
  devServer: {
    https: {
      key: fs.readFileSync('./sslcert/key.pem'),
      cert: fs.readFileSync('./sslcert/cert.pem'),
    },
  },
  configureWebpack: {
    devtool: 'source-map',
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: './src/assets/img/favicon.png',
        },
        productName: 'ДУ-58',
      },
    },
  },
}
