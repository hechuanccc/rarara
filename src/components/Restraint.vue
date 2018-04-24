<template>
  <div class="restraint-dialog">
    <div v-if="restraint.dialogVisible && restraint.content === 'all'">
        <el-menu :default-active="'0'" class="m-b-xlg" mode="horizontal">
          <el-menu-item v-for="(tab, index) in restraint.tabs"
            :key="index"
            :index="index + ''"
            @click.native="switchBlockTab(index)">{{tab.display}}</el-menu-item>
        </el-menu>
        <el-table
          :data="restraint.nowTab === '1' ? manage.bannedUsers : manage.blockedUsers"
          style="width: 100%">
          <el-table-column
            prop="username"
            label="帐号"
            :width="restraint.nowTab === '0' ? 215 : 160">
          </el-table-column>
          <el-table-column
            prop="title"
            label="房间"
            :width="restraint.nowTab === '0' ? 215 : 160">
            <template slot-scope="scope">
              <span>{{scope.row.title + '大厅'}}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="restraint.nowTab === '1'"
            prop="banned_time"
            label="时间(mins)"
            width="160">
          </el-table-column>
          <el-table-column
            label="操作"
            :width="restraint.nowTab === '0' ? 215 : 160">
            <template slot-scope="scope">
              <el-button v-if="restraint.nowTab === '1'"
                size="mini"
                type="danger"
                @click.native="unban(scope.row.username, scope.row.room_id)">解除</el-button>
              <el-button v-else
                size="mini"
                type="danger"
                @click.native="unblock(scope.row.username, scope.row.room_id)">解除</el-button>
            </template>
          </el-table-column>
        </el-table>
    </div>

    <div class="member-area" v-if="restraint.dialogVisible && restraint.content === 'single'">
      <div class="information text-center" v-if="restraint.user">
        <div class="avatar">
          <img class="img" v-if="restraint.user.avatar" :src="restraint.user.avatar" alt="avatar">
          <img class="img" v-else :src="require('../assets/avatar.png')" alt="default">
        </div>
        <div class="m-t">
          {{restraint.user.nickname || restraint.user.username}}
          <div>
            <span v-for="(role, index) in restraint.user.roles" :key="index">
              ({{role.display_name}})
            </span>
          </div>
        </div>
      </div>
      <div slot="footer"
        class="m-t-lg actions text-center"
        v-if="typeof(isBanned) === 'boolean' || typeof(isBlocked) === 'boolean'">
        <el-button type="danger" v-if="!isBanned" @click.native="ban(15, chat.current.roomId)">禁言15分钟</el-button>
        <el-button type="danger" v-if="!isBanned" @click.native="ban(30, chat.current.roomId)">禁言30分钟</el-button>
        <el-button type="danger" v-if="!isBlocked" @click.native="block(chat.current.roomId)">加入黑名单</el-button>
        <el-button type="danger" v-if="isBlocked" @click.native="unblock(restraint.user.username, chat.current.roomId)">解除拉黑</el-button>
        <el-button type="danger" v-if="isBanned" @click.native="unban(restraint.user.username, chat.current.roomId)">解除禁言</el-button>
      </div>
    </div>

  </div>
</template>

<script>
import { banChatUser, blockChatUser, unbanChatUser, unblockChatUser, getChatUser, getAllChatUser } from '../api'
import { mapState } from 'vuex'

export default {
  props: {
    restraint: {
      type: Object
    }
  },
  data () {
    return {
      isBanned: undefined,
      isBlocked: undefined,
      manage: {
        usersStatus: null,
        userArr: null,
        bannedUsers: [],
        blockedUsers: []
      }
    }
  },
  methods: {
    switchBlockTab (index) {
      this.restraint.nowTab = index + ''
    },
    ban (mins, roomId) {
      banChatUser(roomId || this.user.default_room_id, {
        user: this.restraint.user.username,
        banned_time: mins
      }).then((data) => {
        this.getUser()
        this.restraint.dialogVisible = false
        this.$emit('handleUserRestraint', {user: this.restraint.user.username, action: 'ban'})
        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.restraint.dialogVisible = false
        this.$message({
          showClose: true,
          message: errorMsg,
          type: 'error'
        })
      })
    },
    unban (user, roomId) {
      unbanChatUser(roomId || this.user.default_room_id, {
        user: user
      }).then((data) => {
        this.getUser()
        this.restraint.dialogVisible = false
        this.$emit('handleUserRelease', {user: user, action: 'unban'})

        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.restraint.dialogVisible = false
        let data = errorMsg.response.data
        this.$message({
          showClose: true,
          message: data.error,
          type: 'error'
        })
      })
    },
    block (roomId) {
      blockChatUser(roomId || this.user.default_room_id, {
        user: this.restraint.user.username
      }).then((data) => {
        this.getUser()
        this.restraint.dialogVisible = false
        this.$emit('handleUserRestraint', {user: this.restraint.user.username, action: 'block'})

        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.restraint.dialogVisible = false
        this.$message({
          showClose: true,
          message: errorMsg.response.data.error,
          type: 'error'
        })
      })
    },
    unblock (user, roomId) {
      unblockChatUser(roomId || this.user.default_room_id, {
        user: user
      }).then((data) => {
        this.getUser()
        this.restraint.dialogVisible = false
        this.$emit('handleUserRelease', {user: user, action: 'unblock'})

        this.$message({
          showClose: true,
          message: data.status,
          type: 'success'
        })
      }, errorMsg => {
        this.restraint.dialogVisible = false
        let data = errorMsg.response.data
        this.$message({
          showClose: true,
          message: data.error,
          type: 'error'
        })
      })
    },
    getUser () {
      // forSingle
      getChatUser(this.user.default_room_id).then(response => {
        this.$emit('updateUsers', {banned_users: response.banned_users, block_users: response.block_users})

        if (!response.banned_users.length || !response.block_users.length) {
          this.isBanned = false
          this.isBlocked = false
        }

        let newBannedUsers = response.banned_users.map((member) => member.username)
        let newBlockUsers = response.block_users.map((member) => member.username)

        this.isBanned = newBannedUsers.includes(this.restraint.user.username)
        this.isBlocked = newBlockUsers.includes(this.restraint.user.username)
      })
    },
    getRoomsUsers () {
      // for all
      getAllChatUser().then(response => {
        this.manage.userArr = response

        let temp = {}
        response.forEach((room) => {
          console.log(room)

          temp[room.id] = {
            title: room.title,
            banned_users: room.banned_users,
            block_users: room.block_users
          }

          room.banned_users.forEach((user) => {
            user.title = room.title
            user.room_id = room.id
          })
          room.block_users.forEach((user) => {
            user.title = room.title
            user.room_id = room.id
          })

          this.manage.bannedUsers.push(...room.banned_users)
          this.manage.blockedUsers.push(...room.block_users)
        })

        this.manage.usersStatus = temp
      })
    }
  },
  computed: {
    ...mapState([
      'user',
      'chat'
    ])
  },
  watch: {
    'restraint.user.username': function () {
      this.getUser()
    }
  },
  created () {
    if (this.restraint.content === 'single') {
      this.getUser()
    } else {
      this.getRoomsUsers()
    }
  }
}
</script>

<style lang="scss" scoped>
.restraint-dialog {
  min-height: 200px;
  .avatar {
    margin: 0 auto;
    width: 120px;
    height: 120px;
    .img {
      width: 100%;
      height: 100%;
      border-radius: 5px;
    }
  }

  .member-area {
    min-height: 230px;
  }
}
</style>


