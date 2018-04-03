import axios from 'axios'
import qs from 'qs'
import urls from './urls'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

export function login (user) {
  return axios.post(urls.login, qs.stringify(user))
}
export function logout () {
  return axios.post(urls.logout)
}

export function register (user) {
  return axios.post(urls.register, qs.stringify(user), {withCredentials: true})
}

export function fetchUser () {
  return axios.get(urls.user)
}

export function createRoom (users) {
  return axios.post(urls.room, {
    users: users,
    type: 3,
    status: 1
  })
}

export function checkLiving (id) {
  return axios.post(urls.room, {
    command: 'live',
    user_id: id
  })
}

export function fetchOnlineMembers (limit, page, nickname) {
  return axios.get(`${urls.member}?logined=True&offset=${page * limit}&limit=${limit}${nickname ? '&nickname_q=' + nickname : ''}`)
}

export function updateUser (id, user) {
  return axios.put(`${urls.member}${id}/`, user)
}

export function updatePassword (password) {
  return axios.post(urls.password, qs.stringify(password))
}

export function updateWithdrawPassword (withdrawPassword) {
  return axios.post(urls.withdraw_password, qs.stringify(withdrawPassword))
}

export function getToken (oldToken) {
  if (!oldToken) {
    return
  }
  return axios.post(urls.refresh_token, {
    refresh_token: oldToken
  }).then(
    res => {
      axios.defaults.withCredentials = true
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
      return res
    })
}

export function fetchChatEmoji () {
  return axios.get(`${urls.chatEmoji}`)
}

export function sendImgToChat (data) {
  return axios.post(`${urls.sendImgToChat}`, data)
}

export function fetchAnnouce () {
  return axios.get(`${urls.annoucement}`)
}

export function fetchGlobalData () {
  return axios.get(`${urls.global_preference}`)
}

export function banChatUser (id, data) {
  return axios.put(`${urls.room}${id}/`,
    {
      action: 'banned',
      user: data.user,
      banned_time: data.banned_time
    })
}

export function unbanChatUser (id, data) {
  return axios.put(`${urls.room}${id}/`,
    {
      action: 'unbanned',
      user: data.user,
      banned_time: data.banned_time
    })
}

export function blockChatUser (id, data) {
  return axios.put(`${urls.room}${id}/`,
    {
      action: 'block',
      user: data.user,
      block_time: 60
    })
}

export function unblockChatUser (id, data) {
  return axios.put(`${urls.room}${id}/`,
    {
      action: 'unblock',
      user: data.user
    })
}

export function getChatUser (id) {
  return axios.get(`${urls.room}${id}/`)
}

export function getChatList (pagination) {
  if (!pagination) {
    return axios.get(`${urls.member}chat_list/`)
  }
  return axios.get(`${urls.member}chat_list/?offset=${pagination.offset}&limit=${pagination.limit}`)
}

export function checkUserName (username) {
  return axios.get(urls.check_username, { params: { username: username } })
}

export function setCookie (cookie) {
  return axios.post(urls.setCookie, {cookie}, { 'Content-Type': 'application/json', withCredentials: true })
}

export function getEnvelopeRecord (offset, limit) {
  return axios.get(`${urls.envelope}?offset=${offset}&limit=${limit}`)
}

export function sendEnvelope (data) {
  return axios.post(urls.envelope, {
    sender_id: data.sender_id,
    pack_amount: data.pack_amount,
    pack_nums: data.pack_nums,
    content: data.content
  })
}

export function takeEnvelope (data) {
  return axios.put(`${urls.envelope}${data.envelope_id}/`, {
    receiver_id: data.receiver_id
  })
}

export function buildRoom (data) {
  return axios.post(`${urls.room}`, {
    type: data.type,
    status: data.status,
    last_message: '',
    users: data.users
  })
}

export function fetchMember (userId) {
  return axios.get(`${urls.member}${userId}/`)
}
export function fetchStickers (group) {
  if (group) {
    return axios.get(`${urls.stickers}?group=${group}`)
  }
  return axios.get(`${urls.stickers}`)
}

export function updateMember (userId, remarks) {
  return axios.put(`${urls.member}${userId}/`, {
    remarks: remarks
  })
}

export function fetchCheckinRecord () {
  return axios.get(`${urls.checkin}`)
}

export function checkin () {
  return axios.post(urls.checkin, {platform: 0})
}
