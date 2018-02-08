export default {
  user: (state, getters) => {
    return state.user
  },
  myRoles: (state, getters) => {
    return state.user.roles.map(role => role.name)
  }
}
