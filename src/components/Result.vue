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
  const key = CryptoJS.enc.Utf8.parse('61Q3hC6jEvfQrwQvMd80fPm2XEqDPJhB')
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
      this[`timer-${game.code}`] = setInterval(() => {
        if (this.$moment().isAfter(game.next_draw_time)) {
          clearInterval(this[`timer-${game.code}`])
        }
        this.$set(this.countdownMap, game.code, this.getDiffOfTime(game))
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
      clearInterval(this[`timer-${game.code}`])

      this.issueInterval = setInterval(() => {
        this.fetchResults(game.code).then(data => {
          let newResult = data[0]
          let oldIssue = this.resultsMap[game.code].oldIssue
          let newIssue = newResult.issue_number
          if (oldIssue !== newIssue) {
            this.$set(this.resultsMap, game.code, {
              displayName: newResult.game_display_name,
              oldIssue: newIssue,
              resultStr: newResult.result_str,
              nextDraw: newResult.next_draw_time
            })

            clearInterval(this.issueInterval)
            this.startCountdown(newResult)
          }
        })
      }, 1000)
    },
    fetchResults (code) {
      return new Promise((resolve, reject) => {
        jsonp(`${urls.latest_results}?game_code=${code}`, null, (err, data) => {
          if (err) {
            clearInterval(clearInterval(this[`timer-${code}`]))
          } else {
            let formatted = JSON.parse(encoded(data))

            _.each(formatted, (game) => {
              let currentGame = _.find(this.codes, obj => obj.display_name === game.game_display_name)
              game.code = currentGame.code
            })

            resolve(formatted)
          }
        })
      })
    },
    initResults () {
      this.fetchGames().then(res => {
        let allcodes = _.map(this.codes, (obj) => obj.code)
        jsonp(`${urls.latest_results}?game_code=${allcodes.join()}`, null, (err, data) => {
          if (err) {
            console.error(err, 'err') // error handling
          } else {
            let formatted = JSON.parse(encoded(data))

            _.each(formatted, (game, index) => {
              game.code = this.codes[index].code

              this.$set(this.resultsMap, game.code, {
                displayName: game.game_display_name,
                oldIssue: game.issue_number,
                resultStr: game.result_str,
                nextDraw: game.next_draw_time
              })

              this.startCountdown(game)
            })
          }
        })
      })
    },
    fetchGames (value) {
      return new Promise((resolve, reject) => {
        jsonp(urls.game_codes, null, (err, data) => {
          if (err) {
            console.log(err, 'err')
            reject(err)
          } else {
            let formatted = JSON.parse(data)
            this.codes = formatted
            resolve(formatted)
          }
        })
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
  vertical-align: super;
  text-align: justify;
  &:after {
    content: '';
    display: inline-block;
    width: 100%;
  }
  .text {
    display: inline-block;
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

