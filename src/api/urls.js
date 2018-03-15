'use strict'
const config = require('../../config')
const env = process.env.NODE_ENV === 'development' ? config.dev.env : config.build.env
const host = env.HOST.replace(/"/g, '')
const apiv1 = host + '/v1/member'
const ghost = env.ghost.replace(/"/g, '')
const decode = env.decode_key

export default {
  domain: host,
  login: host + '/login/',
  register: host + '/v1/register/',
  member: host + '/v1/member/user/',
  user: host + '/v1/token/identity/',
  logout: host + '/logout/',
  chatEmoji: host + '/v1/emoji/',
  sendImgToChat: host + '/v1/image/',
  annoucement: apiv1 + '/announcement/',
  latest_results: ghost + '/latest_results/',
  memberRoom: host + '/v1/member/room/',
  room: host + '/v1/room/',
  global_preference: host + '/v1/global-data/',
  check_username: host + '/v1/user/check/',
  setCookie: host + '/set_cookie/',
  envelope: host + '/v1/envelope/',
  decode
}
