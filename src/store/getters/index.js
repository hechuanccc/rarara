export default {
  user: (state, getters) => {
    return state.user
  },
  myRoles: (state, getters) => {
    return state.user.roles.map(role => role.name)
  },
  privateChats: (state, getters) => {
    return state.chatList.filter(obj => obj.id !== 1)
  }
}
