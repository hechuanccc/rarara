<template>
  <el-container class="full-height">
    <el-header class="text-center m-t-lg">
      <div class="title">会员登录</div>
    </el-header>
    <el-main class="full-height">
      <div class="login">
        <el-form :model="user" status-icon ref="user" :rules="rules">
          <el-form-item prop="username" label="用户名"  label-width="85px">
            <el-input v-model="user.username"
                      :autofocus="true"
                      class="inp"
                      ref="username">
            </el-input>
          </el-form-item>
          <el-form-item prop="password" label="密码" label-width="85px">
            <el-input v-model="user.password"
                      type="password"
                      ref="password"
                      @keyup.enter.native="submit"
                      class="inp">
            </el-input>
          </el-form-item>
          <transition name="el-fade-in">
            <span class="error" v-if="errorMsg">{{errorMsg}}</span>
          </transition>
          <div class="login-actions">
            <el-form-item>
              <el-button type="primary" @click="submit">登录</el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { msgFormatter } from '../utils'
import { mapState } from 'vuex'

export default {
  name: 'login',
  data () {
    return {
      user: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '该栏位必须输入', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '该栏位必须输入', trigger: 'blur' }
        ]
      },
      errorMsg: '',
      clientH: document.documentElement.clientHeight || document.body.clientHeight,
      loading: false
    }
  },
  methods: {
    submit () {
      if (this.loading) {
        return
      }
      if (!this.user.username || !this.user.password) {
        this.$refs.username && this.$refs.username.focus()
        return
      }
      this.loading = true

      this.$store.dispatch('logout').then(() => {
        this.$store.dispatch('login', {
          user: {
            username: this.user.username,
            password: this.user.password
          }
        }).then(result => {
          const next = this.$route.query.next

          this.$store.dispatch('fetchUser').then(() => {
            this.loading = false
            this.$router.push(next || '/')

            this.$store.dispatch('updateUnloginedDialog', {visible: false, status: 'Login'})
          })
        }, errorMsg => {
          this.errorMsg = msgFormatter(errorMsg)
          this.loading = false
        })
      })
    }
  },
  computed: {
    ...mapState([
      'unloginedDialog'
    ])
  },
  watch: {
    'errorMsg': function () {
      setTimeout(() => {
        this.errorMsg = ''
      }, 3000)
    },
    'unloginedDialog.visible': function () {
      this.$refs['user'].clearValidate()
    }
  }
}
</script>
<style lang="scss" scoped>
.title {
  display: inline-block;
  font-size: 20px;
}

.el-button {
  width: 220px;
}

.el-input {
  width: 220px;
  height: 40px;
}

.login-actions {
  padding-left: 85px;
}

.error {
  display: block;
  font-size: 13px;
  padding-left: 65px;
  color: red;
}
</style>
