<template>
  <div class="bg-container"  style="height: calc(100% - 68px);">
    <div class="register-container">
      <el-container>
        <el-header class="login-head">
          <div class="title">会员注册 <span>Register</span></div>
          <el-button type="warning" class="kf">客服中心</el-button>
        </el-header>
        <el-main>
          <div class="login">
            <div class="login-mid">
              <div class="rectangle-14"><router-link to="/login">已有账号，立即登录</router-link></div>
            </div>
            <el-form :model="user" status-icon :rules="rules2" ref="user">
              <el-form-item prop="username" label="用户名*"  label-width="75px">
                <el-input v-model="user.username"
                          @keyup.enter.native="register"
                          :autofocus="true"
                          class="inp"
                          ref="username">
                </el-input>
              </el-form-item>

              <el-form-item prop="nickname" label="昵称*"  label-width="75px">
                <el-input v-model="user.nickname"
                          @keyup.enter.native="register"
                          :autofocus="true"
                          class="inp"
                          ref="username">
                </el-input>
              </el-form-item>

              <el-form-item prop="qq" label="QQ"  label-width="75px">
                <el-input v-model="user.qq"
                          @keyup.enter.native="register"
                          :autofocus="true"
                          class="inp"
                          ref="username">
                </el-input>
              </el-form-item>

              <el-form-item prop="password" label="密码*" label-width="75px">
                <el-input v-model="user.password"
                          type="password"
                          class="inp"
                          @keyup.enter.native="register">
                </el-input>
              </el-form-item>

              <el-form-item prop="confirm_password" label="确认密码*" label-width="75px">
                <el-input v-model="user.confirm_password"
                          type="password"
                          class="inp"
                          @keyup.enter.native="register">
                </el-input>
              </el-form-item>

              <el-form-item prop="phone" label="手机*" label-width="75px">
                <el-input v-model="user.phone"
                          type="number"
                          class="inp"
                          @keyup.enter.native="register">
                </el-input>
              </el-form-item>


              <div class="login-actions">
                <el-form-item>
                  <el-button type="primary" @click="register">同意条款并注册</el-button>
                </el-form-item>
                <div class="forgot-password">
                  <a  target="_blank" >《网站服务条款》</a>
                </div>
              </div>
            </el-form>
            <transition name="el-fade-in">
              <span class="error" v-if="errorMsg">{{errorMsg}}</span>
            </transition>
          </div>
        </el-main>
      </el-container>
    </div>
  </div>
</template>
<script>
  import { register } from '../api'
  export default {
    name: 'register',
    data () {
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          if (this.ruleForm2.checkPass !== '') {
            this.$refs.ruleForm2.validateField('checkPass')
          }
          callback()
        }
      }
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.ruleForm2.pass) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }
      return {
        user: {
          username: '',
          nickname: '',
          qq: '',
          password: '',
          confirm_password: '',
          phone: ''
        },
        errorMsg: '',
        rules2: {
          pass: [
            { validator: validatePass, trigger: 'blur' }
          ],
          checkPass: [
            { validator: validatePass2, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      register () {
        register({
          username: this.user.username,
          password: this.user.password,
          confirmation_password: this.user.confirmation_password
        })
        this.$refs.user.validate((valid) => {
          if (valid) {
            alert('submit!')
          } else {
            console.log('error submit!!')
            return false
          }
        })
      }
    }
  }
</script>
<style lang="less" scoped>
  .bg-container {
    background-image: url('../images/loginBG.jpg');
    background-size: cover;
    position: relative;
  }
  .register-container {
    width: 500px;
    height: 636px;
    border-radius: 4px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    & /deep/ .inp {
      .el-input__inner {
        height: 40px;
      }
    }
    & /deep/ .el-form-item__label {
      line-height: 40px;
    }
  }

  .login-head {
    margin-top: 20px;
    text-align: center;
    .title {
      margin-left: 26%;
      line-height: 40px;
      display: inline-block;
      font-size: 20px;
      span {
        color: #9b9b9b;
      }
    }
    .kf {
      float: right;
      width: 100px;
      height: 40px;
      border-radius: 2px;
      background-color: #f57723;
    }
  }


  .login {
    padding-left: 60px;
    .el-button {
      width: 220px;
    }
  }
  .login-mid {
    padding-left: 60px;
    .rectangle-14 {
      width: 223px;
      height: 40px;
      text-align: center;
      a {
        color: #4a90e2;
      }
    }
  }
  .el-input {
    width: 223px;
    height: 40px;
  }

  .forgot-password {
    display: inline-block;
    width: 223px;
    text-align: center;
    position: relative;
    bottom: 20px;
    margin-top: 20px;
    a {
      font-size: 14px;
      color: #4a90e2;
      font-weight: 500;
      text-decoration: none;
    }
  }

  .login-actions {
    padding-left: 75px;
  }
  .error {
    display: block;
    font-size: 13px;
    text-align: center;
    color: red;
  }
</style>
