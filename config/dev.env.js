'use strict'
var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // HOST: '"http://2e2d1a08-4238-4165-9703-5f6a955fb6df.node.dockerapp.io:8003"',
  HOST: '"/api"',
  chatHost: '"ws://2e2d1a08-4238-4165-9703-5f6a955fb6df.node.dockerapp.io:8003"',
  ghost: '"http://a546542.eastasia.cloudapp.azure.com:8000"',
  decode_key: '"61Q3hC6jEvfQrwQvMd80fPm2XEqDPJhB"'
})
