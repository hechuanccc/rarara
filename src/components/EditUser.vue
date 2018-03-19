<template>
  <div class="edit-container">
    <el-form :model="member"
      v-if="member.username"
      status-icon
      class="info-area"
      ref="editUser">
      <div class="text-center m-b">
        <img class="avatar-img" :src="member.avatar ? member.avatar : defaultAvatar" :alt="member.username">
      </div>
      <el-form-item label="用户名" label-width="85px">
        <span class="member-info">{{member.username}}</span>
      </el-form-item>
      <el-form-item label="昵称" label-width="85px">
        <p class="member-info">{{member.nickname ? member.nickname : ''}}</p>
      </el-form-item>
      <el-form-item label="是否在线" label-width="85px">
        <p class="member-info">{{member.logined | whether}}</p>
      </el-form-item>
      <el-form-item label="是否禁言" label-width="85px">
        <p class="member-info">{{member.banned | whether}}</p>
      </el-form-item>
      <el-form-item label="是否拉黑" label-width="85px">
        <p class="member-info">{{member.is_blocked | whether}}</p>
      </el-form-item>
      <el-form-item label="备注" label-width="85px">
        <el-input
          type="textarea"
          :rows="2"
          @input="check"
          placeholder="请输入内容"
          v-model="member.remarks">
        </el-input>
      </el-form-item>
      <el-form-item label-width="85px">
        <div v-if="changed.message" class="green">{{changed.message}}</div>
        <el-button class="profile-submit"
          type="primary"
          @click.native="updateMember"
          :autosize="true"
          :disabled="!changed.result && !loading">
          修改备注
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>


<script>
import { fetchMember, updateMember } from '../api'
import { msgFormatter } from '../utils'

export default {
  props: {
    userId: {
      type: Number
    }
  },
  data () {
    return {
      member: {
        remarks: '',
        banned: false,
        is_blocked: false,
        logined: false
      },
      changed: {
        message: '',
        oldContent: '',
        result: false
      },
      defaultAvatar: require('../assets/avatar.png'),
      loading: false
    }
  },
  filters: {
    whether: function (val) {
      return val ? '是' : '否'
    }
  },
  methods: {
    fetchMember () {
      this.loading = true

      fetchMember(this.userId).then(res => {
        this.changed.oldContent = res.remarks
        this.member = res

        this.loading = false
      }, err => {
        this.$message({
          message: msgFormatter(err),
          type: 'error'
        })
        this.$emit('memberDialogClose')
      })
    },
    updateMember () {
      this.loading = true
      updateMember(this.userId, this.member.remarks).then(res => {
        this.loading = false
        this.changed.oldContent = res.remarks
        this.changed.result = false
        this.changed.message = '修改成功'
      }, err => {
        this.changed.message = err.message
      })
    },
    check () {
      this.changed.result = (this.member.remarks !== this.oldContent)
    },
    init () {
      this.member = {
        remarks: ''
      }
      this.changed = {
        message: '',
        oldContent: '',
        result: false
      }
      this.loading = false
    }
  },
  watch: {
    'changed.message': function () {
      if (this.changed.message) {
        setTimeout(() => {
          this.changed.message = ''
        }, 3000)
      }
    }
  },
  created () {
    this.fetchMember()
  },
  beforeDestroy () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.edit-container {
  min-height: 400px;
  padding: 20px;
}
.info-area {
  width: 300px;
  margin: 0 auto;
}
.avatar-img {
  width: 70px;
  height: 70px;
  border: 1px solid #c8d4e4;
  border-radius: 50%;
}

.member-info {
  color: #999;
}

</style>
