'use strict'
const config = require('../../config')
const env = process.env.NODE_ENV === 'development' ? config.dev.env : config.build.env
const host = env.HOST.replace(/"/g, '')
const apiv1 = host + '/v1/member'

export default {
  domain: host,
  login: host + '/login/',
  register: host + '/v1/register/',
  user: host + '/v1/user/my',
  member: host + '/v1/user/',
  logout: host + '/logout/',
  chatEmoji: host + '/v1/emoji/',
  sendImgToChat: host + '/v1/image/',
  annoucement: apiv1 + '/announcement/'
}
