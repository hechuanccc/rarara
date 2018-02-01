<template>
  <div>
    <div v-for="(item, index) in formattedResult" :key="index" class="result" v-if="index <= showing">
      <div class="information">
        <div class="part">
          <span class="name">{{item.game_display_name}}</span>
          <span class="issue">最新开奖{{item.issue_number}}期</span>
        </div>
        <div class="part">
          <span>{{$moment(item.next_draw_time).format("DD:HH:mm") | deleted}}</span>
        </div>
      </div>
      <div :class="['result-numbers', {'bjkl8': item.code === 'bjkl8'}]">
        <span v-for="(num, index) in item.result_str.split(',')"
          :key="index"
          :class="`${item.code}-${num}`">
          {{num}}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchGames } from '../api'
import urls from '../api/urls'
import _ from 'lodash'
export default {
  data () {
    return {
      latestResult: '',
      showing: 10,
      countdownMap: {},
      games:
      [{
        'id': 181,
        'code': 'jspk10',
        'display_name': '秒速赛车',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/1_spzGrld.png',
        'bg_icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/BG1.jpg',
        'rank': 1
      }, {
        'id': 172,
        'code': 'bcr',
        'display_name': '北京赛车',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/2_8CqYpoi.png',
        'bg_icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/BG2.jpg',
        'rank': 2
      }, {
        'id': 180,
        'code': 'jsssc',
        'display_name': '秒速时时彩',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/3_8t8gkeS.png',
        'bg_icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/BG3_AWbi4qL.jpg',
        'rank': 3
      }, {
        'id': 192,
        'code': 'er75ft',
        'display_name': '秒速飞艇',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/9.png',
        'bg_icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/BG5_UflzSow.jpg',
        'rank': 4
      }, {
        'id': 175,
        'code': 'cqssc',
        'display_name': '重庆时时彩',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/4_dJFwlaZ.png',
        'bg_icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/BG4.jpg',
        'rank': 5
      }, {
        'id': 182,
        'code': 'mlaft',
        'display_name': '幸运飞艇',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/5_GnimIvI.png',
        'bg_icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/BG510.jpg',
        'rank': 6
      }, {
        'id': 174,
        'code': 'cqlf',
        'display_name': '重庆幸运农场',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/7_myWn36n.png',
        'bg_icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/BG6.jpg',
        'rank': 7
      }, {
        'id': 173,
        'code': 'bjkl8',
        'display_name': '北京快乐8',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/8_dXQ0RgS.png',
        'bg_icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/BG8.jpg',
        'rank': 8
      }, {
        'id': 183,
        'code': 'pcdd',
        'display_name': 'pc蛋蛋',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/6_3US3v4L.png',
        'bg_icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/BG7.png',
        'rank': 8
      }, {
        'id': 178,
        'code': 'hkl',
        'display_name': '香港六合彩',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/10_cmxC7QW.png',
        'bg_icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/BG9_3HL8rD0.jpg',
        'rank': 9
      }, {
        'id': 179,
        'code': 'jsk3',
        'display_name': '江苏骰宝(快3)',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/11_9x76KpS.png',
        'bg_icon': null,
        'rank': 10
      }, {
        'id': 177,
        'code': 'gdklsf',
        'display_name': '广东快乐十分',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/12_auT5yQl.png',
        'bg_icon': null,
        'rank': 12
      }, {
        'id': 185,
        'code': 'xjssc',
        'display_name': '新疆时时彩',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/14_LOxTnRu.png',
        'bg_icon': null,
        'rank': 13
      }, {
        'id': 176,
        'code': 'gd11x5',
        'display_name': '广东11选5',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/12.png',
        'bg_icon': null,
        'rank': 14
      }, {
        'id': 184,
        'code': 'tjssc',
        'display_name': '天津时时彩',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/15_ydiourl.png',
        'bg_icon': null,
        'rank': 15
      }, {
        'id': 193,
        'code': 'auluck8',
        'display_name': '幸运快乐8',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/18.png',
        'bg_icon': null,
        'rank': 16
      }, {
        'id': 194,
        'code': 'jnd28',
        'display_name': '加拿大28',
        'remarks': null,
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/16.png',
        'bg_icon': null,
        'rank': 17
      }, {
        'id': 197,
        'code': 'fc3d',
        'display_name': '福彩3D',
        'remarks': '',
        'icon': 'https://ghost-staging.azureedge.net/uploads/gameicons/17.png',
        'bg_icon': null,
        'rank': 18
      }]
    }
  },
  filters: {
    deleted (val) {
      if (val === 'Invalid date') {
        return ''
      } else {
        return '距下期开奖还有: ' + val
      }
    }
  },
  methods: {
    startCountdown (time) {
      _.each(this.latestResult, (item) => {
        const resultTime = this.getDiffOfTime(item.next_draw_time)
        this.countdownMap[item.code] = resultTime
      })

      console.log(this.countdownMap)

      this.timer = setInterval(() => {
        const resultTime = this.$moment(time)
        if (this.$moment().isAfter(resultTime)) {
          clearInterval(this.timer)
        }

        this.resultCountdown = this.getDiffOfTime(resultTime)
      }, 1000)
    },
    getDiffOfTime (game) {
      const lag = this.$moment.duration(game.next_draw_time.diff())

      let [days, hours, minutes, seconds] = [lag.days(), lag.hours(), lag.minutes(), lag.seconds()]

      if (days + hours + minutes + seconds === 0) {
        this.fetchResults(game.code)
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
    fetchResults (gameCode) {
      let jsonp = require('jsonp')
      let CryptoJS = require('crypto-js')

      return fetchGames().then(games => {
        this.games = games
        jsonp(`${urls.game_result}?game_code=${gameCode}`, null, (err, data) => {
          if (err) {
            console.error(err, 'err')
          } else {
            const ciphertext = CryptoJS.enc.Base64.parse(data)
            const key = CryptoJS.enc.Utf8.parse('61Q3hC6jEvfQrwQvMd80fPm2XEqDPJhB')
            const decryped = CryptoJS.AES.decrypt({ciphertext: ciphertext}, key, {
              mode: CryptoJS.mode.ECB
            })

            const plaintext = decryped.toString(CryptoJS.enc.Utf8)
            let formatted = JSON.parse(plaintext)
            _.each(formatted, (game, index) => {
              game.code = this.games[index].code
            })

            this.latestResult = formatted
          }
          return data
        })
      })
    }
  },
  computed: {
    formattedResult () {
      if (this.latestResult) {
        let formatted = []
        _.each(this.latestResult, (item) => {
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
    const allCodes = _.map(this.games, game => game.code)

    this.fetchResults(allCodes.join()).then(res => {
      _.each(this.games, (item) => {
        this.startCountdown(item.next_draw_time)
      })
    })
  }
}
</script>

<style lang="scss" scoped>
@import '../style/resultnumbers.scss';

.result {
  display: block;
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  border-bottom: 1px dashed #ddd;
}

.icon {
  display: inline-block;
  width: 40px;
  height: 40px;
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
  .part {
    display: inline-block;
  }
}

.result-numbers {
  display: block;
  &.bjkl8 {
    width: 270px;
  }
}

</style>

