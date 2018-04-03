<template>
  <div class="checking-area">
    <div class="header">
      <div class="top p-t">
        <span class="rule p-l" @mouseover="rulesVisible = true" @mouseleave="rulesVisible = false">
          <i class="el-icon-question p-r-sm"></i>签到规则
        </span>
        <span class="title">每日签到</span>
        <span class="cancel text-right p-r">
          <i class="el-icon-close pointer" @click="$emit('closeCheckinDialog')"></i>
        </span>
      </div>
      <div class="continue-day text-center">连续签到
        <span class="number">{{continuousCheckins | complete}}</span>天
      </div>
      <div class="progress p-t-lg p-b">
        <div class="progress-bar" v-for="(number, index) in progress.parts" :key="index">

          <div class="bar">
            <div class="percentage" :style="{width: getProgressWidth(number)}"></div>
          </div>

          <div class="gift-day p-r-sm p-l-sm text-center">
            <div class="day">{{number * progress.giftDay}}日</div>
            <div :class="['icon', {today: continuousCheckins  === (number * progress.giftDay)}]">
              <i class="el-icon-circle-check-outline"></i>
            </div>
          </div>

        </div>
      </div>
    </div>
    <div class="body">
      <div class="congratulation" v-if="Number(checkinData.special_bonus)">
        <div class="text-center">
          <p class="text">获取彩金</p>
          <p class="amount m-t">¥{{checkinData.special_bonus}}</p>
        </div>
      </div>

      <div class="steps-area" v-else>
        <ul class="row" v-for="(row, index) in progressRows" :key="index">
          <li :class="['step',
            {checked: day - continuousCheckins <= 0},
            {pointer: day === checkinDay && !hasChecked}]"
            @click="checkin(day)"
            v-for="(day, index) in row"
            :key="index">
            <div :class="['gift', 'm-l','text-center', {today: (day === checkinDay)}, {clickable: (day === checkinDay) && !hasChecked}]"
              v-if="day % progress.giftDay === 0">
              <img class="img"
                :src="require(`../assets/gift_${day}@2x.png`)"
                :alt="day"/>
              <div class="ribbon-container">
                <h1 class="ribbon">
                  {{day}}日奖励
                </h1>
              </div>
            </div>

            <div :class="['ordinary', {today: (day === checkinDay)},{clickable: (day === checkinDay) && !hasChecked}]" v-else>
              <transition name="fade">
                <span class="status-popover text-center"
                  v-if="day === checkinDay && statusPopoverVisible"
                  :style="{
                    backgroundImage: `url(${hasChecked ? require('../assets/hint_success@2x.png') : require('../assets/hint_click@2x.png')})`
                    }">
                  <span v-if="hasChecked">成功</span>
                  <span v-else>￥{{singleDayAmount}}</span>
                </span>
              </transition>
              <div class="coin-icon text-center">
                <img class="img" src="../assets/Daily_money@2x.png" alt="money">
              </div>
              <div class="day">{{day}}</div>
            </div>

          </li>
        </ul>
      </div>
    </div>

    <div class="rules" v-if="rulesVisible">
      <p>签到规则</p>
      <ol>
        <li>
          1. 签到方式：<p>用户登录时，在页面点击“签到”按钮进行签到，全天都可以签。</p>
        </li>
        <li>
          2. 签到奖励：<p>每日签到即获得签到彩金，连续签到7日、14日、21日能领取更多金额彩金</p>
        </li>
      </ol>
    </div>

  </div>
</template>

<script>
import _ from 'lodash'
import { checkin } from '../api'
import { msgFormatter } from '../utils'

export default {
  props: {
    continuousCheckins: {
      type: Number
    },
    singleDayAmount: {
      type: Number
    },
    hasChecked: {
      type: Boolean
    }
  },
  data () {
    return {
      progress: {
        parts: 3,
        giftDay: 7
      },
      checkinData: {
        status: '',
        special_bonus: null
      },
      today: {
        continuous: this.continuousCheckins
      },
      statusPopoverVisible: false,
      rulesVisible: false,
      loading: false
    }
  },
  filters: {
    complete: function (num) {
      return num > 9 ? num : `0${num}`
    }
  },
  computed: {
    progressRows () {
      const total = Array.from(Array(this.progress.parts * this.progress.giftDay).keys()).map(item => item + 1)
      return _.chunk(total, this.progress.giftDay)
    },
    checkinDay () {
      if (this.hasChecked) {
        return this.continuousCheckins
      } else {
        this.statusPopoverVisible = true
        return this.continuousCheckins + 1
      }
    }
  },
  methods: {
    getProgressWidth (number) {
      let breakpoint = number * this.progress.giftDay

      if (this.continuousCheckins >= breakpoint) {
        return '100%'
      }
      if (breakpoint - this.continuousCheckins >= 7) {
        return '0px'
      }

      return this.continuousCheckins % 7 * 10 + 'px'
    },
    checkin (day) {
      if (this.checkinDay !== day ||
        this.hasChecked ||
        this.loading) {
        return
      }
      this.loading = true

      checkin().then(response => {
        this.$store.dispatch('fetchUser').then(() => {
          this.statusPopoverVisible = true
          this.checkinData = response
          this.loading = false
        })
      },
      err => {
        this.$message({
          showClose: true,
          message: msgFormatter(err),
          type: 'warning'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.checking-area {
  min-height: 380px;
  .header {
    min-height: 135px;
    background: url('../assets/checkinBg.png');
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    background-color: #fad961;
  }

  .body {
    box-sizing: border-box;
    min-height: 245px;
  }
}

.top {
  display: flex;
  justify-content: space-between;
  .rule, .title, .cancel {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
  }

  .rule {
    cursor: default;
  }

  .cancel {
    width: 60px;
    font-size: 20px;
  }
}

.continue-day {
  margin-top: 15px;
  font-size: 14px;
  color: #fff;
  letter-spacing: 1px;

  .number {
    font-size: 24px;
  }
}

/* congratulation block */

.congratulation {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 245px;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  font-weight: 600;
  background-image: url('../assets/checkinCongratBg.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;

  .text {
    font-size: 20px;
  }

  .amount {
    font-size: 36px;
  }

}

/* checkin step */
.steps-area {
  padding: 10px;
  .row {
    display: flex;
    justify-content: space-around;
    margin-top: 25px;
    &:last-child {
      padding-bottom: 25px;
    }
  }
}

.step {
  position: relative;

  .status-popover {
    position: absolute;
    top: -15px;
    display: inline-block;
    width: 45px;
    height: 25px;
    line-height: 15px;  // to adjust for the popover tail
    background-size: contain;
    background-repeat: no-repeat;
    font-size: 12px;
    color: #fff;
  }

  .ordinary {
    display: inline-block;
    width: 45px;
    height: 50px;
    border-radius: 5px;
    background-color: #f8f7f3;
    &.clickable {
      box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.5);
      border: solid 2px #3e73b1;
      .day {
        background-color: #3e73b1;
        border-radius: 0;
        color:#fff;
      }
    }

    &.today {
      .day {
        background-color: #3e73b1;
        color: #fff;
        border-radius: 0px;
      }
    }
    .coin-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 35px;

      .img {
        height: 80%;
      }
    }

    .day {
      height: 15px;
      line-height: 15px;
      background-color: #dfdfdf;
      border-radius: 0px 0px 5px 5px;
      font-size: 12px;
      color: #4a4a4a;
      text-align: center;
    }

  }

  .gift {

    &.clickable {
      background-color: #f8e71c;
      border-radius: 50%;
      &:before {
        content: '领取';
        position: absolute;
        top: -15px;
        font-size: 12px;
      }
      .img {
        position: relative;
        top: 10px;
      }
    }

    .img {
      width: 25px;
      height: 25px;
    }

    .ribbon:before, .ribbon:after {
      content: '';
      position: absolute;
      height: 0;
      width: 0;
      border-style: solid;
      border-width: 0;
      top: 5px;
    }
    .ribbon-container {
      position: relative;
      width: 100%;

      .ribbon {
        width: 50px;
        height: 15px;
        z-index: auto;
        color: #fff;
        font-size: 10px;
        background-image: linear-gradient(to bottom, #ffc75c, #fffa3b 33%, #ffc00d 86%, #e99917);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
        text-align: center;
        line-height: 15px;
        color: #c0493c;

        &:before {
          border-color: #f5a623 #f5a623 #f5a623 transparent;
          left: -10px;
          border-width: 6px 5px 5px 5px;
        }

        &:after {
          border-color: #f5a623 transparent #f5a623 #f5a623;
          right: -10px;
          border-width: 6px 5px 5px 5px;
        }
      }
    }
  }


  &.checked {
    .ordinary {
      border: solid 2px #3e73b1;
    }

    .gift, .coin-icon, .day {
      opacity: .5;
    }

    .gift {
      filter: grayscale(1);
    }

    &:after {
      content: '';
      position: absolute;
      display: block;
      top: 10px;
      left: 13px;
      width: 20px;
      height: 8px;;
      border-left: 3px solid #3e73b1;
      border-bottom: 3px solid #3e73b1;
      transform: rotate(-45deg);
    }
  }
}

/* progress bar */

.progress {
  width: 300px;
  margin: 0 auto;
  font-size: 12px;
  color: #fff;
}

.progress-bar {
  position: relative;
  display: inline-block;

  .bar, .gift-day {
    display: inline-block;
  }

  .gift-day {
    .day {
      position: relative;
      top: 5px;
    }
  }

  .icon.today {
    color: #3e73b1;
  }

  .bar {
    width: 60px;
    height: 5px;
    background: #fff;
    border-radius: 2px;
    .percentage {
      height: 5px;
      background-color: #3e73b1;
      border-radius: 2px;
    }
  }
}



/* rules block */

.rules {
  position: absolute;;
  top: 40px;
  left: 10px;
  width: 200px;
  height: 175px;
  padding: 10px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
  font-size: 12px;
  color: #4a4a4a;
  background: #fff;
}


.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
