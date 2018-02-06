<template>
  <div class="box" style="height: 100%">
    <div class="bg-container"  :style="{height: clientH - 68 + 'px'}">
      <div class="register-container">
        <el-container>
          <el-header class="login-head">
            <div class="title">会员注册</div>
            <div class="tip m-t-sm"><router-link to="/login">已有账号? 立即登录</router-link></div>
            <a :href="$store.state.globalPreference.customer_service_url" target="_blank" class="service">客服中心</a>
          </el-header>
          <el-main>
            <div class="register">
              <el-form :model="user" status-icon :rules="rules" ref="user">
                <el-form-item prop="username" label="用户名*"  label-width="85px">
                  <el-input v-model="user.username"
                            :maxlength="15"
                            auto-complete="off">
                  </el-input>
                </el-form-item>

                <el-form-item prop="nickname" label="昵称*"  label-width="85px">
                  <el-input v-model="user.nickname">
                  </el-input>
                </el-form-item>

                <el-form-item prop="qq" label="QQ*"  label-width="85px">
                  <el-input v-model="user.qq"
                            type="number">
                  </el-input>
                </el-form-item>

                <el-form-item label="邮箱*" prop="email" label-width="85px">
                  <el-input class="input-width" v-model="user.email"></el-input>
                </el-form-item>

                <el-form-item prop="password" label="密码*" label-width="85px">
                  <el-input v-model="user.password"
                            :maxlength="15"
                            auto-complete="off"
                            type="password">
                  </el-input>
                </el-form-item>

                <el-form-item prop="confirmation_password" label="确认密码*" label-width="85px">
                  <el-input v-model="user.confirmation_password"
                            :maxlength="15"
                            auto-complete="off"
                            type="password">
                  </el-input>
                </el-form-item>

                <el-form-item prop="phone" label="手机*" label-width="85px">
                  <el-input v-model="user.phone"
                            type="number">
                  </el-input>
                </el-form-item>


                <div class="register-actions">
                  <el-form-item>
                    <el-button type="primary" class="inp" @click="submit">同意条款并注册</el-button>
                  </el-form-item>
                  <el-form-item :label="''" prop="hasAgree">
                    <el-checkbox-group v-model="user.hasAgree">
                      <el-checkbox :label="'hasAgree'" name="hasAgree">
                        我已阅读并完全同意
                      </el-checkbox><a class="agreement-link" @click.stop="dialogVisible = true;">《网站服务条款》</a>
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
        title="服務協議"
        width="40%"
        :visible.sync="dialogVisible">
        <div class="agreement">
          <p>在此特别提醒用户认真阅读本《协议》中各条款内容，包括免除或者减少本公司责任的免责条款及用户的权利条款。请您审阅并选择接受或不接受本《协议》（未成年人应在法定监护人陪同下审阅）。用户对本协议的接受即受本公司与用户之间全部协议的约束，包括接受本公司对服务条款随时所做的任何修改。这些条款可由本公司随时更新，且无须另行通知。修改后的用户协议一旦在协议发布页面上公布即有效代替原来的用户协议，用户可随时登录官网查阅最新用户协议。 如果不同意所改动的内容，用户可以主动取消或立即停止使用本公司提供的的网络服务。如果用户继续享用本公司提供的网络服务，则视为接受本公司对服务条款的变动。</p>
          <p>一、释义  本服务条款系由用户与本公司之间，关于用户注册时，详细阅读本服务条款的所有内容，当您点选同意按钮或进入房间中即视为同意并接受本服务条款的所有规范并愿受其约束。 </p>
          </br>
          <p>二、帐号清理规则  为确保服务运行顺畅，减轻服务器的压力，官方有权对长期未登录房间的低级账号做出不定期的清理。以下是清理账号的基本规则，如有特殊情况，会另作说明。  清理账号基本规则：1个月或以上时间未登录房间。</p>
          </br>
          <p>三、帐号管理规则 </p>
          <p>1.使用外挂进入房间者，官方有权永久封禁其帐号。</p>
          <p>2.辱骂、威胁官方人员者，官方有权永久封禁其帐号。</p>
          <p>3.如果你对当前聊天室帐号的发展情况不满意，你可以选择放弃该帐号并重新注册帐号。</p>
          <p>4.冒充官方人员或代理商在房间中行骗者，发布虚假信息者，官方有权永久封禁其帐号。</p>
          <p>5.客户账号个人资料修改必须联系客服提供详细的账号资料，客户私下交易账号，官方不予修改，并且有权对账号进行冻结!</p>
          <p>6.提高安全防范意识，妥善保管帐号和密码，因帐号被盗造成的聊天室损失，都不会得到聊天室管理团队任何形式的补偿由客户自行负责。</p>
          <p>7.所有注册帐号只可用于客户进入正常的房间，不得用于对房间进行恶意攻击或破坏，官方有权对任何不符合聊天室规则的帐号进行封号和删除。</p>
          <p>8.房间中的所有数据均属于本公司所有，任何客户不得进行私自交易，如果客户因私下进行帐号或物品交易所导致的损失，官方不做任何补偿。</p>
          <p>9.客户进入聊天室时使用的角色名等自定义命名均不得使用违反国家法规、带侮辱性的词语或官方人员名字，不得故意注册和其他客户相似的名字，如有违反，官方有权强制要求其更改或冻结帐号。</p>
          <p>10.账号密码标志着账号的使用权。客户账号使用的密码不得以任何理由给予另外一个客户。若客户将密码透露给第三方，意味着将账号的使用权也转让给了第三方，由此产生的账号损失由客户自行负责！</p>
          </br>
          <p>四、聊天室行为准则</p>
          <p>1.客户必须保管好自己的帐号和密码，由于客户个人的原因导致帐号和密码泄露而造成的后果均将由该客户自行承担。</p>
          <p>2.同意并按照运营团队发布、变更和修改的本系统客户规则及其他规则，接受并使用我们的产品和服务，客户不得通过不正当的手段或其他不公平的手段使用我们的产品和服务或参与我们活动。</p>
          <p>3.客户须对自己帐号中的所有活动和事件负责并须遵守有关互联网信息发布的有关法律、法规及通常适用的互联网一般道德和礼仪的规范，客户将自行承担其所发布的信息内容的责任。特别提醒客户不得发布下列内容：</p>
          <p>(1) 反对宪法所确定的基本原则的；</p>
          <p>(2) 危害国家安全，泄露国家秘密，反动，破坏国家统一的；</p>
          <p>(3) 损害国家荣誉和利益的；</p>
          <p>（4）煽动民族仇恨、民族歧视，破坏民族团结的；</p>
          <p>（5）破坏国家宗教政策，宣扬反动和封建迷信的；</p>
          <p>（6）散布谣言，扰乱社会秩序，破坏社会稳定的；</p>
          <p>（7）散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；</p>
          <p>（8）侮辱或者诽谤他人，侵害他人合法权益的；</p>
          <p>（9）含有法律、行政法规禁止的其他内容的。</p>
          <p>（10）侵犯任何第三者的知识产权，版权或公众私人权利的。</p>
          <p>（11）违反人文道德、风俗习惯的。（如：在房间内恶意刷屏和辱骂他人。</p>
          <p>（12）任何形式的未经《财神财经直播系统》 运营团队允许的广告。</p>
          <p>（13）煽动客户，造谣生事。</p>
          <p> 以上条约，若有客户违反其中一条，官方都有权对其帐号进行封禁。</p>
          <br />
          <p>五、聊天室漏洞规则</p>
          <p>1.运营团队鼓励客户提出聊天室中出现的问题和漏洞</p>
          <p>2.所有利用聊天室中的漏洞进行非法谋利或恶意攻击的行为被严格禁止，一经发现，帐号将被删除</p>
          <br />
          <p>六、辅助软件规则</p>
          <p> 1.本聊天室禁止采用非官方提供的聊天室辅助工具，由此带来的任何后果由客户自己负责；</p>
          <p>2.除市面传统网络浏览器外，任何用户帐号都无权使用任何可能影响到聊天室程序运行稳定或聊天室发展的外部软件来进入房间，不得进行任何使服务器负载过量或造成技术超载的行为。一经发现，运营团队保留对采用房间辅助软件进入房间的帐号的处置权；</p>
          <br />
          <p>七、处罚规则</p>
          <p>1.禁言：即对违规客户进行禁言处置。</p>
          <p>2.封号：即封闭违规客户的帐号；</p>
          <p>3.删号：即删除违规客户的帐号；</p>
          <p>4.客户对惩罚如有解释或意见，可以联系管理员进行说明，管理员有权根据实际情况决定是否更改处罚和回复结果。</p>
          <br />
          <p>八、运营团队有权中断、停止或变更其所提供的服务，对于因此而产生的困扰、不便或损失，运营方不承担任何责任： </p>
          <p>1.定期检查维护，软硬件更新等，即暂停服务，运营方将尽快完成维修、维护工作。</p>
          <p>2.服务器遭到任何形式的破坏，无法正常运作。</p>
          <p>3.网络线路或其它导致客户通过Internet连接至聊天室服务器的动作发生滞碍等情形。</p>
          <p>4.自然灾害等不可抗力的因素。</p>
          <p>5.在紧急情况之下为维护国家安全或其它会员及第三者人身安全时。</p>
          <p>6.发生突发性软硬件设备与电子通信设备故障时。</p>
          <br />
          <p>九、聊天室规则的解释、变更和添加  本规则的解释、效力及适用以中华人民共和国法律为依据。如果本协议的任何内容与法律相抵触，以法律规定为准。 此前提下， 运营团队保留解释、更改和添加房间规则的权利，规则解释、更改和添加自公布之时起生效。请客户时刻关注本规则。</p>
        </div>
      </el-dialog>
    </div>
    <div class="footer">
      <p class="p1">投资有风险，入市须谨慎</p>
      <p>©2017 至尊开奖直播版权所有</p>
    </div>
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
        clientH: document.documentElement.clientHeight || document.body.clientHeight,
        user: {
          username: '',
          nickname: '',
          email: '',
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
          ],
          email: [
            { required: true, message: '该栏位必须输入', trigger: 'blur' },
            { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur,change' }
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

<style lang="scss" scoped>
.box {
  background: #4a4a4a;
}
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
}

.login-head {
  margin-top: 20px;
  text-align: center;
  .title {
    line-height: 40px;
    display: inline-block;
    font-size: 20px;
    span {
      color: #9b9b9b;
    }
  }
  .service {
    position: absolute;
    right: 15px;
    top: 20px;
    width: 100px;
    height: 40px;
    line-height: 40px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 500;
    background-color: #f57723;
    color: #ffffff;
  }
}


.register {
  padding-left: 40px;
  .el-button {
    width: 220px;
  }
}
.el-input {
  width: 220px;
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
.tip {
  text-align: center;
  font-size: 14px;
  a {
    color:  #4a90e2;
  }
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
  text-align: center;
  color: red;
}
.agreement-link {
  cursor: pointer;
  font-size: 14px;
  color: #1976D2;
}
.agreement {
  max-height: 500px;
  overflow-y: scroll;
}
.footer {
  p {
    text-align: center;
    color: #fff;
  }
  .p1 {
    padding-top: 14px;
  }
}
</style>
