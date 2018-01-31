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
            <el-form :model="user" status-icon :rules="rules" ref="user">
              <el-form-item prop="username" label="用户名*"  label-width="85px">
                <el-input v-model="user.username"
                          :maxlength="15"
                          auto-complete="off"
                          class="inp">
                </el-input>
              </el-form-item>

              <el-form-item prop="nickname" label="昵称*"  label-width="85px">
                <el-input v-model="user.nickname"
                          class="inp">
                </el-input>
              </el-form-item>

              <el-form-item prop="qq" label="QQ*"  label-width="85px">
                <el-input v-model="user.qq"
                          type="number"
                          class="inp">
                </el-input>
              </el-form-item>

              <el-form-item prop="password" label="密码*" label-width="85px">
                <el-input v-model="user.password"
                          :maxlength="15"
                          auto-complete="off"
                          type="password"
                          class="inp">
                </el-input>
              </el-form-item>

              <el-form-item prop="confirmation_password" label="确认密码*" label-width="85px">
                <el-input v-model="user.confirmation_password"
                          :maxlength="15"
                          auto-complete="off"
                          type="password"
                          class="inp">
                </el-input>
              </el-form-item>

              <el-form-item prop="phone" label="手机*" label-width="85px">
                <el-input v-model="user.phone"
                          type="number"
                          class="inp">
                </el-input>
              </el-form-item>


              <div class="login-actions">
                <el-form-item>
                  <el-button type="primary" class="inp" @click="submit">同意条款并注册</el-button>
                </el-form-item>
                <el-form-item :label="''" prop="hasAgree">
                  <el-checkbox-group v-model="user.hasAgree">
                    <el-checkbox :label="'hasAgree'" name="hasAgree">
                      我已阅读并完全同意<a class="agreement-link" @click="dialogVisible = true">《网站服务条款》</a>
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </div>
            </el-form>
            <transition name="el-fade-in">
              <span class="error" v-if="errorMsg">{{errorMsg}}</span>
            </transition>
          </div>
        </el-main>
      </el-container>
    </div>
    <el-dialog
      :title="'《网站服务条款》'"
      width="40%"
      :visible.sync="dialogVisible">
      <p>01. 使用本公司网站的客户，请留意阁下所在的国家或居住地的相关法律规定，如有疑问应就相关问题，寻求当地法律意见。</p>
      </br>
      <p>02. 若发生遭黑客入侵破坏行为或不可抗拒之灾害导致网站故障或资料损坏、资料丢失等情况，我们将以本公司之后备资料为最后处理依据；为确保各方利益，请各会员投注后打印资料。本公司不会接受没有打印资料的投诉。</p>
      </br>
      <p>03. 为避免纠纷，各会员在投注之后，务必进入下注明细检查及打印资料。若发现任何异常，请立即与代理商联系查证，一切投注将以本公司资料库的资料为准，不得异议。如出现特殊网络情况或线路不稳定导致不能下注或下注失败。本公司概不负责。</p>
      </br>
      <p>04. 开奖结果以官方公布的结果为准。</p>
      </br>
      <p>05. 如遇到官方停止销售或者开奖结果不确定的情况，本公司将对相关注单进行无效处理，并且返还下注本金。</p>
      </br>
      <p>06. 我们将竭力提供准确而可靠的开奖统计等资料，但并不保证资料绝对无误，统计资料只供参考，并非是对客户行为的指引，本公司也不接受关于统计数据产生错误而引起的相关投诉。</p>
      </br>
      <p>07. 本公司拥有一切判决及注消任何涉嫌以非正常方式下注之权利，在进行更深入调查期间将停止发放与其有关之任何彩金。客户有责任确保自己的帐户及密码保密，如果客户怀疑自己的资料被盗用，应立即通知本公司，并须更改其个人详细资料。所有被盗用帐号之损失将由客户自行负责。</p>
      </br>
      <p>管理层 敬啟</p>
    </el-dialog>
  </div>
</template>
<script>
  import { register } from '../api'
  import { validateUserName, validatePassword, validatePhone, validateQQ } from '../validate'
  import { msgFormatter } from '../utils'
  export default {
    name: 'register',
    data () {
      const userNameValidator = (rule, value, callback) => {
        if (!value) {
          callback(new Error('该栏位必须输入'))
        } else if (!validateUserName(value)) {
          callback(new Error('请输入6~15位英数字'))
        } else {
          callback()
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
          callback(new Error('请输入8~15字元，其中至少包含一大写字母及一数字'))
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
      const qqValidator = (rule, value, callback) => {
        if (!validateQQ(value)) {
          callback(new Error('qq号码格式无效'))
        } else {
          callback()
        }
      }
      const phoneValidator = (rule, value, callback) => {
        if (!validatePhone(value)) {
          callback(new Error('手机号码格式无效'))
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
          confirmation_password: '',
          phone: '',
          hasAgree: ['hasAgree']
        },
        dialogVisible: false,
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
            { required: true, validator: confirmPasswordValidator, trigger: 'blur' }
          ],
          qq: [
            { required: true, message: '该栏位必须输入', trigger: 'blur' },
            { validator: qqValidator, trigger: 'blur,change' }
          ],
          phone: [
            { required: true, message: '该栏位必须输入', trigger: 'blur' },
            { validator: phoneValidator, trigger: 'blur,change' }
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
              this.$router.push('login')
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
      margin-left: 23%;
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
    padding-left: 40px;
    .el-button {
      width: 220px;
    }
  }
  .login-mid {
    padding-left: 70px;
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
    padding-left: 85px;
    & /deep/ .inp {
      width: 223px;
      height: 40px;
    }
  }
  .error {
    display: block;
    font-size: 13px;
    text-align: center;
    color: red;
  }
  .agreement-link {
    color: #1976D2;
    text-decoration: underline;
  }
</style>
