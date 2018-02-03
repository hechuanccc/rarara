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
  return axios.post(urls.register, qs.stringify(user))
}

export function fetchUser () {
  return axios.get(urls.user)
}

export function fetchMemberRoom (limit, page) {
  return axios.get(`${urls.memberRoom}?offset=${page * limit}&limit=${limit}`)
}

export function createRoom (users) {
  return axios.post(urls.room, {
    users: users,
    type: 2,
    status: 1
  })
}

export function fetchOnlineMembers (limit, page) {
  return axios.get(`${urls.member}?logined=True&offset=${page * limit}&limit=${limit}`)
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
