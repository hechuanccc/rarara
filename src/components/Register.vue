<template>
  <div class="p-l">
    <el-container class="full-height">
      <el-header class="m-t-lg text-center">
        <div class="title">会员注册</div>
      </el-header>
      <el-main>
        <div class="register">
          <el-form :model="user" status-icon :rules="rules" ref="user">
            <el-form-item prop="username" label="用户名" label-width="85px">
              <el-input v-model="user.username" :maxlength="15" auto-complete="off">
              </el-input>
            </el-form-item>
            <el-form-item prop="password" label="密码" label-width="85px">
              <el-input v-model="user.password" :maxlength="15" auto-complete="off" type="password">
              </el-input>
            </el-form-item>
            <el-form-item prop="confirmation_password" label="确认密码" label-width="85px">
              <el-input v-model="user.confirmation_password" :maxlength="15" auto-complete="off" type="password">
              </el-input>
            </el-form-item>
            <el-form-item prop="nickname" label="昵称" label-width="85px">
              <el-input v-model="user.nickname">
              </el-input>
            </el-form-item>
            <div class="register-actions">
              <el-form-item>
                <el-button type="primary" class="inp" @click="submit">确认送出</el-button>
              </el-form-item>
            </div>
          </el-form>
          <transition name="el-fade-in">
            <span class="error text-center" v-if="errorMsg">{{errorMsg}}</span>
          </transition>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import { register, checkUserName } from '../api'
  import { validateUserName, validatePassword } from '../validate'
  import { msgFormatter } from '../utils'
  import { mapState } from 'vuex'

  export default {
    name: 'register',
    data () {
      const userNameValidator = (rule, value, callback) => {
        if (!value) {
          callback(new Error('该栏位必须输入'))
        } else if (!validateUserName(value)) {
          callback(new Error('请输入6~15位英数字'))
        } else {
          checkUserName(value).then(response => {
            if (response.existed) {
              callback(new Error('用户名已经存在'))
            } else {
              callback()
            }
          })
        }
      }
      const nickNameValidator = (rule, value, callback) => {
        if (!value) {
          callback(new Error('该栏位必须输入'))
        } else {
          callback()
        }
      }
      const passwordValidator = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('该栏位必须输入'))
        } else {
          if (this.user.confirmation_password !== '') {
            this.$refs.user.validateField('confirmation_password')
          }
          callback()
        }
      }
      const passwordFormatValidator = (rule, value, callback) => {
        if (!validatePassword(value)) {
          callback(new Error('请输入6~15位数字或字母'))
        } else {
          callback()
        }
      }
      const confirmPasswordValidator = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.user.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }
      return {
        user: {
          username: '',
          nickname: '',
          password: '',
          confirmation_password: '',
          hasAgree: ['hasAgree']
        },
        errorMsg: '',
        rules: {
          username: [
            { required: true, validator: userNameValidator, trigger: 'blur' }
          ],
          nickname: [
            { required: true, validator: nickNameValidator, trigger: 'blur' }
          ],
          password: [
            { required: true, validator: passwordValidator, trigger: 'blur' },
            { validator: passwordFormatValidator, trigger: 'blur,change' }
          ],
          confirmation_password: [
            { required: true, validator: confirmPasswordValidator, trigger: 'blur,change' }
          ],
          hasAgree: [
            { type: 'array', required: true, message: '请阅读并同意用户协议', trigger: 'change' }
          ]
        }
      }
    },
    methods: {
      submit () {
        this.$refs['user'].validate((valid) => {
          if (valid) {
            register(this.user).then(result => {
              return this.$store.dispatch('login', {
                user: {
                  username: this.user.username,
                  password: this.user.password
                }
              })
            }).then(result => {
              this.$store.dispatch('updateUnloginedDialog', {visible: false, status: 'Login'})
            }, errorMsg => {
              this.$message({
                showClose: true,
                message: msgFormatter(errorMsg),
                type: 'error'
              })
            })
          } else {
            return false
          }
        })
      }
    },
    computed: {
      ...mapState([
        'unloginedDialog'
      ])
    },
    watch: {
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
.el-button, .el-input {
  width: 220px;
}
.el-input {
  height: 40px;
}
.register-actions {
  padding-left: 85px;
  /deep/ .el-checkbox__input.is-checked+.el-checkbox__label {
    color: #666;
  }
}
.error {
  display: block;
  font-size: 13px;
  color: red;
}
</style>
