<template>
  <div>
    <div
      v-for="(value, key, index) in resultsMap"
      :key="index" class="result m-b">
      <div class="information">
        <div class="text">
          <span class="name">{{value.displayName}} </span>
          <span class="issue">{{value.oldIssue}}期</span>
        </div>
        <div class="text" v-if="countdownMap[key]">
          <div v-if="countdownMap[key].days + countdownMap[key].hours + countdownMap[key].seconds + countdownMap[key].minutes !== 0">
            <span>距下次开奖</span>
            <span v-if="countdownMap[key].days">{{countdownMap[key].days + '天'}}</span>
            <span v-if="countdownMap[key].hours">{{countdownMap[key].hours + '時'}}</span>
            <span v-if="countdownMap[key].minutes">{{countdownMap[key].minutes + '分'}}</span>
            <span>{{countdownMap[key].seconds + '秒'}}</span>
          </div>
          <div v-else>
            <span>开奖中...</span>
          </div>
        </div>
      </div>
      <div :class="['result-numbers', {'tie-up': key === 'bjkl8' || key === 'auluck8'}]">
        <span v-for="(num, index) in value.resultStr.split(',')"
          :key="index"
          :class="[key, `${key}-${num}`]">
          {{num}}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import urls from '../api/urls'
import _ from 'lodash'
const jsonp = require('jsonp')
const CryptoJS = require('crypto-js')

const encoded = (data) => {
  const ciphertext = CryptoJS.enc.Base64.parse(data)
  const key = CryptoJS.enc.Utf8.parse(urls.decode)
  const decryped = CryptoJS.AES.decrypt({ciphertext: ciphertext}, key, {
    mode: CryptoJS.mode.ECB
  })
  const plaintext = decryped.toString(CryptoJS.enc.Utf8)
  return plaintext
}

export default {
  data () {
    return {
      resultsMap: {},
      countdownMap: {},
      codes: [],
      encoded
    }
  },
  methods: {
    startCountdown (game) {
      if (!game.next_draw_time) {
        return
      }
      this[`timer-${game.game_code}`] = setInterval(() => {
        if (this.$moment().isAfter(game.next_draw_time)) {
          clearInterval(this[`timer-${game.game_code}`])
        }
        this.$set(this.countdownMap, game.game_code, this.getDiffOfTime(game))
      }, 1000)
    },
    getDiffOfTime (game) {
      const time = this.$moment(game.next_draw_time)
      const lag = this.$moment.duration(time.diff())

      let [days, hours, minutes, seconds] = [lag.days(), lag.hours(), lag.minutes(), lag.seconds()]

      if (days + hours + minutes + seconds === 0) {
        this.pollResults(game)
      }

      days = days < 0 ? 0 : days
      hours = hours < 0 ? 0 : hours
      minutes = minutes < 0 ? 0 : minutes
      seconds = seconds < 0 ? 0 : seconds

      return {
        days,
        hours,
        minutes,
        seconds
      }
    },
    pollResults (game) {
      clearInterval(this[`timer-${game.game_code}`])

      this[`issueInterval-${game.game_code}`] = setInterval(() => {
        this.fetchResults(game.game_code).then(data => {
          let newResult = data[0]
          let oldIssue = this.resultsMap[game.game_code].oldIssue
          let newIssue = newResult.issue_number

          if (oldIssue !== newIssue) {
            this.$set(this.resultsMap, game.game_code, {
              displayName: newResult.game_display_name,
              oldIssue: newIssue,
              resultStr: newResult.result_str,
              nextDraw: newResult.next_draw_time
            })

            clearInterval(this[`issueInterval-${game.game_code}`])
            this.startCountdown(newResult)
          }
        })
      }, 3000)
    },
    fetchResults (code) {
      return new Promise((resolve, reject) => {
        jsonp(`${urls.latest_results}?game_codes=${code}`, null, (err, data) => {
          if (err) {
            clearInterval(this[`timer-${code}`])
          } else {
            let formatted = JSON.parse(encoded(data))
            resolve(formatted)
          }
        })
      })
    },
    initResults () {
      jsonp(`${urls.latest_results}`, null, (err, data) => {
        if (err) {
          this.$message({
            showClose: true,
            message: '系统发生了错误, 请刷新再試或联系客服',
            type: 'error'
          })
        } else {
          let formatted = JSON.parse(encoded(data))

          this.codes = _.map(formatted, (obj) => obj.game_code)
          _.each(formatted, (game, index) => {
            this.$set(this.resultsMap, game.game_code, {
              displayName: game.game_display_name,
              oldIssue: game.issue_number,
              resultStr: game.result_str,
              nextDraw: game.next_draw_time
            })

            this.startCountdown(game)
          })
        }
      })
    }
  },
  watch: {
    'resultsMap.bjkl8': function (game) {
      if (game) {
        let arr = game.resultStr.split(',')
        arr.pop()
        game.resultStr = arr.join()
      }
    }
  },
  created () {
    this.initResults()
  },
  beforeDestroy () {
    _.each(this.codes, (code) => {
      clearInterval(this[`timer-${code}`])
      clearInterval(this[`issueInterval-${code}`])
    })
  }
}
</script>

<style lang="scss" scoped>
@import '../style/resultnumbers.scss';

.result {
  box-sizing: border-box;
  width: 100%;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.6);
  color: #4a4a4a;
}

.information {
  display: inline-block;
  width: 100%;
  height: 28px;
  overflow: hidden;
  text-align: justify;
  &:after {
    content: '';
    font-size: 0;
    line-height: 0;
    display: inline-block;
    width: 100%;
  }
  .text {
    display: inline-block;
  }
  .name, .issue {
    font-size: 12px;
  }
}

.result-numbers {
  display: block;
  margin-bottom: 10px;
  &.tie-up {
    width: 290px;
  }
}
</style>

