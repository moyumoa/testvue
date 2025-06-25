<template>
  <div
    class="drag-item"
    :class="{ 'border-radius-0': conShow }"
    :style="itemStyle"
    ref="dragItem"
    @mousedown="itemMouseDown"
    @mouseover="showTeam($event, item)"
    @mouseout="hideTeam"
    @dblclick="updateCardInfo(item.id, item)"
  >
    <div
      class="message-warpper flex col"
      :class="{ 'border-radius-0': conShow }"
      :style="borderStyle"
      v-if="item.width - leftDiff.x + rightDiff.x >= 4 * oneHours"
    >
      <div class="is-sure flex align-center just-b">
        <div class="team-title">{{ item.cardName }}</div>
      </div>
      <div class="team-info">
        <!-- <div class="team-title">{{ item.cardName }}</div> -->
        <div class="time-team flex align-center just-b">
          <!-- <div class="time-fix flex align-center" :style="{'opacity': index === 0 && beforeArr.length> 0 && item.id === beforeArr[beforeArr.length -1].id?0:1}"> -->
          <div class="time-fix flex align-center">
            <div class="time-cont">
              {{ item.startTime }}
              <img class="clock" src="@/assets/images/schedule/clock.png" alt />
            </div>
            <div class="t-split">
              <img src="@/assets/images/schedule/t-split.png" alt width="14" />
            </div>
            <div class="time-cont">
              {{ item.endTime }}
              <img class="clock" src="@/assets/images/schedule/clock.png" alt />
            </div>
          </div>
          <div class="people m-left-14">
            <div class="s-small" v-if="item.anchorList.length <= 3">
              <div
                v-for="(row1, index1) in item.anchorList"
                :key="index1"
                :style="{ right: (item.anchorList.length - 1 - index1) * 16 + 'px' }"
              >
                <img :src="row1.photo" alt v-if="row1.photo" />
                <div class="flex just-center align-center no-avatar" v-else>
                  {{ row1.name.substr(-1) }}
                </div>
              </div>
              <!-- <img :src="item.anchorList.length>0 && row1.anchorPhoto" alt="" v-for="(row1, index1) in item.anchorList" :key="`p${index1}`"> -->
            </div>
            <div class="s-small" v-if="item.anchorList.length > 3">
              <div v-for="index1 in 3" :key="index1" :style="{ right: (4 - index1) * 16 + 'px' }">
                <img
                  :src="item.anchorList[index1].photo"
                  alt
                  v-if="item.anchorList[index1].photo"
                />
                <div class="flex just-center align-center no-avatar" v-else>
                  {{ item.anchorList[index1].name.substr(-1) }}
                </div>
              </div>
              <div :style="{ right: 0 + 'px', background: item.background }">
                +{{ item.anchorList.length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="small"
      :class="{ 'border-radius-0': conShow }"
      :style="borderStyle"
      v-if="item.width - leftDiff.x + rightDiff.x < oneHours"
    ></div>
    <div
      class="middle flex col just-center align-center"
      :class="{ 'border-radius-0': conShow }"
      :style="borderStyle"
      v-if="
        item.width - leftDiff.x + rightDiff.x > oneHours &&
        item.width - leftDiff.x + rightDiff.x < 2 * oneHours
      "
    >
      <div class="middle-sure"></div>
      <div class="count-img">
        <div class="middle-avater"></div>
        <!-- <img src="@/assets/images/schedule/people.png" class="middle-avater" alt=""> -->
        <div class="middle-count">{{ item.anchorList.length }}</div>
      </div>
    </div>
    <div
      class="large flex col align-center"
      :class="{ 'border-radius-0': conShow }"
      :style="borderStyle"
      v-if="
        item.width - leftDiff.x + rightDiff.x >= 2 * oneHours &&
        item.width - leftDiff.x + rightDiff.x < 4 * oneHours
      "
    >
      <div class="l-is-sure flex align-center just-b">
        <span class="line-hidden">{{ item.cardName }}</span>
      </div>
      <div class="l-imgs flex m-left-10">
        <div class="time-fix flex align-center">
          <div class="time-cont">
            {{ item.startTime }}
            <img class="clock" src="@/assets/images/schedule/clock.png" alt />
          </div>
          <div class="t-split">
            <img src="@/assets/images/schedule/t-split.png" alt />
          </div>
          <div class="time-cont">
            {{ item.endTime }}
            <img class="clock" src="@/assets/images/schedule/clock.png" alt width="16" />
          </div>
        </div>
      </div>
    </div>
    <!-- 左右控制 -->
    <div
      class="left-img flex just-center align-center"
      v-show="conShow"
      @mousedown.stop="leftMouseDown"
    >
      <div class="line"></div>
      <!-- <img src="@/assets/images/schedule/left-con.png" alt=""> -->
    </div>
    <div
      class="right-img flex just-center align-center"
      v-show="conShow"
      @mousedown.stop="rightMouseDown"
    >
      <!-- <img src="@/assets/images/schedule/right-con.png" alt=""> -->
      <div class="line"></div>
    </div>
  </div>
</template>
<script>
import delIcon from '@/assets/images/del-icon.png'
import { ElMessage } from 'element-plus'

export default {
  name: 'DragItem',
  props: {
    item: {
      type: Object,
      require: true,
      default() {
        return {}
      }
    },
    schedulingList: {
      type: Array,
      require: true,
      default() {
        return []
      }
    },
    oneHours: {
      type: Number,
      require: true,
      default: 0
    },
    maxWidth: {
      type: Number,
      require: true,
      default: 0
    },
    warpperSize: {
      type: Object,
      require: true,
      default() {
        return {}
      }
    },
    baseData: {
      type: Array,
      require: true,
      default() {
        return []
      }
    },
    row: {
      type: Number,
      require: true,
      default: 0
    },
    index: {
      type: Number,
      require: true,
      default: 0
    }
  },
  data() {
    return {
      halfTime: 0,
      conShow: false, // 控制左右拖动
      currentArr: [],
      nextArr: [],
      beforeArr: [],
      delShow: false,
      timerId: null,
      itemFlag: false,
      itemStart: { x: 0, y: 0, diff: 0 },
      itemClientStart: { x: 0, y: 0 },
      itemDiff: { x: 0, y: 0 },
      leftStart: { x: 0, y: 0 },
      leftDiff: { x: 0, y: 0 },
      rightStart: { x: 0, y: 0 },
      rightDiff: { x: 0, y: 0 },
      nextOffset: 0,
      delIcon: delIcon,
      styleObj: {
        left: 0,
        width: 0
      }
    }
  },
  mounted() {
    this.halfTime = (30 * this.maxWidth) / 1440
    this.currentArr = this.baseData[this.row].list
    this.nextArr = this.baseData[this.row + 1] ? this.baseData[this.row + 1].list : []
    if (this.row > 0) {
      this.beforeArr = this.baseData[this.row - 1].list
    } else {
      this.beforeArr = []
    }
  },
  methods: {
    showTeam(e, item) {
      this.conShow = true
      // console.log('e', e)
      if (this.timerId) {
        clearTimeout(this.timerId)
      }
      const obj = {}
      // const obj = this.sizeTobody(this.$refs.dragItem)
      obj.left = this.$refs.dragItem.getBoundingClientRect().left
      obj.top = this.$refs.dragItem.getBoundingClientRect().top
      obj.clientY = e.clientY
      // console.log('obj', obj)
      // this.$emit('getTeamInfo', true, obj)
      this.timerId = setTimeout(() => {
        this.$emit('getTeamInfo', true, obj, item)
      }, 800)
    },
    hideTeam() {
      clearTimeout(this.timerId)
      this.conShow = false
      this.$emit('getTeamInfo', false, { left: 0, top: 0 }, {})
    },

    itemMouseDown(e) {
      this.$emit('getTeamInfo', false, { left: 0, top: 0 }, {})
      this.conShow = false
      this.itemClientStart.x = e.clientX
      this.itemClientStart.y = e.clientY
      this.itemStart.diff = e.clientX - this.warpperSize.left - this.item.left
      // console.log('diff', this.itemStart.diff, 'clientX', e.clientX, 'warpperSize.left', this.warpperSize.left, 'left', this.item.left)
      this.itemStart.x = e.offsetX
      this.itemStart.y = e.offsetY
      this.$refs.dragItem.style.boxShadow = '3px 5px 5px rgb(0 0 0 / 27%)'
      this.$refs.dragItem.style.zIndex = 101
      document.addEventListener('mousemove', this.itemMouse)
      document.addEventListener('mouseup', this.itemMouseup)
    },
    itemMouse(e) {
      if (this.timerId) {
        clearTimeout(this.timerId)
      }
      // 显示父组件删除
      this.$emit('showRedDel', { row: this.row })
      this.conShow = false
      this.itemFlag = true
      this.$emit('getTeamInfo', false, { left: 0, top: 0 })
      // this.itemDiff.x = e.clientX - this.warpperSize.left - this.itemStart.x
      this.itemDiff.x = e.clientX - this.itemStart.diff - this.warpperSize.left
      // console.log('itemDiff', this.itemDiff.x)
      const currentArr = this.baseData[this.row].list
      let nextArr = []
      let beforeArr = []
      if (this.row !== this.baseData.length - 1) {
        // 不是最后一天
        nextArr = this.baseData[this.row + 1].list
      }
      if (this.row !== 0) {
        beforeArr = this.baseData[this.row - 1].list
      }
      // 最后一项 并且第二天有延长排班
      if (
        this.index === currentArr.length - 1 &&
        nextArr.length > 0 &&
        this.item.id === nextArr[0].id
      ) {
        console.log(this.item.id, this.baseData[this.row + 1].list[0].id)
        this.itemDiff.x = this.item.left
        // this.itemMouseup(e)
        this.$emit('hideLineAndThird')
        this.$emit('hideRedDel')
        this.itemFlag = false
        this.timerId = setTimeout(() => {
          this.$emit('hideLineAndThird')
          return ElMessage.warning('第二天有相同排班，不允许拖动')
        }, 200)
      }
      // 第一项且前一天最后一个为同一排班
      if (
        this.index === 0 &&
        beforeArr.length > 0 &&
        this.item.id === beforeArr[beforeArr.length - 1].id &&
        this.itemDiff.x > 0
      ) {
        this.itemDiff.x = this.item.left
        this.itemFlag = false
        // this.itemMouseup(e)
        this.$emit('hideLineAndThird')
        this.$emit('hideRedDel')
        this.timerId = setTimeout(() => {
          // this.$emit('hideLineAndThird')
          ElMessage.warning('上一天有相同排班，不允许拖动')
        }, 200)
        return
      }
      if (
        (this.itemDiff.x < 0 && Math.abs(this.itemDiff.x) >= this.item.width / 3) ||
        this.itemDiff.x > this.maxWidth - this.item.width + this.item.width / 5
      ) {
        this.delShow = true
        this.$refs.dragItem.style.cursor = 'none'
      } else {
        this.delShow = false
        this.$refs.dragItem.style.cursor = 'pointer'
      }
      // this.$refs.dragItem.style.zIndex = 1
      this.styleObj.left = this.itemDiff.x + 'px'
      // 触发移动线
      this.$emit('itemMove', { x: this.itemDiff.x, offset: this.item })
    },
    itemMouseup(e) {
      this.$emit('hideRedDel')
      this.$emit('hideLineAndThird')
      this.$emit('getTeamInfo', false, { left: 0, top: 0 }, {})
      const currentArr = this.baseData[this.row].list
      let nextArr = []
      let beforeArr = []
      this.$refs.dragItem.style.boxShadow = ''
      this.$refs.dragItem.style.zIndex = 1
      this.$refs.dragItem.style.cursor = 'pointer'
      document.removeEventListener('mousemove', this.itemMouse)
      document.removeEventListener('mouseup', this.itemMouseup)
      if (this.index === currentArr.length - 1) {
        // 最后一个
        if (this.row !== this.baseData.length - 1) {
          nextArr = this.baseData[this.row + 1].list
          if (nextArr.length > 0 && this.item.id === nextArr[0].id) {
            // alert(33)
            return
          }
        }
      }
      if (this.index === 0) {
        // 第一个
        if (this.row !== 0) {
          beforeArr = this.baseData[this.row - 1].list
          if (
            beforeArr.length > 0 &&
            this.item.id === beforeArr[beforeArr.length - 1].id &&
            this.itemDiff.x > this.item.left
          ) {
            return
          }
        }
      }
      if (Math.abs(e.clientX - this.itemClientStart.x) > 3) {
        // 防手抖
        if (this.itemFlag) {
          this.$emit('itemMouse', {
            x: this.itemDiff.x,
            row: this.row,
            index: this.index,
            offset: this.item
          })
        }
        // this.$emit('itemMouse', { x: this.itemDiff.x, row: this.row, index: this.index, offset: this.item})
      } else {
        this.styleObj.left = this.item.left + 'px'
      }
    },
    leftMouseDown(e) {
      this.$emit('getTeamInfo', false, { left: 0, top: 0 }, {})
      this.leftStart.x = e.clientX // 记录初始位置x
      this.leftStart.y = e.clientY // 记录初始位置y
      document.addEventListener('mousemove', this.leftMouseMove)
      document.addEventListener('mouseup', this.leftMouseUp)
    },
    leftMouseMove(e) {
      if (this.timerId) {
        clearTimeout(this.timerId)
      }
      this.$emit('getTeamInfo', false, { left: 0, top: 0 }, {}) // 隐藏团队详情框
      this.conShow = true
      this.leftDiff.x = e.clientX - this.leftStart.x // 计算差值x
      this.leftDiff.y = e.clientY - this.leftStart.y // 计算差值y
      // const currentArr = this.baseData[this.row].list
      // console.log('x', this.leftDiff.x, 'left', this.item.left)
      this.$emit('showLeftTimeData', { x: this.leftDiff.x, offset: this.item })
      // return
      let beforeArr = []
      if (this.row !== 0) {
        // 不是第一天
        beforeArr = this.baseData[this.row - 1].list
      }
      if (this.leftDiff.x < 0) {
        // 向左移动
        if (
          this.index === 0 &&
          beforeArr.length > 0 &&
          this.item.id === beforeArr[beforeArr.length - 1].id
        ) {
          this.leftDiff.x = 0
          this.$emit('hideLineAndThird')
          // return ElMessage.warning('上一天有相同排班，不允许拖动')
          this.timerId = setTimeout(() => {
            return ElMessage.warning('上一天有相同排班，不允许拖动')
          }, 200)
        }
        if (Math.abs(this.leftDiff.x) < this.item.leftMaxMove) {
          this.styleObj.width = this.item.width - this.leftDiff.x + 'px'
          this.styleObj.left = this.item.left + this.leftDiff.x + 'px'
        } else {
          this.styleObj.width = this.item.width + this.item.leftMaxMove + 'px'
          this.styleObj.left = this.item.left - this.item.leftMaxMove + 'px'
          this.leftDiff.x = -this.item.leftMaxMove
        }
      } else {
        // 向右做动
        if (
          this.index === 0 &&
          beforeArr.length > 0 &&
          this.item.id === beforeArr[beforeArr.length - 1].id
        ) {
          this.leftDiff.x = 0
          this.$emit('hideLineAndThird')
          // return ElMessage.warning('上一天有相同排班，不允许拖动')
          this.timerId = setTimeout(() => {
            return ElMessage.warning('上一天有相同排班，不允许拖动')
          }, 200)
        }
        if (this.item.width - this.leftDiff.x <= this.halfTime) {
          // 最小半小时边界
          // alert(1)
          this.styleObj.width = this.halfTime + 'px'
          this.styleObj.left = this.item.left + this.item.width - this.halfTime + 'px'
          this.leftDiff.x = this.item.width - this.halfTime
        } else {
          this.styleObj.width = this.item.width - this.leftDiff.x + 'px'
          this.styleObj.left = this.item.left + this.leftDiff.x + 'px'
        }
        // this.styleObj.width = this.item.width - this.leftDiff.x + 'px'
        // this.styleObj.left = this.item.left + this.leftDiff.x + 'px'

        // if (this.item.width - this.leftDiff.x <= this.oneHours / 2) {
        //   console.log(111)
        //   this.leftDiff.x = this.item.width - this.oneHours / 2
        //   this.styleObj.width = this.oneHours / 2 + 'px'
        //   // this.styleObj.left = this.item.left + this.leftDiff.x + 'px'
        // } else {
        //   // console.log(22)
        //   this.styleObj.width = this.item.width - this.leftDiff.x + 'px'
        //   this.styleObj.left = this.item.left + this.leftDiff.x + 'px'
        // }
        // this.styleObj.width = this.item.width - this.leftDiff.x + 'px'
        // this.styleObj.left = this.item.left + this.leftDiff.x + 'px'
      }
    },
    leftMouseUp(e) {
      this.$emit('hideRedDel')
      this.$emit('hideLineAndThird')
      this.$emit('getTeamInfo', false, { left: 0, top: 0 }, {})
      this.conShow = false
      let beforeArr = []
      if (this.row !== 0) {
        // 不是第一天
        beforeArr = this.baseData[this.row - 1].list
      }
      if (
        !(
          this.index === 0 &&
          beforeArr.length > 0 &&
          this.item.id === beforeArr[beforeArr.length - 1].id
        )
      ) {
        this.$emit('leftMove', {
          x: this.leftDiff.x,
          row: this.row,
          index: this.index,
          offset: this.item
        })
      }
      document.removeEventListener('mousemove', this.leftMouseMove)
      document.removeEventListener('mouseup', this.leftMouseUp)
    },
    rightMouseDown(e) {
      this.$emit('getTeamInfo', false, { left: 0, top: 0 }, {}) // 隐藏团队详情框
      this.rightStart.x = e.clientX // 记录初始值x
      this.rightStart.y = e.clientY // 记录初始值y
      document.addEventListener('mousemove', this.rightMouseMove)
      document.addEventListener('mouseup', this.rightMouseUp)
    },
    rightMouseMove(e) {
      if (this.timerId) {
        clearTimeout(this.timerId)
      }
      this.conShow = true
      this.$emit('getTeamInfo', false, { left: 0, top: 0 }, {})
      this.rightDiff.x = e.clientX - this.rightStart.x // 计算差值x
      this.rightDiff.y = e.clientY - this.rightStart.y // 计算差值y
      // console.log('width', this.item.width - this.leftDiff.x + this.rightDiff.x)
      // this.$emit('showRightTimeData', { x: this.rightDiff.x, offset: this.item, flag: false})
      const currentArr = this.baseData[this.row].list
      let nextArr = null
      if (this.row !== this.baseData.length - 1) {
        // 不是最后一天
        nextArr = this.baseData[this.row + 1].list
      }
      // console.log('rightDiffx', this.rightDiff.x)
      if (this.rightDiff.x < 0) {
        // 向左移动
        // console.log('item', this.item)
        if (this.row !== this.baseData.length - 1) {
          if (
            this.index === currentArr.length - 1 &&
            nextArr.length > 0 &&
            this.item.id === nextArr[0].id
          ) {
            // console.log(this.item.id, this.baseData[this.row + 1].list[0].id)
            this.rightDiff.x = 0
            this.$emit('hideLineAndThird')
            this.timerId = setTimeout(() => {
              return ElMessage.warning('第二天有相同排班，不允许拖动')
            }, 200)
            return
          }
        }
        // if (this.index === currentArr.length - 1 && nextArr.length > 0 && (this.item.id == nextArr[0].id)) {
        //   // console.log(this.item.id, this.baseData[this.row + 1].list[0].id)
        //   this.rightDiff.x = 0
        //   this.$emit('hideLineAndThird')
        //   this.timerId = setTimeout(() => {
        //     return ElMessage.warning('第二天有相同排班，不允许拖动')
        //   }, 200)
        //   return
        // }
        if (this.item.width + this.rightDiff.x <= this.halfTime) {
          // alert(1)
          this.styleObj.width = this.halfTime + 'px'
          this.styleObj.left = this.item.left + 'px'
          this.rightDiff.x = -(this.item.width - this.halfTime)
          this.$emit('showRightTimeData', { x: this.rightDiff.x, offset: this.item, flag: false })
          console.log('width', this.item.width, 'rightX', this.rightDiff.x)
        } else {
          this.styleObj.width = this.item.width + this.rightDiff.x + 'px'
          this.styleObj.left = this.item.left + 'px'
          this.$emit('showRightTimeData', { x: this.rightDiff.x, offset: this.item, flag: false })
        }

        // if (this.item.width <= this.oneHours / 2) {
        //   this.rightDiff.x = 0
        //   return
        // }
        // if (this.item.width + this.rightDiff.x <= this.oneHours / 2) {
        //   console.log(111)
        //   this.styleObj.width = this.oneHours / 2 + 'px'
        //   this.styleObj.left = this.item.left + 'px'
        //   this.rightDiff.x = -this.item.width - this.oneHours / 2
        // } else {
        //   this.styleObj.width = this.item.width + this.rightDiff.x + 'px'
        //   this.styleObj.left = this.item.left + 'px'
        // }
        // this.styleObj.width = this.item.width + this.rightDiff.x + 'px'
        // this.styleObj.left = this.item.left + 'px'
      } else {
        // 向右移动
        // if (this.row != this.baseData.length - 1) { // 不是最后一天
        if (this.index === currentArr.length - 1) {
          // 单天最后一个排班
          if (this.rightDiff.x <= this.item.rightMaxMove) {
            // 没超过最大拖动
            this.styleObj.width = this.item.width + this.rightDiff.x + 'px'
            this.nextOffset = 0
            this.$emit('showRightTimeData', { x: this.rightDiff.x, offset: this.item, flag: false })
          } else {
            // 超过最大拖动
            if (nextArr.length > 0) {
              // 第二天有多个排班
              if (nextArr[0].left > 0) {
                // 第一个排班左边有空隙
                if (this.rightDiff.x < this.item.rightMaxMove + nextArr[0].left) {
                  this.nextOffset = this.rightDiff.x - this.item.rightMaxMove
                  this.$emit('dragBase', this.nextOffset, this.row, this.item.background)
                  this.$emit('showRightTimeData', {
                    x: this.nextOffset,
                    offset: this.item,
                    flag: true
                  })
                } else {
                  this.nextOffset = nextArr[0].left
                  this.$emit('dragBase', this.nextOffset, this.row, this.item.background)
                  this.$emit('showRightTimeData', {
                    x: this.nextOffset,
                    offset: this.item,
                    flag: true
                  })
                }
              }
            } else {
              // 第二天没有排班
              this.nextOffset = this.rightDiff.x - this.item.rightMaxMove
              if (this.nextOffset >= this.maxWidth) {
                this.nextOffset = this.maxWidth
              }
              this.$emit('dragBase', this.nextOffset, this.row)
              this.$emit('showRightTimeData', { x: this.nextOffset, offset: this.item, flag: true })
            }
          }
        } else {
          if (this.rightDiff.x <= this.item.rightMaxMove) {
            this.styleObj.width = this.item.width + this.rightDiff.x + 'px'
            this.styleObj.left = this.item.left + 'px'
            this.$emit('showRightTimeData', { x: this.rightDiff.x, offset: this.item, flag: false })
          } else {
            this.rightDiff.x = this.item.rightMaxMove
            this.styleObj.width = this.item.width + this.rightDiff.x + 'px'
            this.styleObj.left = this.item.left + 'px'
            this.$emit('showRightTimeData', { x: this.rightDiff.x, offset: this.item, flag: false })
          }
        }
        // }
      }
      // this.$emit('showRightTimeData', { x: this.rightDiff.x, offset: this.item, flag: false})
    },
    rightMouseUp(e) {
      this.$emit('hideRedDel')
      this.$emit('hideLineAndThird')
      this.$emit('getTeamInfo', false, { left: 0, top: 0 }, {})
      this.conShow = false
      const currentArr = this.baseData[this.row].list
      let nextArr = null
      if (this.row !== this.baseData.length - 1) {
        // 不是最后一天
        nextArr = this.baseData[this.row + 1].list
        // console.log('nextArr', nextArr)
      }
      document.removeEventListener('mousemove', this.rightMouseMove)
      document.removeEventListener('mouseup', this.rightMouseUp)
      if (this.rightDiff.x >= this.item.rightMaxMove) {
        this.rightDiff.x = this.item.rightMaxMove
      }
      if (this.index === currentArr.length - 1 && this.row === this.baseData.length - 1) {
        this.$emit('rightMove', {
          x: Math.ceil(this.rightDiff.x),
          nextL: this.nextOffset,
          row: this.row,
          index: this.index,
          offset: this.item
        })
      }
      // if (!(this.index === currentArr.length - 1 && nextArr.length>0 && (this.item.id == nextArr[0].id))) {
      if (
        !(
          this.index === currentArr.length - 1 &&
          nextArr.length > 0 &&
          this.item.id === nextArr[0].id
        )
      ) {
        this.$emit('rightMove', {
          x: Math.ceil(this.rightDiff.x),
          nextL: this.nextOffset,
          row: this.row,
          index: this.index,
          offset: this.item
        })
      }
    },
    updateCardInfo(id) {
      this.$emit('updateCardInfo', id, this.item)
    },
    sizeTobody(ele) {
      let totallLeft = null
      let totalTop = null
      let par = ele.offsetParent
      totallLeft += ele.offsetLeft
      totalTop += ele.offsetTop
      while (par) {
        totallLeft += par.clientLeft
        totalTop += par.clientTop
        totallLeft += par.offsetLeft
        totalTop += par.offsetTop
        par = par.offsetParent
      }
      return { left: totallLeft, top: totalTop }
    }
  },
  computed: {
    itemStyle() {
      const obj = {
        width: this.item.width + 'px',
        left: this.item.left + 'px',
        border: `1px solid ${this.item.background}`,
        'border-left':
          this.index === 0 &&
          this.beforeArr.length > 0 &&
          this.item.id === this.beforeArr[this.beforeArr.length - 1].id
            ? 'none'
            : ''
        // 'top': this.item.top + 'px',
      }
      if (this.styleObj.left) {
        obj.left = this.styleObj.left
      }
      if (this.styleObj.width) {
        obj.width = this.styleObj.width
      }
      return obj
    },

    borderStyle() {
      return {
        'border-left':
          this.index === 0 &&
          this.beforeArr.length > 0 &&
          this.item.id === this.beforeArr[this.beforeArr.length - 1].id
            ? 'none'
            : `6px solid ${this.item.background}`
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@keyframes shanke {
  from {
    transform: translateY(-1px);
  }
  to {
    transform: translateY(1px);
  }
}
.del-a {
  animation: shanke 0.4s cubic-bezier(0.77, -0.71, 0.41, 1.71) infinite;
}
.flex {
  display: flex;
}
.border-radius-0 {
  border-radius: 0px 4px 4px 0px !important;
}
.no-avatar {
  width: 25px;
  height: 25px;
  background: #6647ff;
  color: #fff;
  border-radius: 13px;
}
.f-12 {
  font-size: 12px !important;
}
.col {
  flex-direction: column;
}
.just-center {
  justify-content: center;
}
.just-end {
  justify-content: flex-end;
}
.just-a {
  justify-content: space-around;
}
.just-b {
  justify-content: space-between;
}
.align-center {
  align-items: center;
}
.m-left-1 {
  margin-left: -1px;
}
.m-left-5 {
  margin-left: 5px;
}
.m-left-14 {
  margin-left: 14px;
}
.m-right-5 {
  margin-right: 3px;
}
.m-right-7 {
  margin-right: 7px;
}
.line-hidden {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.drag-item {
  position: absolute;
  z-index: 10;
  user-select: none;
  img {
    user-select: none;
  }
  // border-left: 6px solid #6647ff;
  // box-sizing: border-box;
  // padding: 6px 8px 6px 0px;
  height: 82px;
  border-radius: 4px;
  // overflow: hidden;
  // top: 50%;
  top: 0;
  // overflow: hidden;
  cursor: pointer;
  // transform: translateY(-50%);
  background: #fff;
  box-shadow: 0px 2px 8px 0px rgba(20, 21, 21, 0.1);
  // background: #f2f2f2;
}
:hover {
  .left-img,
  .right-img {
    opacity: 1;
  }
}
.del-icon {
  position: absolute;
  width: 22px;
  bottom: 10px;
  height: 22px;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  // background-image: url('@/assets/images/schedule/del-icon.png');
  // background-size: 100% 100%;
  background: url('~@/assets/images/schedule/del-icon.png') rgba(250, 115, 115, 0.8) no-repeat
    center center;
  border-radius: 50%;
  background-size: 60% 60%;
}
.message-warpper {
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 8px 6px 0px;
  border-left: 6px solid #6647ff;
  .is-sure {
    width: calc(100% - 30px);
    padding: 0 8px;
    padding-left: 13px;
    position: absolute;
    right: 0;
    top: 20px;
    z-index: 100;
    transform: translateY(-10px);
    // overflow: hidden;
    .team-title {
      color: #303133;
      font-size: 14px;
      text-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
    }
  }
  .sure-btn {
    width: 70px;
    height: 20px;
    padding: 0 2px;
    border-radius: 4px;
    border: 1px solid #0082ff;
    .sub-title {
      font-size: 13px;
      color: #0082ff;
    }
    .sure-point {
      width: 12px;
      height: 12px;
      border-radius: 9px;
      background: #0082ff;
    }
  }
  .team-info {
    // margin-top: 52px;
    margin-top: 36px;
    margin-left: 8px;
    .team-title {
      font-size: 16px;
      color: #303133;
      margin-bottom: 5px;
    }
    .time-team {
      margin-bottom: 8px;
      .time-cont {
        position: relative;
        color: #303133;
        font-size: 16px;
        padding: 3px 7px;
        background: #f2f3f5;
        .clock {
          width: 20px;
          position: absolute;
          bottom: -3px;
          right: -3px;
          // width: 1px;
        }
      }
      .t-split {
        margin: 0 4px;
      }
    }
    .people {
      flex: 1;
      overflow: hidden;
      height: 30px;
      .s-small {
        width: 100%;
        position: relative;
        div {
          position: absolute;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          text-align: center;
          line-height: 25px;
          color: #fff;
        }
        img {
          width: 25px;
          height: 25px;
          border-radius: 50%;
        }
      }
    }
    // .people {
    //   width: 26px;
    //   height: 26px;
    //   background: #6647ff;
    //   text-align: center;
    //   line-height: 26px;
    //   border-radius: 13px;
    //   color: #fff;
    //   font-size: 15px;
    //   font-weight: 550;
    // }
  }
}
.small {
  height: 100%;
  overflow: hidden;
  // background: red;
  box-sizing: border-box;
  padding: 6px 8px 6px 0px;
  border-left: 6px solid #6647ff;
  box-shadow: 0px 2px 8px 0px rgba(20, 21, 21, 0.1);
  border-radius: 4px;
}
.large {
  // overflow: hidden;
  height: 100%;
  border-left: 6px solid #6647ff;
  box-sizing: border-box;
  padding: 6px 8px 6px 0px;
  border-radius: 4px;
  box-shadow: 0px 2px 8px 0px rgba(20, 21, 21, 0.1);
  .l-is-sure {
    width: 100%;
    padding-left: 6px;
    margin-top: 4px;
    z-index: 100;
    .team-title {
      font-size: 14px;
      color: #303133;
      width: 70px;
      height: 20px;
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sure-btn {
      padding: 2px 8px;
      box-shadow: 0px 2px 8px 0px rgba(20, 21, 21, 0.1);
      border-radius: 10px;
      border: 1px solid #0082ff;
      .sure-text {
        font-size: 13px;
        height: 18px;
        line-height: 18px;
      }
      .sure-point {
        width: 14px;
        height: 14px;
        background: #0082ff;
        border-radius: 7px;
        margin-left: 5px;
      }
    }
  }
  .l-imgs {
    padding-left: 6px;
    margin-top: 20px;
    overflow: hidden;
    width: 100%;
    .time-cont {
      position: relative;
      color: #303133;
      font-size: 16px;
      padding: 3px 7px;
      background: #f2f3f5;
      .clock {
        width: 20px;
        position: absolute;
        bottom: -3px;
        right: -3px;
        // width: 1px;
      }
    }
    .t-split {
      margin: 0 4px;
      img {
        width: 14px;
      }
    }
    .s-img {
      width: 25px;
      .l-s-img {
        width: 25px;
        height: 25px;
        overflow: hidden;
        &.l1 {
          transform: translateX(-10px);
        }
      }

      &.i-bg {
        background: #4ecb73;
        height: 25px;
        width: 25px;
        color: #fff;
        border-radius: 100%;
      }
    }
    img {
      width: 25px;
      border-radius: 100%;
    }
  }
}

.middle {
  width: 100%;
  overflow: hidden;
  height: 100%;
  border-left: 6px solid #6647ff;
  box-sizing: border-box;
  padding: 6px 8px 6px 0px;
  border-radius: 4px;
  box-shadow: 0px 2px 8px 0px rgba(20, 21, 21, 0.1);
  .middle-sure {
    transform: translateY(6px);
    font-size: 13px;
  }
  .count-img {
    // width: 60%;
    margin-top: 10px;
    position: relative;
    .middle-avater {
      // width: 100%;
      width: 40px;
      height: 49px;
      background: url('~@/assets/images/schedule/people.png');
    }
    .middle-count {
      position: absolute;
      left: 50%;
      text-align: center;
      font-size: 14px;
      opacity: 0.8;
      transform: translateX(-50%);
      bottom: 8px;
      color: #fff;
      text-shadow: 0px 2px 8px rgba(20, 21, 21, 0.1);
    }
  }
}
.is-sure {
  cursor: pointer;
}
.point {
  position: absolute;
  width: 10%;
  height: 100%;
  box-sizing: border-box;
  opacity: 1;
  background: transparent;
  // background: tan;
  z-index: 10;
  cursor: e-resize;
  &.left {
    left: 0px;
    top: 0px;
  }
  &.right {
    right: 0px;
    top: 0px;
  }
}
.left-img {
  opacity: 0;
  z-index: 100000;
  transition: all 0.3s;
  position: absolute;
  // cursor: e-resize;
  cursor: col-resize;
  top: -1px;
  left: -6px;
  height: 84px;
  background: $theme_color;
  width: 6px;
  border-radius: 6px 0px 0px 6px;
  .line {
    width: 1px;
    height: 22px;
    background: #fff;
  }
}
.right-img {
  opacity: 0;
  z-index: 100000;
  transition: all 0.3s;
  position: absolute;
  cursor: col-resize;
  top: -1px;
  right: -1px;
  height: 84px;
  background: $theme_color;
  width: 6px;
  border-radius: 0px 6px 6px 0px;
  .line {
    width: 1px;
    height: 22px;
    background: #fff;
  }
}
.smart {
  font-size: 16px;
  &.active {
    color: $theme_color;
  }
}
</style>
