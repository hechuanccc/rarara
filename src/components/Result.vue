<template>
  <div>
    <div v-for="(item, index) in formattedResult" :key="index" class="result m-b">
      <div class="information">
        <div class="text">
          <span class="name">{{item.game_display_name}}</span>
          <span class="issue">{{item.issue_number}}期</span>
        </div>
        <div class="text" v-if="countdownMap[item.code]">
          <span>距下次开奖</span>
          <span v-if="countdownMap[item.code].days">{{countdownMap[item.code].days + '天'}}</span>
          <span v-if="countdownMap[item.code].hours">{{countdownMap[item.code].hours + '時'}}</span>
          <span v-if="countdownMap[item.code].minutes">{{countdownMap[item.code].minutes + '分'}}</span>
          <span>{{countdownMap[item.code].seconds + '秒'}}</span>
        </div>
      </div>
      <div :class="['result-numbers', {'tie-up': item.code === 'bjkl8' || item.code === 'auluck8'}]">
        <span v-for="(num, index) in item.result_str.split(',')"
          :key="index"
          :class="[item.code, `${item.code}-${num}`]">
          {{num}}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
// todo: 正在更新中（gamecode api/）

import urls from '../api/urls'
import _ from 'lodash'
const jsonp = require('jsonp')
const CryptoJS = require('crypto-js')

export default {
  data () {
    return {
      latestResult: [],
      resultsMap: {},
      countdownMap: {},
      codes: []
    }
  },
  filters: {
    deleted (val) {
      if (val === 'Invalid date') {
        return ''
      } else {
        return '距下期开奖: ' + val
      }
    }
  },
  methods: {
    startCountdown (game) {
      if (!game.next_draw_time) {
        return
      }

      this[`timer-${game.code}`] = setInterval(() => {
        const resultTime = this.$moment(game.next_draw_time)

        if (this.$moment().isAfter(resultTime)) {
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
        this.pollResults(game.code)
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
    encoded (data) {
      const ciphertext = CryptoJS.enc.Base64.parse(data)
      const key = CryptoJS.enc.Utf8.parse('61Q3hC6jEvfQrwQvMd80fPm2XEqDPJhB')
      const decryped = CryptoJS.AES.decrypt({ciphertext: ciphertext}, key, {
        mode: CryptoJS.mode.ECB
      })
      const plaintext = decryped.toString(CryptoJS.enc.Utf8)
      return plaintext
    },
    pollResults (gameCodes) {
      jsonp(`${urls.latest_results}?game_code=${gameCodes}`, null, (err, data) => {
        if (err) {
          console.error(err, 'err') // error handling
        } else {
          let formatted = JSON.parse(this.encoded(data))

          _.each(formatted, (game, index) => {
            let currentGame = _.find(this.codes, obj => obj.display_name === game.game_display_name)
            game.code = currentGame.code

            clearInterval(this[`timer-${game.code}`])
            if (this.$moment().isBefore(game.next_draw_time)) {
              this.issueInterval = setInterval(() => {
                this.startCountdown(game)
              }, 1000)
            }
          })
        }
        return data
      })
    },
    initResults () {
      this.fetchGames().then(res => {
        let allcodes = _.map(this.codes, (obj) => obj.code)

        jsonp(`${urls.latest_results}?game_code=${allcodes.join()}`, null, (err, data) => {
          if (err) {
            console.error(err, 'err') // error handling
          } else {
            let formatted = JSON.parse(this.encoded(data))

            this.latestResult = formatted

            // add code in latestResult & start countdown

            _.each(formatted, (game, index) => {
              game.code = this.codes[index].code

              this.resultsMap[game.code] = {
                oldIssue: game.issue_number,
                result_str: game.result_str
              }

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
  computed: {
    formattedResult () {
      if (this.latestResult) {
        let formatted = []
        _.each(this.latestResult, (item) => {
           // apply rule
          if (item.code === 'bjkl8') {
            let resultArr = item.result_str.split(',')
            resultArr.pop()
            item.result_str = resultArr.join()
          }

          formatted.push(item)
        })
        return formatted
      }
    }
  },
  created () {
    this.initResults()
  },
  beforeDestroy () {
    _.each(this.latestResult, (game) => {
      clearInterval(this[`timer-${game.code}`])
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

